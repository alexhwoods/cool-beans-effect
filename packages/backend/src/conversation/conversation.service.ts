import { Context, Effect, Layer, Ref } from "effect";
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
    ) => Effect.Effect<SendUserMessageResponse, ConversationNotFound>;
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
      Effect.gen(function* () {
        const histories = yield* Ref.get(historiesRef);
        const existing = histories.get(request.conversationId);
        if (!existing) {
          yield* Effect.fail(
            new ConversationNotFound({ id: request.conversationId })
          );
        }

        const updated = existing ? [...existing] : [];
        updated.push(
          new ConversationMessage({ sender: "user", message: request.message })
        );

        // Simple placeholder AI reply
        const aiReply = new ConversationMessage({
          sender: "ai",
          message: `Got it. You said: "${request.message}"`,
        });
        updated.push(aiReply);

        histories.set(request.conversationId, updated);
        yield* Ref.set(historiesRef, histories);

        return new SendUserMessageResponse({ messages: updated });
      }).pipe(
        Effect.withSpan("conversation.service.sendUserMessage", {
          attributes: { "conversation.id": (request as any).conversationId },
        })
      ),
  });
}).pipe(Layer.effect(ConversationService));
