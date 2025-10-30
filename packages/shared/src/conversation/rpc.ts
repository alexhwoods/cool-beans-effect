import { Rpc } from "@effect/rpc";
import { Schema } from "effect";
import {
  CreateConversationResponse,
  SendUserMessageRequest,
  AiResponseChunk,
  ConversationNotFound,
} from "./schema";

export const createConversation = Rpc.make("createConversation", {
  payload: Schema.Void,
  success: CreateConversationResponse,
});

export const sendUserMessage = Rpc.make("sendUserMessage", {
  payload: SendUserMessageRequest,
  success: AiResponseChunk,
  error: ConversationNotFound,
  stream: true,
});
