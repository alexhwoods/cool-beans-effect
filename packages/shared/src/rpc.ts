import { RpcGroup } from "@effect/rpc";
import {
  listCoffees,
  createCoffee,
  updateCoffee,
  deleteCoffee,
} from "./coffee";
import { createConversation, sendUserMessage } from "./conversation";

export const AllRpcs = RpcGroup.make(
  listCoffees,
  createCoffee,
  updateCoffee,
  deleteCoffee,
  createConversation,
  sendUserMessage
);
