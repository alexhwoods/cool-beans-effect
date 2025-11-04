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
  generateText: (options: { prompt: string }) =>
    Effect.succeed({
      text: `Mocked response for: ${options.prompt}`,
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

  test.effect("uses mocked language model to generate text", () =>
    Effect.gen(function* () {
      // Arrange
      const conversationService = yield* ConversationService;
      const conversation = yield* conversationService.createConversation();
      const request: SendUserMessageRequest = {
        conversationId: conversation.id,
        message: "Test message",
      };

      // Act
      yield* Stream.runCollect(conversationService.sendUserMessage(request));

      // The test verifies that the service successfully calls the mocked
      // LanguageModel.generateText method without throwing an error.
      // In a real scenario, you might want to verify the mocked response
      // was used, but the current implementation doesn't expose that.
    }).pipe(Effect.provide(ConversationServiceTestLayer))
  );
});
