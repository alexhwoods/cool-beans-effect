import { Effect, Stream } from "effect";
import { ConversationService } from "./conversation.service";
import { ConversationNotFound } from "@cool-beans/shared";

export const makeConversationRpcHandlers = Effect.gen(function* () {
  const conversationService = yield* ConversationService;

  return {
    createConversation: () =>
      conversationService
        .createConversation()
        .pipe(Effect.withSpan("conversation.rpc.createConversation")),
    sendUserMessage: (request: any) =>
      conversationService.sendUserMessage(request).pipe(
        Stream.catchAll((error) => {
          // Convert all AiError types to ConversationNotFound to match RPC schema
          if (
            error._tag === "HttpRequestError" ||
            error._tag === "HttpResponseError" ||
            error._tag === "MalformedInput" ||
            error._tag === "MalformedOutput" ||
            error._tag === "UnknownError"
          ) {
            return Stream.fail(
              new ConversationNotFound({
                id: request.conversationId,
              })
            );
          }
          return Stream.fail(error);
        })
      ),
  } as const;
});
