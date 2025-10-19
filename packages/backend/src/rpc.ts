import { RpcServer } from "@effect/rpc";
import { Layer } from "effect";

import { UserRpcs } from "@collector/shared";
import { UserRpcLive } from "./users/user.rpc";
import { UserServiceLive } from "./users/user.service";

export const RpcLayerLive = RpcServer.layer(UserRpcs).pipe(
  Layer.provide(UserRpcLive),
  Layer.provide(UserServiceLive)
);
