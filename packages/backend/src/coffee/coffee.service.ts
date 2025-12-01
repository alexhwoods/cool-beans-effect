import { Context, Effect, Layer, Ref } from "effect";
import {
  Coffee,
  CreateCoffeeRequest,
  UpdateCoffeeRequest,
  CoffeeNotFound,
  CoffeeAlreadyExists,
} from "@cool-beans/shared";

export class CoffeeService extends Context.Tag("CoffeeService")<
  CoffeeService,
  {
    readonly listCoffees: () => Effect.Effect<Coffee[]>;
    readonly createCoffee: (
      request: CreateCoffeeRequest
    ) => Effect.Effect<Coffee, CoffeeAlreadyExists>;
    readonly updateCoffee: (
      request: UpdateCoffeeRequest
    ) => Effect.Effect<Coffee, CoffeeNotFound>;
    readonly deleteCoffee: (id: number) => Effect.Effect<void, CoffeeNotFound>;
  }
>() {}

// In-memory storage for coffee data
const initialCoffees: Coffee[] = [
  new Coffee({
    id: 1,
    name: "Ethiopian Yirgacheffe",
    origin: "Ethiopia",
    roast: "Light",
    price: 24.99,
    weight: "12oz",
    description: "Bright and floral with notes of jasmine and citrus",
    inStock: true,
  }),
  new Coffee({
    id: 2,
    name: "Colombian Supremo",
    origin: "Colombia",
    roast: "Medium",
    price: 22.99,
    weight: "12oz",
    description: "Rich and balanced with chocolate and nutty undertones",
    inStock: true,
  }),
  new Coffee({
    id: 3,
    name: "Guatemala Antigua",
    origin: "Guatemala",
    roast: "Medium-Dark",
    price: 26.99,
    weight: "12oz",
    description: "Full-bodied with smoky notes and a spicy finish",
    inStock: false,
  }),
  new Coffee({
    id: 4,
    name: "Jamaican Blue Mountain",
    origin: "Jamaica",
    roast: "Medium",
    price: 89.99,
    weight: "8oz",
    description: "Smooth and mild with a clean, bright finish",
    inStock: true,
  }),
  new Coffee({
    id: 5,
    name: "Hawaiian Kona",
    origin: "Hawaii",
    roast: "Medium",
    price: 45.99,
    weight: "10oz",
    description: "Rich and smooth with a hint of sweetness",
    inStock: true,
  }),
  new Coffee({
    id: 6,
    name: "Sumatra Mandheling",
    origin: "Indonesia",
    roast: "Dark",
    price: 28.99,
    weight: "12oz",
    description: "Earthy and full-bodied with low acidity",
    inStock: true,
  }),
];

export const CoffeeServiceLive = Effect.gen(function* () {
  // While we have little concurrency, this may be unnecessary, but probably a good idea to
  // go ahead and use this. https://effect.website/docs/state-management/ref/
  const coffeeRef = yield* Ref.make(initialCoffees);
  let nextId = Math.max(...initialCoffees.map((c) => c.id)) + 1;

  return CoffeeService.of({
    listCoffees: () =>
      Ref.get(coffeeRef).pipe(Effect.withSpan("coffee.service.listCoffees")),

    createCoffee: (request: CreateCoffeeRequest) =>
      Effect.gen(function* () {
        const coffees = yield* Ref.get(coffeeRef);

        // Check if coffee with this name already exists
        const existingCoffee = coffees.find(
          (c) => c.name.toLowerCase() === request.name.toLowerCase()
        );

        if (existingCoffee) {
          // Generate a suggestion by appending a number
          let suggestion = request.name;
          let counter = 2;
          while (
            coffees.some(
              (c) => c.name.toLowerCase() === suggestion.toLowerCase()
            )
          ) {
            suggestion = `${request.name} ${counter}`;
            counter++;
          }

          yield* Effect.fail(
            new CoffeeAlreadyExists({
              name: request.name,
              suggestion,
            })
          );
        }

        const coffee = new Coffee({
          id: nextId++,
          name: request.name,
          origin: request.origin,
          roast: request.roast,
          price: request.price,
          weight: request.weight,
          description: request.description,
          inStock: request.inStock,
        });

        yield* Ref.set(coffeeRef, [...coffees, coffee]);
        return coffee;
      }).pipe(
        Effect.withSpan("coffee.service.createCoffee", {
          attributes: {
            "coffee.name": request.name,
            "coffee.origin": request.origin,
            "coffee.roast": request.roast,
            "coffee.price": request.price,
          },
        })
      ),

    updateCoffee: (request: UpdateCoffeeRequest) =>
      Effect.gen(function* () {
        const coffees = yield* Ref.get(coffeeRef);

        const coffeeIndex = coffees.findIndex((c) => c.id === request.id);

        if (coffeeIndex === -1) {
          yield* Effect.fail(new CoffeeNotFound({ id: request.id }));
        }

        const coffee = new Coffee({
          id: request.id,
          name: request.name,
          origin: request.origin,
          roast: request.roast,
          price: request.price,
          weight: request.weight,
          description: request.description,
          inStock: request.inStock,
        });

        const updatedCoffees = [...coffees];
        updatedCoffees[coffeeIndex] = coffee;
        yield* Ref.set(coffeeRef, updatedCoffees);

        return coffee;
      }).pipe(
        Effect.withSpan("coffee.service.updateCoffee", {
          attributes: {
            "coffee.id": request.id,
            "coffee.name": request.name,
          },
        })
      ),

    deleteCoffee: (id: number) =>
      Effect.gen(function* () {
        const coffees = yield* Ref.get(coffeeRef);

        const coffeeExists = coffees.some((c) => c.id === id);

        if (!coffeeExists) {
          yield* Effect.fail(new CoffeeNotFound({ id }));
        }

        const filteredCoffees = coffees.filter((c) => c.id !== id);
        yield* Ref.set(coffeeRef, filteredCoffees);
      }).pipe(
        Effect.withSpan("coffee.service.deleteCoffee", {
          attributes: { "coffee.id": id },
        })
      ),
  });
}).pipe(Layer.effect(CoffeeService));
