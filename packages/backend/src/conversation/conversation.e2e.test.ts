import { describe, expect, beforeAll } from "bun:test";
import { Effect, Either, Option, Stream, Sink, Chunk } from "effect";
import {
  createRpcClientLayer,
  RpcClientLive,
} from "../test-utils/setup-rpc-test-server";
import { test } from "../test-utils/bun-test";

let ClientLive;

beforeAll(async () => {
  ClientLive = await createRpcClientLayer();
});

describe("Conversation RPC E2E", () => {
  describe("createConversation", () => {
    test.effect("should create a new conversation and return id", () =>
      Effect.gen(function* () {
        const client = yield* RpcClientLive;

        const result = yield* Effect.either(client.createConversation(void 0));

        expect(Either.isRight(result)).toBe(true);

        const response = Option.getOrThrow(Either.getRight(result));
        expect(response).toEqual({ id: expect.any(Number) });
        expect(response.id).toBeGreaterThan(0);
      }).pipe(Effect.provide(ClientLive))
    );

    test.effect("should increment ids for successive conversations", () =>
      Effect.gen(function* () {
        const client = yield* RpcClientLive;

        const first = Option.getOrThrow(
          yield* Effect.either(client.createConversation(void 0)).pipe(
            Effect.map(Either.getRight)
          )
        );

        const second = Option.getOrThrow(
          yield* Effect.either(client.createConversation(void 0)).pipe(
            Effect.map(Either.getRight)
          )
        );

        expect(second.id).toBeGreaterThan(first.id);
      }).pipe(Effect.provide(ClientLive))
    );
  });

  describe("sendUserMessage (stream)", () => {
    test.effect.only("should stream user then ai messages", () =>
      Effect.gen(function* () {
        const client = yield* RpcClientLive;

        const { id } = Option.getOrThrow(
          yield* Effect.either(client.createConversation(void 0)).pipe(
            Effect.map(Either.getRight)
          )
        );

        const messageText = "Create a medium roast Ethiopia coffee";
        const collected = yield* client
          .sendUserMessage({ conversationId: id, message: messageText })
          .pipe(Stream.run(Sink.collectAll()));
        const messages = Chunk.toReadonlyArray(collected);

        console.log(messages);

        expect(messages.length).toBe(2);
        expect(messages[0]).toEqual({ sender: "user", message: messageText });
        expect(messages[1].sender).toBe("ai");
        expect(messages[1].message).toContain(messageText);
      }).pipe(Effect.provide(ClientLive))
    );

    test.effect("should error on missing conversation", () =>
      Effect.gen(function* () {
        const client = yield* RpcClientLive;
        const result = yield* Effect.either(
          client
            .sendUserMessage({ conversationId: 999999, message: "hi" })
            .pipe(Stream.run(Sink.collectAll()))
        );
        expect(Either.isLeft(result)).toBe(true);
      }).pipe(Effect.provide(ClientLive))
    );
  });
});
