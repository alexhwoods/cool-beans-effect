import { Context, Effect, Layer, Ref, Schema, Stream } from "effect";
import { AiError, Chat, LanguageModel } from "@effect/ai";
import {
  AiResponseChunk,
  CoffeeSuggestion,
  ConversationNotFound,
  CreateConversationResponse,
  SendUserMessageRequest,
  SendUserMessageResponse,
} from "@cool-beans/shared";

export class ConversationService extends Context.Tag("ConversationService")<
  ConversationService,
  {
    readonly createConversation: () => Effect.Effect<CreateConversationResponse>;
    readonly sendUserMessage: (
      request: SendUserMessageRequest
    ) => Stream.Stream<AiResponseChunk, ConversationNotFound | AiError.AiError>;
  }
>() {}

export const ConversationServiceLive = Effect.gen(function* () {
  const languageModel = yield* LanguageModel.LanguageModel;
  const nextIdRef = yield* Ref.make(1);
  const chatsRef = yield* Ref.make(new Map<number, Chat.Service>());

  return ConversationService.of({
    createConversation: () =>
      Effect.gen(function* () {
        const current = yield* Ref.get(nextIdRef);
        yield* Ref.set(nextIdRef, current + 1);

        // Create a new Chat instance for this conversation
        // Chat.empty creates a Chat with empty history
        // We need to provide LanguageModel so Chat can initialize properly
        const chat = yield* Chat.empty.pipe(
          Effect.provide(
            Layer.succeed(LanguageModel.LanguageModel, languageModel)
          )
        );

        // Store the chat in the map
        const chats = yield* Ref.get(chatsRef);
        chats.set(current, chat);
        yield* Ref.set(chatsRef, chats);

        return new CreateConversationResponse({ id: current });
      }).pipe(
        Effect.withSpan("conversation.service.createConversation"),
        Effect.provide(
          Layer.succeed(LanguageModel.LanguageModel, languageModel)
        )
      ),

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

          // Generate a coffee suggestion using structured output
          // Chat.generateObject automatically maintains conversation history
          const CoffeeSuggestionSchema = Schema.Struct(CoffeeSuggestion.fields);

          const response = yield* chat
            .generateObject({
              prompt: request.message,
              schema: CoffeeSuggestionSchema,
            })
            .pipe(
              Effect.provide(
                Layer.succeed(LanguageModel.LanguageModel, languageModel)
              )
            );

          // Chat.generateObject returns response.object which contains the parsed structured output
          // The object is already validated against the schema by the LanguageModel
          // We need to access it correctly - it might be response.object or response.value
          const responseObject =
            (response as any).object || (response as any).value;

          // Validate and decode using Schema to ensure all fields are present
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
          Effect.provide(
            Layer.succeed(LanguageModel.LanguageModel, languageModel)
          )
        )
      ),
  });
}).pipe(Layer.effect(ConversationService));
