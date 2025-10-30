import { Effect } from "effect";
import { ConversationService } from "./conversation.service";

export const makeConversationRpcHandlers = Effect.gen(function* () {
  const conversationService = yield* ConversationService;

  return {
    createConversation: () =>
      conversationService
        .createConversation()
        .pipe(Effect.withSpan("conversation.rpc.createConversation")),
    sendUserMessage: (request: any) =>
      conversationService.sendUserMessage(request).pipe(
        Effect.withSpan("conversation.rpc.sendUserMessage", {
          attributes: { "conversation.id": request.conversationId },
        })
      ),
  } as const;
});
