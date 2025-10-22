import { Schema } from "effect";

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
