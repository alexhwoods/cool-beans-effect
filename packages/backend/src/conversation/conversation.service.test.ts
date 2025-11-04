import { describe, expect } from "bun:test";
import { test } from "../test-utils/bun-test";
import { Effect, Either, Layer } from "effect";
import { LanguageModel } from "@effect/ai";
import {
  ConversationService,
  ConversationServiceLive,
} from "./conversation.service";
import {
  CreateConversationResponse,
  SendUserMessageRequest,
  AiResponseChunk,
  ConversationNotFound,
  CoffeeSuggestion,
} from "@cool-beans/shared";
import { Stream } from "effect";

// Mock LanguageModel implementation
const mockLanguageModelImpl = {
  generateObject: (options: { prompt: string; schema: any }) =>
    Effect.succeed({
      value: {
        name: "Mocked Coffee",
        origin: "Mocked Origin",
        roast: "Medium",
        price: 25.99,
        weight: "12oz",
        description: `Mocked coffee suggestion based on: ${options.prompt}`,
        inStock: true,
      },
      finishReason: "stop" as const,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
      },
    }),
} as unknown as LanguageModel.LanguageModel;

// Mock LanguageModel layer
const MockLanguageModel = Layer.succeed(
  LanguageModel.LanguageModel,
  mockLanguageModelImpl as any
);

// Test layer that provides ConversationService with mocked LanguageModel
const ConversationServiceTestLayer = ConversationServiceLive.pipe(
  Layer.provide(MockLanguageModel)
);

describe("ConversationService", () => {
  test.effect("can create a conversation", () =>
    Effect.gen(function* () {
      // Arrange & Act
      const conversationService = yield* ConversationService;
      const result = yield* Effect.either(
        conversationService.createConversation()
      );

      // Assert
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        const response = result.right;
        expect(response).toBeInstanceOf(CreateConversationResponse);
        expect(response.id).toBeGreaterThan(0);
        expect(typeof response.id).toBe("number");
      }
    }).pipe(Effect.provide(ConversationServiceTestLayer))
  );

  test.effect("can create multiple conversations with unique IDs", () =>
    Effect.gen(function* () {
      // Arrange & Act
      const conversationService = yield* ConversationService;
      const result1 = yield* conversationService.createConversation();
      const result2 = yield* conversationService.createConversation();

      // Assert
      expect(result1.id).not.toBe(result2.id);
      expect(result2.id).toBe(result1.id + 1);
    }).pipe(Effect.provide(ConversationServiceTestLayer))
  );

  test.effect("can send a user message to an existing conversation", () =>
    Effect.gen(function* () {
      // Arrange
      const conversationService = yield* ConversationService;
      const conversation = yield* conversationService.createConversation();
      const request: SendUserMessageRequest = {
        conversationId: conversation.id,
        message: "Hello, I need coffee recommendations",
      };

      // Act
      const chunks = yield* Stream.runCollect(
        conversationService.sendUserMessage(request)
      );

      // Assert
      const chunksArray = Array.from(chunks);
      expect(chunksArray.length).toBeGreaterThan(0);
      const firstChunk = chunksArray[0];
      expect(firstChunk).toBeInstanceOf(AiResponseChunk);
      expect(firstChunk.response).toBeInstanceOf(CoffeeSuggestion);
    }).pipe(Effect.provide(ConversationServiceTestLayer))
  );

  test.effect("fails when sending message to non-existent conversation", () =>
    Effect.gen(function* () {
      // Arrange
      const conversationService = yield* ConversationService;
      const request: SendUserMessageRequest = {
        conversationId: 99999, // Non-existent ID
        message: "Hello",
      };

      // Act
      const result = yield* Effect.either(
        Stream.runCollect(conversationService.sendUserMessage(request))
      );

      // Assert
      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left).toBeInstanceOf(ConversationNotFound);
        if (result.left instanceof ConversationNotFound) {
          expect(result.left.id).toBe(99999);
        }
      }
    }).pipe(Effect.provide(ConversationServiceTestLayer))
  );

  test.effect("uses mocked language model to generate coffee suggestion", () =>
    Effect.gen(function* () {
      // Arrange
      const conversationService = yield* ConversationService;
      const conversation = yield* conversationService.createConversation();
      const request: SendUserMessageRequest = {
        conversationId: conversation.id,
        message: "I want a dark roast coffee from Colombia",
      };

      // Act
      const chunks = yield* Stream.runCollect(
        conversationService.sendUserMessage(request)
      );

      // Assert
      const chunksArray = Array.from(chunks);
      expect(chunksArray.length).toBeGreaterThan(0);
      const firstChunk = chunksArray[0];
      expect(firstChunk).toBeInstanceOf(AiResponseChunk);
      expect(firstChunk.response).toBeInstanceOf(CoffeeSuggestion);

      // Verify the mocked coffee suggestion was generated
      const suggestion = firstChunk.response as CoffeeSuggestion;
      expect(suggestion.name).toBe("Mocked Coffee");
      expect(suggestion.description).toContain(
        "I want a dark roast coffee from Colombia"
      );
    }).pipe(Effect.provide(ConversationServiceTestLayer))
  );
});
