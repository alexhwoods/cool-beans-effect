import { RpcClient } from "@effect/rpc";
import { Effect, Either, Option } from "effect";
import { beforeAll, describe, expect } from "bun:test";
import { test } from "../test-utils/bun-test";
import { setupRpcTestServer } from "../test-utils/setup-rpc-test-server";
import { AllRpcs } from "@cool-beans/shared";

let ProtocolLive: ReturnType<typeof RpcClient.layerProtocolHttp>;

beforeAll(async () => {
  ProtocolLive = await setupRpcTestServer();
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
