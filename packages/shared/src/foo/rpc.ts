import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { Foo } from "./schema";

export const streamFoo = Rpc.make("streamFoo", {
  payload: Schema.Void,
  success: Foo,
  stream: true,
});

export const getFooResponse = Rpc.make("getFooResponse", {
  payload: Schema.Void,
  success: Schema.String,
  stream: true,
});
