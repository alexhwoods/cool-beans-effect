import { Context, Layer, Stream } from "effect";
import { User } from "@collector/shared";

export class UserService extends Context.Tag("UserService")<
  UserService,
  {
    getUsers: () => Stream.Stream<User>;
  }
>() {}

export const UserServiceLive = Layer.succeed(UserService, {
  getUsers: () =>
    Stream.fromIterable([
      { id: "1", name: "Alice", email: "alice@example.com" },
      { id: "2", name: "Bob", email: "bob@example.com" },
      { id: "3", name: "Charlie", email: "charlie@example.com" },
    ]),
});
