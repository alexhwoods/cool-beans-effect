import { Rpc, RpcGroup } from "@effect/rpc";
import { streamFoo } from "./foo";
import { listUsers } from "./users";

export const AllRpcs = RpcGroup.make(streamFoo, listUsers);
