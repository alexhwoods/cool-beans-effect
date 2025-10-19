import { Schema } from "effect";
import { Rpc, RpcGroup } from "@effect/rpc";

export class User extends Schema.Class<User>("User")({
  id: Schema.String, // User's ID as a string
  name: Schema.String, // User's name as a string
  email: Schema.String, // User's email as a string
}) {}

// Create the RPC router with handlers
export const UserRpcs = RpcGroup.make(
  Rpc.make("UserList", {
    success: User, // Succeed with a stream of users
    stream: true,
  })
);
