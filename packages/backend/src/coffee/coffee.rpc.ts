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
    listCoffees: () =>
      coffeeService.list().pipe(Effect.withSpan("coffee.rpc.listCoffees")),
    createCoffee: (request: CreateCoffeeRequest) =>
      coffeeService.create(request).pipe(
        Effect.withSpan("coffee.rpc.createCoffee", {
          attributes: { "coffee.name": request.name },
        })
      ),
    updateCoffee: (request: UpdateCoffeeRequest) =>
      coffeeService.updateCoffee(request).pipe(
        Effect.withSpan("coffee.rpc.updateCoffee", {
          attributes: { "coffee.id": request.id, "coffee.name": request.name },
        })
      ),
    deleteCoffee: (request: DeleteCoffeeRequest) =>
      coffeeService.deleteCoffee(request.id).pipe(
        Effect.withSpan("coffee.rpc.deleteCoffee", {
          attributes: { "coffee.id": request.id },
        })
      ),
  };
});
