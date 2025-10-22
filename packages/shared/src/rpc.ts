import { Rpc, RpcGroup } from "@effect/rpc";
import { getFooResponse, streamFoo } from "./foo";
import { listUsers } from "./users";
import {
  listCoffees,
  createCoffee,
  updateCoffee,
  deleteCoffee,
} from "./coffee";

export const AllRpcs = RpcGroup.make(
  streamFoo,
  getFooResponse,
  listUsers,
  listCoffees,
  createCoffee,
  updateCoffee,
  deleteCoffee
);
