import { Schema } from "effect";

export class CreateConversationResponse extends Schema.Class<CreateConversationResponse>(
  "CreateConversationResponse"
)({
  id: Schema.Number,
}) {}

export const Sender = Schema.Literal("user", "ai");

export class ConversationMessageChunk extends Schema.Class<ConversationMessageChunk>(
  "ConversationMessageChunk"
)({
  sender: Sender,
  message: Schema.String,
}) {}

export class SendUserMessageRequest extends Schema.Class<SendUserMessageRequest>(
  "SendUserMessageRequest"
)({
  conversationId: Schema.Number,
  message: Schema.String,
}) {}

export class SendUserMessageResponse extends Schema.Class<SendUserMessageResponse>(
  "SendUserMessageResponse"
)({
  chunks: Schema.Array(ConversationMessageChunk),
}) {}

export class ConversationNotFound extends Schema.TaggedError<ConversationNotFound>()(
  "ConversationNotFound",
  {
    id: Schema.Number,
  }
) {}
