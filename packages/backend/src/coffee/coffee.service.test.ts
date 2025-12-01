import { describe, expect } from "bun:test";
import { test } from "../test-utils/bun-test";
import { Effect, Either } from "effect";
import { CoffeeService, CoffeeServiceLive } from "./coffee.service";
import { CreateCoffeeRequest, CoffeeNotFound } from "@cool-beans/shared";

describe("CoffeeService", () => {
  test.effect("can create a coffee", () =>
    Effect.gen(function* () {
      // Arrange
      const coffeeService = yield* CoffeeService;
      const newCoffeeRequest: CreateCoffeeRequest = {
        name: "Kenya AA",
        origin: "Kenya",
        roast: "Medium",
        price: 27.99,
        weight: "12oz",
        description: "Bright acidity with berry and wine-like notes",
        inStock: true,
      };

      // Act
      const result = yield* Effect.either(
        coffeeService.create(newCoffeeRequest)
      );

      // Assert
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        const coffee = result.right;
        expect(coffee).toHaveProperty("id");
        expect(typeof coffee.id).toBe("number");
        expect(coffee.name).toBe(newCoffeeRequest.name);
        expect(coffee.origin).toBe(newCoffeeRequest.origin);
        expect(coffee.roast).toBe(newCoffeeRequest.roast);
        expect(coffee.price).toBe(newCoffeeRequest.price);
        expect(coffee.weight).toBe(newCoffeeRequest.weight);
        expect(coffee.description).toBe(newCoffeeRequest.description);
        expect(coffee.inStock).toBe(newCoffeeRequest.inStock);
      }
    }).pipe(Effect.provide(CoffeeServiceLive))
  );

  test.effect("can list all coffees", () =>
    Effect.gen(function* () {
      // Arrange
      const coffeeService = yield* CoffeeService;

      // Act
      const coffees = yield* coffeeService.list({});

      // Assert
      expect(coffees.length).toBeGreaterThan(0);
      expect(coffees.every((c) => c.id && c.name)).toBe(true);
    }).pipe(Effect.provide(CoffeeServiceLive))
  );

  test.effect("can filter coffees by name", () =>
    Effect.gen(function* () {
      // Arrange
      const coffeeService = yield* CoffeeService;

      // Act
      const coffees = yield* coffeeService.list({ name: "Ethiopian" });

      // Assert
      expect(coffees.length).toBeGreaterThan(0);
      expect(
        coffees.every((c) => c.name.toLowerCase().includes("ethiopian"))
      ).toBe(true);
    }).pipe(Effect.provide(CoffeeServiceLive))
  );

  test.effect("can filter coffees by name (case-insensitive)", () =>
    Effect.gen(function* () {
      // Arrange
      const coffeeService = yield* CoffeeService;

      // Act
      const coffees = yield* coffeeService.list({ name: "COLOMBIAN" });

      // Assert
      expect(coffees.length).toBeGreaterThan(0);
      expect(
        coffees.every((c) => c.name.toLowerCase().includes("colombian"))
      ).toBe(true);
    }).pipe(Effect.provide(CoffeeServiceLive))
  );

  test.effect("can filter coffees by id", () =>
    Effect.gen(function* () {
      // Arrange
      const coffeeService = yield* CoffeeService;

      // Act
      const coffees = yield* coffeeService.list({ id: 1 });

      // Assert
      expect(coffees.length).toBe(1);
      expect(coffees[0].id).toBe(1);
    }).pipe(Effect.provide(CoffeeServiceLive))
  );

  test.effect("can filter coffees by both name and id", () =>
    Effect.gen(function* () {
      // Arrange
      const coffeeService = yield* CoffeeService;

      // Act
      const coffees = yield* coffeeService.list({ name: "Ethiopian", id: 1 });

      // Assert
      expect(coffees.length).toBe(1);
      expect(coffees[0].id).toBe(1);
      expect(coffees[0].name.toLowerCase()).toContain("ethiopian");
    }).pipe(Effect.provide(CoffeeServiceLive))
  );

  test.effect(
    "returns empty array when filtering by name that doesn't exist",
    () =>
      Effect.gen(function* () {
        // Arrange
        const coffeeService = yield* CoffeeService;

        // Act
        const coffees = yield* coffeeService.list({
          name: "NonExistentCoffee123",
        });

        // Assert
        expect(coffees.length).toBe(0);
      }).pipe(Effect.provide(CoffeeServiceLive))
  );

  test.effect(
    "returns empty array when filtering by id that doesn't exist",
    () =>
      Effect.gen(function* () {
        // Arrange
        const coffeeService = yield* CoffeeService;

        // Act
        const coffees = yield* coffeeService.list({ id: 99999 });

        // Assert
        expect(coffees.length).toBe(0);
      }).pipe(Effect.provide(CoffeeServiceLive))
  );

  test.effect(
    "returns empty array when filtering by name and id with no match",
    () =>
      Effect.gen(function* () {
        // Arrange
        const coffeeService = yield* CoffeeService;

        // Act
        const coffees = yield* coffeeService.list({
          name: "Ethiopian",
          id: 99999,
        });

        // Assert
        expect(coffees.length).toBe(0);
      }).pipe(Effect.provide(CoffeeServiceLive))
  );

  test.effect("can update a coffee", () =>
    Effect.gen(function* () {
      // Arrange
      const coffeeService = yield* CoffeeService;
      const updateData = {
        name: "Updated Ethiopian Yirgacheffe",
        origin: "Ethiopia",
        roast: "Dark",
        price: 29.99,
        weight: "16oz",
        description: "Updated description with new tasting notes",
        inStock: false,
      };

      // Act
      const result = yield* Effect.either(coffeeService.update(1, updateData));

      // Assert
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        const coffee = result.right;
        expect(coffee.id).toBe(1);
        expect(coffee.name).toBe(updateData.name);
        expect(coffee.origin).toBe(updateData.origin);
        expect(coffee.roast).toBe(updateData.roast);
        expect(coffee.price).toBe(updateData.price);
        expect(coffee.weight).toBe(updateData.weight);
        expect(coffee.description).toBe(updateData.description);
        expect(coffee.inStock).toBe(updateData.inStock);
      }
    }).pipe(Effect.provide(CoffeeServiceLive))
  );

  test.effect("update persists changes to the coffee", () =>
    Effect.gen(function* () {
      // Arrange
      const coffeeService = yield* CoffeeService;
      const updateData = {
        name: "Persisted Update Test",
        origin: "Brazil",
        roast: "Medium",
        price: 19.99,
        weight: "10oz",
        description: "This update should persist",
        inStock: true,
      };

      // Act
      yield* coffeeService.update(2, updateData);
      const coffees = yield* coffeeService.list({ id: 2 });

      // Assert
      expect(coffees.length).toBe(1);
      const updatedCoffee = coffees[0];
      expect(updatedCoffee.id).toBe(2);
      expect(updatedCoffee.name).toBe(updateData.name);
      expect(updatedCoffee.origin).toBe(updateData.origin);
      expect(updatedCoffee.roast).toBe(updateData.roast);
      expect(updatedCoffee.price).toBe(updateData.price);
      expect(updatedCoffee.weight).toBe(updateData.weight);
      expect(updatedCoffee.description).toBe(updateData.description);
      expect(updatedCoffee.inStock).toBe(updateData.inStock);
    }).pipe(Effect.provide(CoffeeServiceLive))
  );

  test.effect("update returns CoffeeNotFound when coffee doesn't exist", () =>
    Effect.gen(function* () {
      // Arrange
      const coffeeService = yield* CoffeeService;
      const updateData = {
        name: "Non-existent Coffee",
        origin: "Nowhere",
        roast: "Light",
        price: 10.99,
        weight: "8oz",
        description: "This coffee doesn't exist",
        inStock: true,
      };

      // Act
      const result = yield* Effect.either(
        coffeeService.update(99999, updateData)
      );

      // Assert
      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left).toBeInstanceOf(CoffeeNotFound);
        if (result.left instanceof CoffeeNotFound) {
          expect(result.left.id).toBe(99999);
        }
      }
    }).pipe(Effect.provide(CoffeeServiceLive))
  );

  test.effect("can update all fields of a coffee", () =>
    Effect.gen(function* () {
      // Arrange
      const coffeeService = yield* CoffeeService;
      const originalCoffee = (yield* coffeeService.list({ id: 3 }))[0];
      const updateData = {
        name: "Completely New Name",
        origin: "New Origin",
        roast: "New Roast",
        price: 99.99,
        weight: "20oz",
        description: "Completely new description",
        inStock: !originalCoffee.inStock,
      };

      // Act
      const result = yield* Effect.either(coffeeService.update(3, updateData));

      // Assert
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        const coffee = result.right;
        expect(coffee.id).toBe(3);
        expect(coffee.name).not.toBe(originalCoffee.name);
        expect(coffee.origin).not.toBe(originalCoffee.origin);
        expect(coffee.roast).not.toBe(originalCoffee.roast);
        expect(coffee.price).not.toBe(originalCoffee.price);
        expect(coffee.weight).not.toBe(originalCoffee.weight);
        expect(coffee.description).not.toBe(originalCoffee.description);
        expect(coffee.inStock).not.toBe(originalCoffee.inStock);
      }
    }).pipe(Effect.provide(CoffeeServiceLive))
  );
});
