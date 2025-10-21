import { Rpc, RpcGroup } from "@effect/rpc";
import { getFooResponse, streamFoo } from "./foo";
import { listUsers } from "./users";

export const AllRpcs = RpcGroup.make(streamFoo, getFooResponse, listUsers);
