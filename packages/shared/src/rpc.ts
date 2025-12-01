import { RpcGroup } from "@effect/rpc";
import {
  listCoffees,
  createCoffee,
  updateCoffee,
  deleteCoffee,
} from "./coffee";

export const AllRpcs = RpcGroup.make(
  listCoffees,
  createCoffee,
  updateCoffee,
  deleteCoffee
);
