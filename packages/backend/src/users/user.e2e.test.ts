import { describe, test, expect } from "bun:test";
import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer, Stream } from "effect";
import { UserRpcs } from "@collector/shared";

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

describe("User RPC E2E", () => {
  test("UserList should return all users", async () => {
    const result = await Effect.gen(function* () {
      const client = yield* RpcClient.make(UserRpcs);
      return yield* Stream.runCollect(client.UserList()).pipe(
        Effect.map((users) => Array.from(users))
      );
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.runPromise
    );

    // Verify we got the expected users from the service
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      id: "1",
      name: "Alice",
      email: "alice@example.com",
    });
    expect(result[1]).toEqual({
      id: "2",
      name: "Bob",
      email: "bob@example.com",
    });
    expect(result[2]).toEqual({
      id: "3",
      name: "Charlie",
      email: "charlie@example.com",
    });
  });

  test("UserList should stream users incrementally", async () => {
    const result = await Effect.gen(function* () {
      const client = yield* RpcClient.make(UserRpcs);
      const users: any[] = [];

      // Collect users as they stream in
      yield* Stream.runForEach(client.UserList(), (user) =>
        Effect.sync(() => users.push(user))
      );

      return users;
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.runPromise
    );

    // Verify all users were streamed
    expect(result).toHaveLength(3);
    expect(result.every((user) => user.id && user.name && user.email)).toBe(
      true
    );
  });

  test("UserList should return users with valid email format", async () => {
    const result = await Effect.gen(function* () {
      const client = yield* RpcClient.make(UserRpcs);
      return yield* Stream.runCollect(client.UserList()).pipe(
        Effect.map((users) => Array.from(users))
      );
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.runPromise
    );

    // Verify all emails have valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    result.forEach((user) => {
      expect(emailRegex.test(user.email)).toBe(true);
    });
  });
});
