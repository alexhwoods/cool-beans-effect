import { describe, expect } from "bun:test";
import { test } from "../test-utils/bun-test";
import { Effect, Either } from "effect";
import { CoffeeService, CoffeeServiceLive } from "./coffee.service";
import { CreateCoffeeRequest } from "@cool-beans/shared";

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
});
