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
      conversationService.sendUserMessage(request),
  } as const;
});
