import { describe, test, expect } from "bun:test";
import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer } from "effect";
import { AllRpcs } from "@cool-beans/shared";

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

describe("Coffee RPC E2E", () => {
  test(
    "listCoffees should return coffee items",
    async () => {
      const result = await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);
        return yield* client.listCoffees();
      }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

      // Verify we got coffee items from the service
      expect(result.length).toBeGreaterThan(0);

      // Verify all items have the expected structure
      result.forEach((coffee) => {
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
    },
    {
      timeout: 20 * 1000,
    }
  );

  test(
    "createCoffee should create a new coffee",
    async () => {
      const uniqueName = `Test Coffee ${Date.now()}`;
      const result = await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);
        return yield* client.createCoffee({
          name: uniqueName,
          origin: "Test Origin",
          roast: "Medium",
          price: 19.99,
          weight: "12oz",
          description: "A test coffee for e2e testing",
          inStock: true,
        });
      }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

      // Verify the created coffee
      expect(result).toEqual({
        id: expect.any(Number),
        name: uniqueName,
        origin: "Test Origin",
        roast: "Medium",
        price: 19.99,
        weight: "12oz",
        description: "A test coffee for e2e testing",
        inStock: true,
      });
      expect(result.id).toBeGreaterThan(0); // Should be a valid ID
    },
    {
      timeout: 20 * 1000,
    }
  );

  test(
    "createCoffee should fail when coffee with same name exists",
    async () => {
      const uniqueName = `Duplicate Test Coffee ${Date.now()}`;

      // First create a coffee
      await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);
        return yield* client.createCoffee({
          name: uniqueName,
          origin: "Test Origin",
          roast: "Medium",
          price: 19.99,
          weight: "12oz",
          description: "A test coffee for e2e testing",
          inStock: true,
        });
      }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

      // Then try to create another with the same name
      const result = await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);
        return yield* client.createCoffee({
          name: uniqueName, // Same name as above
          origin: "Test Origin",
          roast: "Medium",
          price: 19.99,
          weight: "12oz",
          description: "A test coffee for e2e testing",
          inStock: true,
        });
      }).pipe(
        Effect.scoped,
        Effect.provide(ProtocolLive),
        Effect.either,
        Effect.runPromise
      );

      // Verify the error is the expected CoffeeAlreadyExists error
      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left._tag).toBe("CoffeeAlreadyExists");
        expect(result.left.name).toBe(uniqueName);
        expect(result.left.suggestion).toBe(`${uniqueName} 2`);
      }
    },
    {
      timeout: 20 * 1000,
    }
  );

  test(
    "updateCoffee should update an existing coffee",
    async () => {
      const uniqueName = `Update Test Coffee ${Date.now()}`;

      // First create a coffee
      const createdCoffee = await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);
        return yield* client.createCoffee({
          name: uniqueName,
          origin: "Test Origin",
          roast: "Medium",
          price: 19.99,
          weight: "12oz",
          description: "A test coffee for e2e testing",
          inStock: true,
        });
      }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

      // Then update it
      const result = await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);
        return yield* client.updateCoffee({
          id: createdCoffee.id,
          name: "Updated Test Coffee",
          origin: "Updated Origin",
          roast: "Dark",
          price: 29.99, // Updated price
          weight: "8oz",
          description: "Updated description with new price",
          inStock: false,
        });
      }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

      // Verify the updated coffee
      expect(result).toEqual({
        id: createdCoffee.id,
        name: "Updated Test Coffee",
        origin: "Updated Origin",
        roast: "Dark",
        price: 29.99,
        weight: "8oz",
        description: "Updated description with new price",
        inStock: false,
      });
    },
    {
      timeout: 20 * 1000,
    }
  );

  test(
    "updateCoffee should fail when coffee doesn't exist",
    async () => {
      const result = await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);
        return yield* client.updateCoffee({
          id: 999, // Non-existent ID
          name: "Non-existent Coffee",
          origin: "Nowhere",
          roast: "Medium",
          price: 19.99,
          weight: "12oz",
          description: "This coffee doesn't exist",
          inStock: true,
        });
      }).pipe(
        Effect.scoped,
        Effect.provide(ProtocolLive),
        Effect.either,
        Effect.runPromise
      );

      // Verify the error is the expected CoffeeNotFound error
      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left._tag).toBe("CoffeeNotFound");
        expect(result.left.id).toBe(999);
      }
    },
    {
      timeout: 20 * 1000,
    }
  );

  test(
    "deleteCoffee should delete an existing coffee",
    async () => {
      const uniqueName = `Delete Test Coffee ${Date.now()}`;

      // First create a coffee
      const createdCoffee = await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);
        return yield* client.createCoffee({
          name: uniqueName,
          origin: "Test Origin",
          roast: "Medium",
          price: 19.99,
          weight: "12oz",
          description: "A test coffee for e2e testing",
          inStock: true,
        });
      }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

      // Then delete it
      const result = await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);
        return yield* client.deleteCoffee({ id: createdCoffee.id });
      }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

      // Verify the deletion succeeded (returns void)
      expect(result).toBeUndefined();
    },
    {
      timeout: 20 * 1000,
    }
  );

  test(
    "deleteCoffee should fail when coffee doesn't exist",
    async () => {
      const result = await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);
        return yield* client.deleteCoffee({ id: 999 }); // Non-existent ID
      }).pipe(
        Effect.scoped,
        Effect.provide(ProtocolLive),
        Effect.either,
        Effect.runPromise
      );

      // Verify the error is the expected CoffeeNotFound error
      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left._tag).toBe("CoffeeNotFound");
        expect(result.left.id).toBe(999);
      }
    },
    {
      timeout: 20 * 1000,
    }
  );

  test(
    "listCoffees should reflect changes after create, update, and delete",
    async () => {
      const result = await Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);

        // First, get initial count
        const initialCoffees = yield* client.listCoffees();
        const initialCount = initialCoffees.length;

        // Create a new coffee
        const newCoffee = yield* client.createCoffee({
          name: "Integration Test Coffee",
          origin: "Test Origin",
          roast: "Medium",
          price: 15.99,
          weight: "8oz",
          description: "Coffee for integration testing",
          inStock: true,
        });

        // Verify count increased
        const afterCreate = yield* client.listCoffees();
        expect(afterCreate.length).toBe(initialCount + 1);

        // Update the coffee
        yield* client.updateCoffee({
          id: newCoffee.id,
          name: "Updated Integration Test Coffee",
          origin: "Updated Origin",
          roast: "Dark",
          price: 18.99,
          weight: "8oz",
          description: "Updated description",
          inStock: false,
        });

        // Verify the update
        const afterUpdate = yield* client.listCoffees();
        const updatedCoffee = afterUpdate.find((c) => c.id === newCoffee.id);
        expect(updatedCoffee?.name).toBe("Updated Integration Test Coffee");
        expect(updatedCoffee?.price).toBe(18.99);
        expect(updatedCoffee?.inStock).toBe(false);

        // Delete the coffee
        yield* client.deleteCoffee({ id: newCoffee.id });

        // Verify count is back to initial
        const afterDelete = yield* client.listCoffees();
        expect(afterDelete.length).toBe(initialCount);

        return afterDelete;
      }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

      // Verify final state - should be back to initial count
      expect(result.length).toBeGreaterThan(0);
    },
    {
      timeout: 30 * 1000,
    }
  );
});
