import { FetchHttpClient, HttpRouter } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { RpcClient, RpcSerialization, RpcServer } from "@effect/rpc";
import { Effect, Layer } from "effect";
import { AllRpcs } from "@cool-beans/shared";
import { RpcLayerLive } from "../rpc";
import { corsMiddleware } from "../middleware/cors.middleware";
import { findOpenPortInRange } from "./find-port-in-range";

/**
 * Sets up an RPC test server and returns a ProtocolLive client layer for testing.
 *
 * This utility function:
 * 1. Finds an available port in the range 8000-12000
 * 2. Launches a BunHttpServer with RPC support
 * 3. Returns a configured RpcClient layer that connects to the test server
 *
 * @returns A Promise that resolves to an RpcClient layer configured for the test server
 *
 * @example
 * ```ts
 * let ProtocolLive: ReturnType<typeof RpcClient.layerProtocolHttp>;
 *
 * beforeAll(async () => {
 *   ProtocolLive = await setupRpcTestServer();
 * });
 *
 * test.effect("my test", () =>
 *   Effect.gen(function* () {
 *     const client = yield* RpcClient.make(AllRpcs);
 *     // ... use client
 *   }).pipe(Effect.scoped, Effect.provide(ProtocolLive))
 * );
 * ```
 */
export async function setupRpcTestServer(): Promise<
  ReturnType<typeof RpcClient.layerProtocolHttp>
> {
  const port = await findOpenPortInRange(8001, 12000);

  const Main = HttpRouter.Default.serve(corsMiddleware).pipe(
    Layer.provide(RpcLayerLive),
    Layer.provide(
      RpcServer.layerProtocolHttp({
        path: "/rpc",
      }).pipe(Layer.provide(RpcSerialization.layerNdjson))
    ),
    Layer.provide(BunHttpServer.layer({ port }))
  );

  BunRuntime.runMain(Layer.launch(Main));

  return RpcClient.layerProtocolHttp({
    url: `http://localhost:${port}/rpc`,
  }).pipe(
    Layer.provide([
      // use fetch for http requests
      FetchHttpClient.layer,
      // use ndjson for serialization
      RpcSerialization.layerNdjson,
    ])
  );
}

/**
 * RPC Client service that can be injected into tests.
 */
export class RpcClientLive extends Effect.Service<RpcClientLive>()(
  "RpcClientLive",
  {
    scoped: RpcClient.make(AllRpcs),
  }
) {}

export async function createRpcClientLayer() {
  const protocolLive = await setupRpcTestServer();
  return Layer.scoped(
    RpcClientLive,
    RpcClient.make(AllRpcs).pipe(Effect.map((client) => client as any))
  ).pipe(Layer.provide(protocolLive));
}
