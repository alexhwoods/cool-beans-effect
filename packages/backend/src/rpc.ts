import { HttpMiddleware, HttpRouter } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Layer } from "effect";

import { UserRpcs } from "@collector/shared";
import { UserRpcLive } from "./users/user.rpc";

export const RpcLayer = RpcServer.layer(UserRpcs).pipe(
  Layer.provide(UserRpcLive)
);
