import { Context, Effect, Layer, Ref, Stream, Random } from "effect";
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
    ) => Stream.Stream<AiResponseChunk, ConversationNotFound>;
  }
>() {}

export const ConversationServiceLive = Effect.gen(function* () {
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

          // const response = `Got it. You said: "${request.message}"`;

          // // Build streaming AI reply word-by-word (accumulated)
          // const words = response.split(" ");
          // return Stream.fromIterable(words).pipe(
          //   Stream.tap(() =>
          //     Effect.gen(function* () {
          //       const delay = yield* Random.nextIntBetween(1, 10);
          //       yield* Effect.sleep(`${delay * 50} millis`);
          //     })
          //   ),
          //   Stream.map((word) => new AiResponseChunk({ response: word }))
          // );

          const suggestion = new CoffeeSuggestion({
            name: "Kenya AA",
            origin: "Kenya",
            roast: "Medium",
            price: 27.99,
            weight: "12oz",
            description: "Bright acidity with berry and wine-like notes",
            inStock: true,
          });
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
