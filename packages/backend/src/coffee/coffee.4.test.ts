import { HttpRouter } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Effect, Layer } from "effect";
import { RpcLayerLive } from "../rpc";
import { corsMiddleware } from "../middleware/cors.middleware";
import { beforeAll, describe, expect, test } from "bun:test";
import net from "node:net";
import { findOpenPortInRange } from "../test-utils/find-port-in-range";

let port: number;

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
});

describe("listCoffees RPC (bun)", () => {
  test("should return list of coffees", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`http://localhost:${port}/rpc`, {
              method: "POST",
              headers: {
                "content-type": "application/ndjson",
              },
              body: '{"_tag":"Request","id":"0","tag":"listCoffees","traceId":"75b9afc0a1e272365d5001dbb9d7df01","spanId":"942b66705515bf1e","sampled":true,"headers":[]}\n',
            }),
          catch: (error) => `Failed to fetch: ${error}`,
        });

        const result = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => `Failed to parse JSON: ${error}`,
        });

        expect(result).toStrictEqual({
          _tag: "Exit",
          requestId: "0",
          exit: {
            _tag: "Success",
            value: [
              {
                id: 1,
                name: "Ethiopian Yirgacheffe",
                origin: "Ethiopia",
                roast: "Light",
                price: 24.99,
                weight: "12oz",
                description:
                  "Bright and floral with notes of jasmine and citrus",
                inStock: true,
              },
              {
                id: 2,
                name: "Colombian Supremo",
                origin: "Colombia",
                roast: "Medium",
                price: 22.99,
                weight: "12oz",
                description:
                  "Rich and balanced with chocolate and nutty undertones",
                inStock: true,
              },
              {
                id: 3,
                name: "Guatemala Antigua",
                origin: "Guatemala",
                roast: "Medium-Dark",
                price: 26.99,
                weight: "12oz",
                description: "Full-bodied with smoky notes and a spicy finish",
                inStock: false,
              },
              {
                id: 4,
                name: "Jamaican Blue Mountain",
                origin: "Jamaica",
                roast: "Medium",
                price: 89.99,
                weight: "8oz",
                description: "Smooth and mild with a clean, bright finish",
                inStock: true,
              },
              {
                id: 5,
                name: "Hawaiian Kona",
                origin: "Hawaii",
                roast: "Medium",
                price: 45.99,
                weight: "10oz",
                description: "Rich and smooth with a hint of sweetness",
                inStock: true,
              },
              {
                id: 6,
                name: "Sumatra Mandheling",
                origin: "Indonesia",
                roast: "Dark",
                price: 28.99,
                weight: "12oz",
                description: "Earthy and full-bodied with low acidity",
                inStock: true,
              },
            ],
          },
        });
      })
    );
  });
});
