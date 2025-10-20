import { Rpc, RpcGroup } from "@effect/rpc";
import { Foo } from "./schema";

export const streamFoo = Rpc.make("streamFoo", {
  success: Foo,
  stream: true,
});
