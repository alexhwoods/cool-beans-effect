import { Effect, Layer, Schema, Stream } from "effect";
import { Rpc, RpcGroup } from "@effect/rpc";
import { GetUser, CreateUser, ListUsers } from "@collector/shared";

// Define a user with an ID and name
export class User extends Schema.Class<User>("User")({
  id: Schema.String, // User's ID as a string
  name: Schema.String, // User's name as a string
}) {}

// Create the RPC router with handlers
export const UserRpcs = RpcGroup.make(
  Rpc.make("UserList", {
    success: User, // Succeed with a stream of users
    stream: true,
  })
);

export const UsersLive: Layer.Layer<Rpc.Handler<"UserList">> = UserRpcs.toLayer(
  Effect.gen(function* () {
    return {
      UserList: () =>
        Stream.fromIterable([
          { id: "1", name: "Alice", email: "alice@example.com" },
        ]),
    };
  })
);
