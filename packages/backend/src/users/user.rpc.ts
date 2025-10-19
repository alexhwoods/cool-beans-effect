import { Effect } from "effect";
import { UserRpcs } from "@collector/shared";
import { UserService } from "./user.service";

export const UserRpcLive = UserRpcs.toLayer(
  Effect.gen(function* () {
    const userService = yield* UserService;

    return {
      UserList: () => userService.getUsers(),
    };
  })
);
