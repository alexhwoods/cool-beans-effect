import { describe, expect, beforeAll } from "bun:test";
import { Effect, Sink, Stream } from "effect";
import {
  createRpcClientLayer,
  RpcClientLive,
} from "../test-utils/setup-rpc-test-server";
import { test } from "../test-utils/bun-test";

let ClientLive: any;

beforeAll(async () => {
  ClientLive = await createRpcClientLayer();
});

describe("Foo RPC E2E", () => {
  test.effect("streamFoo should return all foo items", () =>
    Effect.gen(function* () {
      // Arrange
      const client = yield* RpcClientLive;

      // Act
      const foos = yield* Stream.runCollect(client.streamFoo()).pipe(
        Effect.map((foos) => Array.from(foos))
      );

      // Assert
      expect(foos).toHaveLength(9);
      expect(foos[0]).toEqual({
        id: "1",
        name: "Foo One",
        description: "The first foo",
      });
      expect(foos[1]).toEqual({
        id: "2",
        name: "Foo Two",
        description: "The second foo",
      });
      expect(foos[2]).toEqual({
        id: "3",
        name: "Foo Three",
        description: "The third foo",
      });
      expect(foos[3]).toEqual({
        id: "4",
        name: "Foo Four",
        description: "The fourth foo",
      });
    }).pipe(Effect.provide(ClientLive))
  );

  test.effect("streamFoo should stream items incrementally", () =>
    Effect.gen(function* () {
      // Arrange
      const client = yield* RpcClientLive;
      const items: any[] = [];

      // Act
      yield* Stream.runForEach(client.streamFoo(), (foo) =>
        Effect.sync(() => items.push(foo))
      );

      // Assert
      expect(items).toHaveLength(9);
      expect(
        items.every((item) => item.id && item.name && item.description)
      ).toBe(true);
    }).pipe(Effect.provide(ClientLive))
  );

  test.effect("streamFoo should log items as they stream in", () =>
    Effect.gen(function* () {
      const client = yield* RpcClientLive;

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
    }).pipe(Effect.provide(ClientLive))
  );

  test.effect("getFooResponse should stream complete text", () =>
    Effect.gen(function* () {
      // Arrange
      const client = yield* RpcClientLive;

      // Act
      const text = yield* client
        .getFooResponse()
        .pipe(Stream.run(Sink.foldLeft("", (_, b) => b)));

      // Assert
      expect(text).toBe(
        "The quick brown fox jumps over the lazy dog. This is a sample paragraph that will be streamed slowly to demonstrate the streaming capabilities of the RPC framework. Each word appears with a small delay to simulate real-time text generation."
      );
    }).pipe(Effect.provide(ClientLive))
  );
});
