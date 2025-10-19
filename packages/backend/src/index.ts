import { HttpMiddleware, HttpRouter } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Layer } from "effect";

import { UsersLive } from "./router.js";
import { UserRpcs } from "@collector/shared";

const RpcLayer = RpcServer.layer(UserRpcs).pipe(Layer.provide(UsersLive));

const HttpProtocol = RpcServer.layerProtocolHttp({
  path: "/rpc",
}).pipe(Layer.provide(RpcSerialization.layerNdjson));

const corsMiddleware = HttpMiddleware.cors({
  allowedOrigins: ["http://localhost:3000"],
});

const Main = HttpRouter.Default.serve(corsMiddleware).pipe(
  Layer.provide(RpcLayer),
  Layer.provide(HttpProtocol),
  Layer.provide(BunHttpServer.layer({ port: 8000 }))
);

BunRuntime.runMain(Layer.launch(Main));
