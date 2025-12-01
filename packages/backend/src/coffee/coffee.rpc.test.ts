import { describe, expect, beforeAll } from "bun:test";
import { Effect, Either, Option } from "effect";
import { CoffeeAlreadyExists, CoffeeNotFound } from "@cool-beans/shared";
import {
  createRpcClientLayer,
  RpcClientLive,
} from "../test-utils/setup-rpc-test-server";
import { test } from "../test-utils/bun-test";

let ClientLive;

beforeAll(async () => {
  ClientLive = await createRpcClientLayer();
});

describe("Coffee RPC E2E", () => {
  describe("createCoffee", () => {
    test.effect("createCoffee should create a new coffee", () =>
      Effect.gen(function* () {
        // Arrange
        const uniqueName = `Test Coffee ${Date.now()}`;
        const client = yield* RpcClientLive;

        // Act
        const result = yield* Effect.either(
          client.createCoffee({
            name: uniqueName,
            origin: "Test Origin",
            roast: "Medium",
            price: 19.99,
            weight: "12oz",
            description: "A test coffee for e2e testing",
            inStock: true,
          })
        );

        // Assert
        expect(Either.isRight(result)).toBe(true);

        const coffee = Option.getOrThrow(Either.getRight(result));
        expect(coffee).toEqual({
          id: expect.any(Number),
          name: uniqueName,
          origin: "Test Origin",
          roast: "Medium",
          price: 19.99,
          weight: "12oz",
          description: "A test coffee for e2e testing",
          inStock: true,
        });
        expect(coffee.id).toBeGreaterThan(0); // Should be a valid ID
      }).pipe(Effect.provide(ClientLive))
    );

    test.effect(
      "createCoffee should fail when coffee with same name exists",
      () =>
        Effect.gen(function* () {
          // Arrange
          // First create a coffee
          const uniqueName = `Duplicate Test Coffee ${Date.now()}`;
          const client = yield* RpcClientLive;

          yield* client.createCoffee({
            name: uniqueName,
            origin: "Test Origin",
            roast: "Medium",
            price: 19.99,
            weight: "12oz",
            description: "A test coffee for e2e testing",
            inStock: true,
          });

          // Act
          const result = yield* Effect.either(
            client.createCoffee({
              name: uniqueName,
              origin: "Test Origin",
              roast: "Medium",
              price: 19.99,
              weight: "12oz",
              description: "A test coffee for e2e testing",
              inStock: true,
            })
          );

          // Assert
          expect(Either.isLeft(result)).toBe(true);

          const error = Option.getOrThrow(Either.getLeft(result));
          expect(error).toBeInstanceOf(CoffeeAlreadyExists);
          expect((error as CoffeeAlreadyExists).name).toBe(uniqueName);
          expect((error as CoffeeAlreadyExists).suggestion).toBe(
            `${uniqueName} 2`
          );
        }).pipe(Effect.provide(ClientLive))
    );
  });

  describe("updateCoffee", () => {
    test.effect("updateCoffee should update an existing coffee", () =>
      Effect.gen(function* () {
        // Arrange
        const uniqueName = `Update Test Coffee ${Date.now()}`;
        const client = yield* RpcClientLive;

        // First create a coffee
        const createResult = yield* Effect.either(
          client.createCoffee({
            name: uniqueName,
            origin: "Test Origin",
            roast: "Medium",
            price: 19.99,
            weight: "12oz",
            description: "A test coffee for e2e testing",
            inStock: true,
          })
        );

        expect(Either.isRight(createResult)).toBe(true);
        const createdCoffee = Option.getOrThrow(Either.getRight(createResult));

        // Act
        const result = yield* Effect.either(
          client.updateCoffee({
            id: createdCoffee.id,
            name: "Updated Test Coffee",
            origin: "Updated Origin",
            roast: "Dark",
            price: 29.99, // Updated price
            weight: "8oz",
            description: "Updated description with new price",
            inStock: false,
          })
        );

        // Assert
        expect(Either.isRight(result)).toBe(true);

        const updatedCoffee = Option.getOrThrow(Either.getRight(result));
        expect(updatedCoffee).toEqual({
          id: createdCoffee.id,
          name: "Updated Test Coffee",
          origin: "Updated Origin",
          roast: "Dark",
          price: 29.99,
          weight: "8oz",
          description: "Updated description with new price",
          inStock: false,
        });
      }).pipe(Effect.provide(ClientLive))
    );

    test.effect("updateCoffee should fail when coffee doesn't exist", () =>
      Effect.gen(function* () {
        // Arrange
        const client = yield* RpcClientLive;

        // Act
        const result = yield* Effect.either(
          client.updateCoffee({
            id: 999, // Non-existent ID
            name: "Non-existent Coffee",
            origin: "Nowhere",
            roast: "Medium",
            price: 19.99,
            weight: "12oz",
            description: "This coffee doesn't exist",
            inStock: true,
          })
        );

        // Assert
        expect(Either.isLeft(result)).toBe(true);

        const error = Option.getOrThrow(Either.getLeft(result));
        expect(error).toBeInstanceOf(CoffeeNotFound);
        expect((error as CoffeeNotFound).id).toBe(999);
      }).pipe(Effect.provide(ClientLive))
    );
  });

  describe("deleteCoffee", () => {
    test.effect("deleteCoffee should delete an existing coffee", () =>
      Effect.gen(function* () {
        // Arrange
        const uniqueName = `Delete Test Coffee ${Date.now()}`;
        const client = yield* RpcClientLive;

        // First create a coffee
        const createResult = yield* Effect.either(
          client.createCoffee({
            name: uniqueName,
            origin: "Test Origin",
            roast: "Medium",
            price: 19.99,
            weight: "12oz",
            description: "A test coffee for e2e testing",
            inStock: true,
          })
        );

        expect(Either.isRight(createResult)).toBe(true);
        const createdCoffee = Option.getOrThrow(Either.getRight(createResult));

        // Act
        const result = yield* Effect.either(
          client.deleteCoffee({ id: createdCoffee.id })
        );

        // Assert
        expect(Either.isRight(result)).toBe(true);

        const deleteResult = Option.getOrThrow(Either.getRight(result));
        expect(deleteResult).toBeUndefined(); // deleteCoffee returns void
      }).pipe(Effect.provide(ClientLive))
    );

    test.effect("deleteCoffee should fail when coffee doesn't exist", () =>
      Effect.gen(function* () {
        // Arrange
        const client = yield* RpcClientLive;

        // Act
        const result = yield* Effect.either(
          client.deleteCoffee({ id: 999 }) // Non-existent ID
        );

        // Assert
        expect(Either.isLeft(result)).toBe(true);

        const error = Option.getOrThrow(Either.getLeft(result));
        expect(error).toBeInstanceOf(CoffeeNotFound);
        expect((error as CoffeeNotFound).id).toBe(999);
      }).pipe(Effect.provide(ClientLive))
    );
  });

  describe("listCoffees", () => {
    test.effect("listCoffees should return coffee items", () =>
      Effect.gen(function* () {
        // Arrange
        const client = yield* RpcClientLive;

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
      }).pipe(Effect.provide(ClientLive))
    );

    test.effect(
      "listCoffees should reflect changes after create, update, and delete",
      () =>
        Effect.gen(function* () {
          // Arrange
          const client = yield* RpcClientLive;

          // Get initial count
          const initialResult = yield* Effect.either(client.listCoffees());
          expect(Either.isRight(initialResult)).toBe(true);
          const initialCoffees = Option.getOrThrow(
            Either.getRight(initialResult)
          );
          const initialCount = initialCoffees.length;

          // Act & Assert - Create a new coffee
          const createResult = yield* Effect.either(
            client.createCoffee({
              name: "Integration Test Coffee",
              origin: "Test Origin",
              roast: "Medium",
              price: 15.99,
              weight: "8oz",
              description: "Coffee for integration testing",
              inStock: true,
            })
          );

          expect(Either.isRight(createResult)).toBe(true);
          const newCoffee = Option.getOrThrow(Either.getRight(createResult));

          // Verify count increased
          const afterCreateResult = yield* Effect.either(client.listCoffees());
          expect(Either.isRight(afterCreateResult)).toBe(true);
          const afterCreate = Option.getOrThrow(
            Either.getRight(afterCreateResult)
          );
          expect(afterCreate.length).toBe(initialCount + 1);

          // Act & Assert - Update the coffee
          const updateResult = yield* Effect.either(
            client.updateCoffee({
              id: newCoffee.id,
              name: "Updated Integration Test Coffee",
              origin: "Updated Origin",
              roast: "Dark",
              price: 18.99,
              weight: "8oz",
              description: "Updated description",
              inStock: false,
            })
          );

          expect(Either.isRight(updateResult)).toBe(true);

          // Verify the update
          const afterUpdateResult = yield* Effect.either(client.listCoffees());
          expect(Either.isRight(afterUpdateResult)).toBe(true);
          const afterUpdate = Option.getOrThrow(
            Either.getRight(afterUpdateResult)
          );
          const updatedCoffee = afterUpdate.find((c) => c.id === newCoffee.id);
          expect(updatedCoffee?.name).toBe("Updated Integration Test Coffee");
          expect(updatedCoffee?.price).toBe(18.99);
          expect(updatedCoffee?.inStock).toBe(false);

          // Act & Assert - Delete the coffee
          const deleteResult = yield* Effect.either(
            client.deleteCoffee({ id: newCoffee.id })
          );

          expect(Either.isRight(deleteResult)).toBe(true);

          // Verify count is back to initial
          const afterDeleteResult = yield* Effect.either(client.listCoffees());
          expect(Either.isRight(afterDeleteResult)).toBe(true);
          const afterDelete = Option.getOrThrow(
            Either.getRight(afterDeleteResult)
          );
          expect(afterDelete.length).toBe(initialCount);
        }).pipe(Effect.provide(ClientLive))
    );
  });
});
