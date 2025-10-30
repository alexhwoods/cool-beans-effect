import { Schema, Data } from "effect";

// See here https://effect.website/docs/schema/classes/#tagged-class-variants
export class CoffeeAlreadyExists extends Schema.TaggedError<CoffeeAlreadyExists>()(
  "CoffeeAlreadyExists",
  {
    name: Schema.String,
    suggestion: Schema.String,
  }
) {}

export class CoffeeNotFound extends Schema.TaggedError<CoffeeNotFound>()(
  "CoffeeNotFound",
  {
    id: Schema.Int,
  }
) {}

export class Coffee extends Schema.Class<Coffee>("Coffee")({
  id: Schema.Number,
  name: Schema.String,
  origin: Schema.String,
  roast: Schema.String,
  price: Schema.Number,
  weight: Schema.String,
  description: Schema.String,
  inStock: Schema.Boolean,
}) {}

export class CreateCoffeeRequest extends Schema.Class<CreateCoffeeRequest>(
  "CreateCoffeeRequest"
)({
  name: Schema.String,
  origin: Schema.String,
  roast: Schema.String,
  price: Schema.Number,
  weight: Schema.String,
  description: Schema.String,
  inStock: Schema.Boolean,
}) {}

export class UpdateCoffeeRequest extends Schema.Class<UpdateCoffeeRequest>(
  "UpdateCoffeeRequest"
)({
  id: Schema.Number,
  name: Schema.String,
  origin: Schema.String,
  roast: Schema.String,
  price: Schema.Number,
  weight: Schema.String,
  description: Schema.String,
  inStock: Schema.Boolean,
}) {}

export class DeleteCoffeeRequest extends Schema.Class<DeleteCoffeeRequest>(
  "DeleteCoffeeRequest"
)({
  id: Schema.Number,
}) {}

export class CoffeeSuggestion extends Schema.Class<CoffeeSuggestion>(
  "CoffeeSuggestion"
)({
  name: Schema.String,
  origin: Schema.String,
  roast: Schema.String,
  price: Schema.Number,
  weight: Schema.String,
  description: Schema.String,
  inStock: Schema.Boolean,
}) {}
