import { Effect, Stream } from "effect";
import { UserRpcs } from "@collector/shared";

export const UserRpcLive = UserRpcs.toLayer(
  Effect.gen(function* () {
    return {
      UserList: () =>
        Stream.fromIterable([
          { id: "1", name: "Alice", email: "alice@example.com" },
        ]),
    };
  })
);
