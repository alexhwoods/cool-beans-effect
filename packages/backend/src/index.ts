import { HttpRouter } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { DevTools } from "@effect/experimental";
import { Layer } from "effect";
import { RpcLayerLive } from "./rpc";
import { corsMiddleware } from "./middleware/cors.middleware";

const DevToolsLive = DevTools.layer();

const Main = HttpRouter.Default.serve(corsMiddleware).pipe(
  Layer.provide(RpcLayerLive),
  Layer.provide(
    RpcServer.layerProtocolHttp({
      path: "/rpc",
    }).pipe(Layer.provide(RpcSerialization.layerNdjson))
  ),
  Layer.provide(BunHttpServer.layer({ port: 8000 })),
  // Provide DevTools layer before other layers for proper tracing
  Layer.provide(DevToolsLive)
);

BunRuntime.runMain(Layer.launch(Main));
