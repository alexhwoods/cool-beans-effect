import { Effect } from "effect";
import { CoffeeService } from "./coffee.service";
import {
  CreateCoffeeRequest,
  UpdateCoffeeRequest,
  DeleteCoffeeRequest,
} from "@cool-beans/shared";

export const makeCoffeeRpcHandlers = Effect.gen(function* () {
  const coffeeService = yield* CoffeeService;

  return {
    listCoffees: () => coffeeService.listCoffees(),
    createCoffee: (request: CreateCoffeeRequest) =>
      coffeeService.createCoffee(request),
    updateCoffee: (request: UpdateCoffeeRequest) =>
      coffeeService.updateCoffee(request),
    deleteCoffee: (request: DeleteCoffeeRequest) =>
      coffeeService.deleteCoffee(request.id),
  };
});
