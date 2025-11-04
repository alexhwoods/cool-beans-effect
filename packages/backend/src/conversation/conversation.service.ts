import { Context, Effect, Layer, Ref, Schema, Stream } from "effect";
import { AiError, LanguageModel } from "@effect/ai";
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
  const historiesRef = yield* Ref.make(new Map<number, AiResponseChunk[]>());

  return ConversationService.of({
    createConversation: () =>
      Effect.gen(function* () {
        const current = yield* Ref.get(nextIdRef);
        yield* Ref.set(nextIdRef, current + 1);
        // initialize empty history
        const histories = yield* Ref.get(historiesRef);
        histories.set(current, []);
        yield* Ref.set(historiesRef, histories);
        return new CreateConversationResponse({ id: current });
      }).pipe(Effect.withSpan("conversation.service.createConversation")),

    sendUserMessage: (request: SendUserMessageRequest) =>
      Stream.unwrap(
        Effect.gen(function* () {
          const histories = yield* Ref.get(historiesRef);
          const existing = histories.get(request.conversationId);
          if (!existing) {
            return yield* Effect.fail(
              new ConversationNotFound({ id: request.conversationId })
            );
          }

          // Generate a coffee suggestion using structured output
          const CoffeeSuggestionSchema = Schema.Struct(CoffeeSuggestion.fields);

          const response = yield* languageModel.generateObject({
            prompt: request.message,
            schema: CoffeeSuggestionSchema,
          });

          const suggestion = new CoffeeSuggestion(response.value);
          return Stream.fromIterable([
            new AiResponseChunk({ response: suggestion }),
          ]);
        }).pipe(
          Effect.withSpan("conversation.service.sendUserMessage", {
            attributes: { "conversation.id": (request as any).conversationId },
          })
        )
      ),
  });
}).pipe(Layer.effect(ConversationService));
