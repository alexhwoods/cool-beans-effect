import { Rpc, RpcGroup } from "@effect/rpc";
import { User } from "./schema";

export const listUsers = Rpc.make("UserList", {
  success: User,
  stream: true,
});
