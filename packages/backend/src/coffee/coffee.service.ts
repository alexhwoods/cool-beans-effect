import { Context, Effect, Layer, Ref } from "effect";
import {
  Coffee,
  CoffeeNotFound,
  CoffeeAlreadyExists,
} from "@cool-beans/shared";

export class CoffeeService extends Context.Tag("CoffeeService")<
  CoffeeService,
  {
    readonly list: () => Effect.Effect<Coffee[]>;
    readonly generateSuggestion: (name: string) => Effect.Effect<string>;
    // do not reuse RPC Schema types for input here
    // that's a different abstraction level
    readonly create: (input: {
      name: string;
      origin: string;
      roast: string;
      price: number;
      weight: string;
      description: string;
      inStock: boolean;
    }) => Effect.Effect<Coffee, CoffeeAlreadyExists>;
    readonly update: (
      id: number,
      input: {
        name: string;
        origin: string;
        roast: string;
        price: number;
        weight: string;
        description: string;
        inStock: boolean;
      }
    ) => Effect.Effect<Coffee, CoffeeNotFound>;
    readonly delete: (id: number) => Effect.Effect<void, CoffeeNotFound>;
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

  const self: Context.Tag.Service<typeof CoffeeService> = {
    list: () => Ref.get(coffeeRef).pipe(Effect.withSpan("coffee.service.list")),

    generateSuggestion: (name: string) =>
      Effect.gen(function* () {
        const coffees = yield* self.list();
        let suggestion = name;
        let counter = 2;
        while (
          coffees.some((c) => c.name.toLowerCase() === suggestion.toLowerCase())
        ) {
          suggestion = `${name} ${counter}`;
          counter++;
        }
        return suggestion;
      }).pipe(
        Effect.withSpan("coffee.service.generateSuggestion", {
          attributes: { "coffee.name": name },
        })
      ),

    create: (coffeeData: {
      name: string;
      origin: string;
      roast: string;
      price: number;
      weight: string;
      description: string;
      inStock: boolean;
    }) =>
      Effect.gen(function* () {
        const coffees = yield* self.list();

        // Check if coffee with this name already exists
        const existingCoffee = coffees.find(
          (c) => c.name.toLowerCase() === coffeeData.name.toLowerCase()
        );

        if (existingCoffee) {
          const suggestion = yield* self.generateSuggestion(coffeeData.name);

          yield* Effect.fail(
            new CoffeeAlreadyExists({
              name: coffeeData.name,
              suggestion,
            })
          );
        }

        const coffee = new Coffee({
          id: nextId++,
          name: coffeeData.name,
          origin: coffeeData.origin,
          roast: coffeeData.roast,
          price: coffeeData.price,
          weight: coffeeData.weight,
          description: coffeeData.description,
          inStock: coffeeData.inStock,
        });

        yield* Ref.set(coffeeRef, [...coffees, coffee]);
        return coffee;
      }).pipe(
        Effect.withSpan("coffee.service.create", {
          attributes: {
            "coffee.name": coffeeData.name,
            "coffee.origin": coffeeData.origin,
            "coffee.roast": coffeeData.roast,
            "coffee.price": coffeeData.price,
            "coffee.weight": coffeeData.weight,
            "coffee.description": coffeeData.description,
            "coffee.inStock": coffeeData.inStock,
          },
        })
      ),

    update: (
      id: number,
      coffeeData: {
        name: string;
        origin: string;
        roast: string;
        price: number;
        weight: string;
        description: string;
        inStock: boolean;
      }
    ) =>
      Effect.gen(function* () {
        const coffees = yield* self.list();

        const coffeeIndex = coffees.findIndex((c) => c.id === id);

        if (coffeeIndex === -1) {
          yield* Effect.fail(new CoffeeNotFound({ id }));
        }

        const coffee = new Coffee({
          id,
          name: coffeeData.name,
          origin: coffeeData.origin,
          roast: coffeeData.roast,
          price: coffeeData.price,
          weight: coffeeData.weight,
          description: coffeeData.description,
          inStock: coffeeData.inStock,
        });

        const updatedCoffees = [...coffees];
        updatedCoffees[coffeeIndex] = coffee;
        yield* Ref.set(coffeeRef, updatedCoffees);

        return coffee;
      }).pipe(
        Effect.withSpan("coffee.service.update", {
          attributes: {
            "coffee.id": id,
            "coffee.name": coffeeData.name,
            "coffee.origin": coffeeData.origin,
            "coffee.roast": coffeeData.roast,
            "coffee.price": coffeeData.price,
            "coffee.weight": coffeeData.weight,
            "coffee.description": coffeeData.description,
            "coffee.inStock": coffeeData.inStock,
          },
        })
      ),

    delete: (id: number) =>
      Effect.gen(function* () {
        const coffees = yield* self.list();

        const coffeeExists = coffees.some((c) => c.id === id);

        if (!coffeeExists) {
          yield* Effect.fail(new CoffeeNotFound({ id }));
        }

        const filteredCoffees = coffees.filter((c) => c.id !== id);
        yield* Ref.set(coffeeRef, filteredCoffees);
      }).pipe(
        Effect.withSpan("coffee.service.delete", {
          attributes: { "coffee.id": id },
        })
      ),
  };

  return self;
}).pipe(Layer.effect(CoffeeService));
