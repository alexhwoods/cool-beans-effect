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
});

export const createCoffee = Rpc.make("createCoffee", {
  payload: CreateCoffeeRequest,
  success: Coffee,
});

export const updateCoffee = Rpc.make("updateCoffee", {
  payload: UpdateCoffeeRequest,
  success: Coffee,
});

export const deleteCoffee = Rpc.make("deleteCoffee", {
  payload: DeleteCoffeeRequest,
  success: Schema.Void,
});
