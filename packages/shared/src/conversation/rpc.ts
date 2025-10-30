import { Rpc } from "@effect/rpc";
import { Schema } from "effect";
import {
  CreateConversationResponse,
  SendUserMessageRequest,
  ConversationMessage,
  ConversationNotFound,
} from "./schema";

export const createConversation = Rpc.make("createConversation", {
  payload: Schema.Void,
  success: CreateConversationResponse,
});

export const sendUserMessage = Rpc.make("sendUserMessage", {
  payload: SendUserMessageRequest,
  success: ConversationMessage,
  error: ConversationNotFound,
  stream: true,
});


