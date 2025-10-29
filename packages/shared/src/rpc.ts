import { Rpc, RpcGroup } from "@effect/rpc";
import { getFooResponse, streamFoo } from "./foo";
import {
  listCoffees,
  createCoffee,
  updateCoffee,
  deleteCoffee,
} from "./coffee";

export const AllRpcs = RpcGroup.make(
  streamFoo,
  getFooResponse,
  listCoffees,
  createCoffee,
  updateCoffee,
  deleteCoffee
);
