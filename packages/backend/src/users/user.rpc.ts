import { Effect } from "effect";
import { UserService } from "./user.service";

export const makeUserRpcHandlers = Effect.gen(function* () {
  const userService = yield* UserService;

  return {
    UserList: () => userService.getUsers(),
  };
});
