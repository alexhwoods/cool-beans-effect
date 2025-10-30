import { Context, Effect, Layer, Ref, Stream, Random } from "effect";
import {
  ConversationMessage,
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
    ) => Stream.Stream<ConversationMessage, ConversationNotFound>;
  }
>() {}

export const ConversationServiceLive = Effect.gen(function* () {
  const nextIdRef = yield* Ref.make(1);
  const historiesRef = yield* Ref.make(
    new Map<number, ConversationMessage[]>()
  );

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

          const userMsg = new ConversationMessage({
            sender: "user",
            message: request.message,
          });

          const aiMsg = new ConversationMessage({
            sender: "ai",
            message: `Got it. You said: "${request.message}"`,
          });

          // Persist to history eagerly
          const updated = [...existing, userMsg, aiMsg];
          histories.set(request.conversationId, updated);
          yield* Ref.set(historiesRef, histories);

          // Build streaming AI reply word-by-word (accumulated)
          const words = aiMsg.message.split(" ");
          const aiStream = Stream.fromIterable(words).pipe(
            Stream.tap(() =>
              Effect.gen(function* () {
                const delay = yield* Random.nextIntBetween(1, 10);
                yield* Effect.sleep(`${delay * 50} millis`);
              })
            ),
            Stream.map(
              (word) => new ConversationMessage({ sender: "ai", message: word })
            )
          );

          return Stream.fromIterable([userMsg]).pipe(Stream.concat(aiStream));
        }).pipe(
          Effect.withSpan("conversation.service.sendUserMessage", {
            attributes: { "conversation.id": (request as any).conversationId },
          })
        )
      ),
  });
}).pipe(Layer.effect(ConversationService));
