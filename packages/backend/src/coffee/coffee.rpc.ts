import { Effect } from "effect";
import { CoffeeService } from "./coffee.service";

export const makeCoffeeRpcHandlers = Effect.gen(function* () {
  const coffeeService = yield* CoffeeService;

  return {
    listCoffees: () => coffeeService.listCoffees(),
    createCoffee: (request) => coffeeService.createCoffee(request),
    updateCoffee: (request) => coffeeService.updateCoffee(request),
    deleteCoffee: (request) => coffeeService.deleteCoffee(request.id),
  };
});
