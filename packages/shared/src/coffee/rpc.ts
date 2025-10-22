import { Rpc } from "@effect/rpc";
import { Schema } from "effect";
import {
  Coffee,
  CreateCoffeeRequest,
  UpdateCoffeeRequest,
  DeleteCoffeeRequest,
} from "./schema";

export const listCoffees = Rpc.make("listCoffees", {
  payload: Schema.Void,
  success: Schema.Array(Coffee),
  stream: false,
});

export const createCoffee = Rpc.make("createCoffee", {
  payload: CreateCoffeeRequest,
  success: Coffee,
  stream: false,
});

export const updateCoffee = Rpc.make("updateCoffee", {
  payload: UpdateCoffeeRequest,
  success: Coffee,
  stream: false,
});

export const deleteCoffee = Rpc.make("deleteCoffee", {
  payload: DeleteCoffeeRequest,
  success: Schema.Void,
  stream: false,
});
