import { HttpRouter } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Layer } from "effect";
import { RpcLayer } from "./rpc";
import { corsMiddleware } from "./middleware/cors.middleware";

const Main = HttpRouter.Default.serve(corsMiddleware).pipe(
  Layer.provide(RpcLayer),
  Layer.provide(
    RpcServer.layerProtocolHttp({
      path: "/rpc",
    }).pipe(Layer.provide(RpcSerialization.layerNdjson))
  ),
  Layer.provide(BunHttpServer.layer({ port: 8000 }))
);

BunRuntime.runMain(Layer.launch(Main));
