import { Rpc } from "@effect/rpc";
import { Schema } from "effect";
import {
  Coffee,
  CreateCoffeeRequest,
  UpdateCoffeeRequest,
  DeleteCoffeeRequest,
} from "./schema";

export const listCoffees = Rpc.make("listCoffees", {
  success: Schema.Array(Coffee),
  stream: false,
});

export const createCoffee = Rpc.make("createCoffee", {
  success: Coffee,
  stream: false,
});

export const updateCoffee = Rpc.make("updateCoffee", {
  success: Coffee,
  stream: false,
});

export const deleteCoffee = Rpc.make("deleteCoffee", {
  success: Schema.Void,
  stream: false,
});
