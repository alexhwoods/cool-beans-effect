import { Rpc, RpcGroup } from "@effect/rpc";
import { User } from "./schema";

export const UserRpcs = RpcGroup.make(
  Rpc.make("UserList", {
    success: User,
    stream: true,
  })
);
