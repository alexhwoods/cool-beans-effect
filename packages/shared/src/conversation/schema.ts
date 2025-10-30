import { Schema } from "effect";
import { CoffeeSuggestion } from "../coffee/schema";

export class CreateConversationResponse extends Schema.Class<CreateConversationResponse>(
  "CreateConversationResponse"
)({
  id: Schema.Number,
}) {}

export const Sender = Schema.Literal("user", "ai");

export class AiResponseChunk extends Schema.Class<AiResponseChunk>(
  "AiResponseChunk"
)({
  response: Schema.Union(Schema.String, CoffeeSuggestion),
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
  chunks: Schema.Array(AiResponseChunk),
}) {}

export class ConversationNotFound extends Schema.TaggedError<ConversationNotFound>()(
  "ConversationNotFound",
  {
    id: Schema.Number,
  }
) {}
