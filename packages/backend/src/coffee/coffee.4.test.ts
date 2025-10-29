import { FetchHttpClient, HttpRouter } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { RpcClient, RpcSerialization, RpcServer } from "@effect/rpc";
import { Effect, Either, Layer, Option } from "effect";
import { RpcLayerLive } from "../rpc";
import { corsMiddleware } from "../middleware/cors.middleware";
import { beforeAll, describe, expect } from "bun:test";
import { findOpenPortInRange } from "../test-utils/find-port-in-range";
import { test } from "../test-utils/bun-test";
import { AllRpcs } from "@cool-beans/shared";

let port: number;
let ProtocolLive: ReturnType<typeof RpcClient.layerProtocolHttp>;

beforeAll(async () => {
  port = await findOpenPortInRange(8000, 12000);
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

  ProtocolLive = RpcClient.layerProtocolHttp({
    url: `http://localhost:${port}/rpc`,
  }).pipe(
    Layer.provide([
      // use fetch for http requests
      FetchHttpClient.layer,
      // use ndjson for serialization
      RpcSerialization.layerNdjson,
    ])
  );
});

describe("listCoffees RPC (bun)", () => {
  test.effect("should return list of coffees", () =>
    Effect.gen(function* () {
      // Arrange
      const client = yield* RpcClient.make(AllRpcs);

      // Act
      const result = yield* Effect.either(client.listCoffees());

      // Assert
      expect(Either.isRight(result)).toBe(true);

      const coffees = Option.getOrThrow(Either.getRight(result));
      expect(coffees.length).toBeGreaterThan(0);

      // Verify all items have the expected structure
      coffees.forEach((coffee) => {
        expect(coffee).toHaveProperty("id");
        expect(coffee).toHaveProperty("name");
        expect(coffee).toHaveProperty("origin");
        expect(coffee).toHaveProperty("roast");
        expect(coffee).toHaveProperty("price");
        expect(coffee).toHaveProperty("weight");
        expect(coffee).toHaveProperty("description");
        expect(coffee).toHaveProperty("inStock");

        expect(typeof coffee.id).toBe("number");
        expect(typeof coffee.name).toBe("string");
        expect(typeof coffee.origin).toBe("string");
        expect(typeof coffee.roast).toBe("string");
        expect(typeof coffee.price).toBe("number");
        expect(typeof coffee.weight).toBe("string");
        expect(typeof coffee.description).toBe("string");
        expect(typeof coffee.inStock).toBe("boolean");
      });
    }).pipe(Effect.scoped, Effect.provide(ProtocolLive))
  );
});
