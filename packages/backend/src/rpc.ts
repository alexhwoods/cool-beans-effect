import { RpcServer } from "@effect/rpc";
import { Layer } from "effect";

import { UserRpcs, FooRpcs } from "@collector/shared";
import { UserRpcLive } from "./users/user.rpc";
import { UserServiceLive } from "./users/user.service";
import { FooRpcLive } from "./foo/foo.rpc";
import { FooServiceLive } from "./foo/foo.service";

export const RpcLayerLive = Layer.mergeAll(
  RpcServer.layer(UserRpcs).pipe(
    Layer.provide(UserRpcLive),
    Layer.provide(UserServiceLive)
  ),
  RpcServer.layer(FooRpcs).pipe(
    Layer.provide(FooRpcLive),
    Layer.provide(FooServiceLive)
  )
);
