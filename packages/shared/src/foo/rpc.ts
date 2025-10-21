import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { Foo } from "./schema";

export const streamFoo = Rpc.make("streamFoo", {
  success: Foo,
  stream: true,
});

export const getFooResponse = Rpc.make("getFooResponse", {
  success: Schema.String,
  stream: true,
});
