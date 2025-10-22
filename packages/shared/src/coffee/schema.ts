import { Schema, Data } from "effect";

export class CoffeeNotFound extends Data.TaggedError("CoffeeNotFound")<{
  readonly id: number;
}> {}

export class CoffeeAlreadyExists extends Data.TaggedError(
  "CoffeeAlreadyExists"
)<{
  readonly name: string;
  readonly suggestion?: string;
}> {}

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
