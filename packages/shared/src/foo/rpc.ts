import { Rpc, RpcGroup } from "@effect/rpc";
import { Foo } from "./schema";

export const FooRpcs = RpcGroup.make(
  Rpc.make("streamFoo", {
    success: Foo,
    stream: true,
  })
);
