import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { User } from "./schema";

export const listUsers = Rpc.make("UserList", {
  payload: Schema.Void,
  success: User,
  stream: true,
});
