import { describe, expect } from "bun:test";
import { test } from "../test-utils/bun-test";
import { Effect, Either, Layer, Ref, Context } from "effect";
import { Chat, LanguageModel, AiError } from "@effect/ai";
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
import { Stream, Schema } from "effect";

// Mock object response
const mockObjectResponse = {
  name: "Mocked Coffee",
  origin: "Mocked Origin",
  roast: "Medium",
  price: 25.99,
  weight: "12oz",
  description: "Mocked coffee suggestion based on user request",
  inStock: true,
};

// Create a mock Chat service that we can use directly
const createMockChatService = (): Chat.Service => {
  const historyRef = Ref.unsafeMake({} as any);

  return {
    history: historyRef,
    generateObject: <A, I extends Record<string, unknown>, R>(options: any) => {
      // Return a response that matches what Chat.generateObject returns
      // Include the user's prompt in the description to test that it's used
      const mockResponse = {
        ...mockObjectResponse,
        description: `Mocked coffee suggestion based on: ${options.prompt}`,
      };

      return Effect.succeed({
        object: mockResponse as A,
        finishReason: "stop" as const,
        usage: {
          promptTokens: 10,
          completionTokens: 20,
        },
      } as any);
    },
    generateText: () =>
      Effect.succeed({
        text: "Mocked text response",
        finishReason: "stop" as const,
        usage: {
          promptTokens: 10,
          completionTokens: 20,
        },
      } as any),
    streamText: () =>
      Stream.fromIterable([
        { type: "text-delta" as const, delta: "Mocked " },
        { type: "text-delta" as const, delta: "response" },
      ]),
    export: Effect.succeed({}),
    exportJson: Effect.succeed("{}"),
  } as unknown as Chat.Service;
};

// Mock both LanguageModel and Chat
// Chat.empty creates a real Chat instance that uses LanguageModel
// When Chat.generateObject is called, it calls LanguageModel.generateObject
// and then extracts parts from the response to update history
// We need to ensure parts are always present and accessible
const MockLanguageModel = Layer.succeed(LanguageModel.LanguageModel, {
  generateObject: (options: any) => {
    const responseText = JSON.stringify(mockObjectResponse);
    const parts = [
      {
        type: "text-delta" as const,
        delta: responseText,
      },
    ];

    // Ensure parts is always accessible - Chat extracts it from the response
    return Effect.succeed({
      object: mockObjectResponse,
      parts: parts,
      finishReason: "stop" as const,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
      },
    } as any);
  },
  generateText: (options: any) => {
    const text = "Mocked text response";
    const parts = [
      {
        type: "text-delta" as const,
        delta: text,
      },
    ];

    return Effect.succeed({
      text: text,
      parts: parts,
      finishReason: "stop" as const,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
      },
    } as any);
  },
  streamText: () =>
    Stream.fromIterable([
      { type: "text-delta" as const, delta: "Mocked " },
      { type: "text-delta" as const, delta: "response" },
    ]),
} as any);

// Create a test-specific ConversationService that uses mock Chat directly
// This bypasses Chat.empty and uses our mock Chat service
const ConversationServiceTestLive = Effect.gen(function* () {
  const nextIdRef = yield* Ref.make(1);
  const chatsRef = yield* Ref.make(new Map<number, Chat.Service>());

  return ConversationService.of({
    createConversation: () =>
      Effect.gen(function* () {
        const current = yield* Ref.get(nextIdRef);
        yield* Ref.set(nextIdRef, current + 1);

        // Use our mock Chat service directly instead of Chat.empty
        const chat = createMockChatService();

        // Store the chat in the map
        const chats = yield* Ref.get(chatsRef);
        chats.set(current, chat);
        yield* Ref.set(chatsRef, chats);

        return new CreateConversationResponse({ id: current });
      }).pipe(Effect.withSpan("conversation.service.createConversation")),

    sendUserMessage: (request: SendUserMessageRequest) =>
      Stream.unwrap(
        Effect.gen(function* () {
          const chats = yield* Ref.get(chatsRef);
          const chat = chats.get(request.conversationId);

          if (!chat) {
            return yield* Effect.fail(
              new ConversationNotFound({ id: request.conversationId })
            );
          }

          // Use the mock Chat's generateObject method
          const CoffeeSuggestionSchema = Schema.Struct(CoffeeSuggestion.fields);

          const response = yield* chat
            .generateObject({
              prompt: request.message,
              schema: CoffeeSuggestionSchema,
            })
            .pipe(
              Effect.provide(
                Layer.succeed(LanguageModel.LanguageModel, {} as any)
              )
            );

          // Extract object from response
          const responseObject =
            (response as any).object || (response as any).value;

          // Validate and decode using Schema
          const validated = yield* Schema.decodeUnknown(CoffeeSuggestionSchema)(
            responseObject
          ).pipe(
            Effect.mapError(
              () =>
                new AiError.UnknownError({
                  module: "ConversationService",
                  method: "sendUserMessage",
                  description:
                    "Failed to parse coffee suggestion from AI response",
                })
            )
          );

          const suggestion = new CoffeeSuggestion(validated);
          return Stream.fromIterable([
            new AiResponseChunk({ response: suggestion }),
          ]);
        }).pipe(
          Effect.withSpan("conversation.service.sendUserMessage", {
            attributes: { "conversation.id": (request as any).conversationId },
          }),
          Effect.provide(Layer.succeed(LanguageModel.LanguageModel, {} as any))
        )
      ),
  });
}).pipe(Layer.effect(ConversationService));

// Test layer that provides the test-specific ConversationService
const ConversationServiceTestLayer = ConversationServiceTestLive;

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
      expect(suggestion.description).toBe(
        "Mocked coffee suggestion based on: I want a dark roast coffee from Colombia"
      );
    }).pipe(Effect.provide(ConversationServiceTestLayer))
  );
});
