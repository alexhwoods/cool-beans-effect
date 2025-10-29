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
        coffeeService.createCoffee(newCoffeeRequest)
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
});
