import { Schema } from "effect";

export class CreateConversationResponse extends Schema.Class<CreateConversationResponse>(
  "CreateConversationResponse"
)({
  id: Schema.Number,
}) {}

export const Sender = Schema.Literal("user", "ai");

export class ConversationMessage extends Schema.Class<ConversationMessage>(
  "ConversationMessage"
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
  messages: Schema.Array(ConversationMessage),
}) {}

export class ConversationNotFound extends Schema.TaggedError<ConversationNotFound>()(
  "ConversationNotFound",
  {
    id: Schema.Number,
  }
) {}


