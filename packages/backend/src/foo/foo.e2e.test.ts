import { describe, test, expect } from "bun:test";
import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer, Sink, Stream } from "effect";
import { AllRpcs } from "@collector/shared";

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
  test(
    "streamFoo should return all foo items",
    async () => {
      const result = await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);
        return yield* Stream.runCollect(client.streamFoo()).pipe(
          Effect.map((foos) => Array.from(foos))
        );
      }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

      // Verify we got the expected foo items from the service
      expect(result).toHaveLength(9);
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
    },
    {
      timeout: 20 * 1000,
    }
  );

  test(
    "streamFoo should stream items incrementally",
    async () => {
      const result = await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);
        const items: any[] = [];

        // Collect items as they stream in
        yield* Stream.runForEach(client.streamFoo(), (foo) =>
          Effect.sync(() => items.push(foo))
        );

        return items;
      }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

      // Verify all items were streamed
      expect(result).toHaveLength(9);
      expect(
        result.every((item) => item.id && item.name && item.description)
      ).toBe(true);
    },
    { timeout: 20 * 1000 }
  );

  test(
    "streamFoo should log items as they stream in",
    async () => {
      await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);

        // Stream items and log each one as it arrives
        yield* Stream.runForEach(
          // don't buffer
          // that's really just for demo purposes
          client.streamFoo().pipe(Stream.rechunk(1)),
          (foo) =>
            Effect.gen(function* () {
              yield* Effect.log(`Received foo: ${foo.name} (id: ${foo.id})`);
            })
        );
      }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);
    },
    { timeout: 20 * 1000 }
  );

  test("getFooResponse should stream complete text", async () => {
    const result = await Effect.gen(function* () {
      const client = yield* RpcClient.make(AllRpcs);
      return yield* Stream.runCollect(client.getFooResponse()).pipe(
        Effect.map((chunks) => Array.from(chunks))
      );
    }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

    // The last chunk should contain the complete paragraph
    const lastChunk = result[result.length - 1];
    expect(lastChunk).toContain("The quick brown fox jumps over the lazy dog");
    expect(lastChunk).toContain("streaming capabilities");
    expect(lastChunk).toContain("real-time text generation");

    // Should have received multiple chunks
    expect(result.length).toBeGreaterThan(1);
  });

  test("getFooResponse should stream text incrementally", async () => {
    const result = await Effect.gen(function* () {
      const client = yield* RpcClient.make(AllRpcs);
      const chunks: string[] = [];

      // Collect chunks as they stream in
      yield* Stream.runForEach(client.getFooResponse(), (chunk) =>
        Effect.sync(() => chunks.push(chunk))
      );

      return chunks;
    }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

    // Each chunk should be longer than the previous (accumulating words)
    for (let i = 1; i < result.length; i++) {
      expect(result[i].length).toBeGreaterThan(result[i - 1].length);
    }

    // First chunk should be short
    expect(result[0].split(" ").length).toBeLessThan(5);

    // Last chunk should contain the full text
    expect(result[result.length - 1]).toContain("real-time text generation");
  });

  // with a Sink
  test(
    "getFooResponse should log chunks as they stream in",
    async () => {
      await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);

        // Stream text and log each chunk as it arrives
        const x = yield* Stream.run(
          client.getFooResponse(),
          Sink.foldLeft("", (_, b) => b)
        );
      }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);
    },
    { timeout: 30 * 1000 }
  );
});
