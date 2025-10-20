import { describe, test, expect } from "bun:test";
import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer, Stream } from "effect";
import { FooRpcs } from "@collector/shared";

const ProtocolLive = RpcClient.layerProtocolHttp({
  url: "http://localhost:8000/rpc",
}).pipe(
  Layer.provide([
    // use fetch for http requests
    FetchHttpClient.layer,
    // use ndjson for serialization
    RpcSerialization.layerNdjson,
  ])
);

describe("Foo RPC E2E", () => {
  test("streamFoo should return all foo items", async () => {
    const result = await Effect.gen(function* () {
      const client = yield* RpcClient.make(FooRpcs);
      return yield* Stream.runCollect(client.streamFoo()).pipe(
        Effect.map((foos) => Array.from(foos))
      );
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.runPromise
    );

    // Verify we got the expected foo items from the service
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({
      id: "1",
      name: "Foo One",
      description: "The first foo",
    });
    expect(result[1]).toEqual({
      id: "2",
      name: "Foo Two",
      description: "The second foo",
    });
    expect(result[2]).toEqual({
      id: "3",
      name: "Foo Three",
      description: "The third foo",
    });
    expect(result[3]).toEqual({
      id: "4",
      name: "Foo Four",
      description: "The fourth foo",
    });
  });

  test("streamFoo should stream items incrementally", async () => {
    const result = await Effect.gen(function* () {
      const client = yield* RpcClient.make(FooRpcs);
      const items: any[] = [];

      // Collect items as they stream in
      yield* Stream.runForEach(client.streamFoo(), (foo) =>
        Effect.sync(() => items.push(foo))
      );

      return items;
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.runPromise
    );

    // Verify all items were streamed
    expect(result).toHaveLength(4);
    expect(result.every((item) => item.id && item.name && item.description)).toBe(true);
  });
});
