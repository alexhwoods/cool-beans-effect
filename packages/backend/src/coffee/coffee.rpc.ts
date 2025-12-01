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
      coffeeService.list({}).pipe(Effect.withSpan("coffee.rpc.listCoffees")),
    createCoffee: (request: CreateCoffeeRequest) =>
      coffeeService.create(request).pipe(
        Effect.withSpan("coffee.rpc.createCoffee", {
          attributes: { request },
        })
      ),
    updateCoffee: (request: UpdateCoffeeRequest) =>
      coffeeService.update(request.id, request).pipe(
        Effect.withSpan("coffee.rpc.updateCoffee", {
          attributes: { request },
        })
      ),
    deleteCoffee: (request: DeleteCoffeeRequest) =>
      coffeeService.delete(request.id).pipe(
        Effect.withSpan("coffee.rpc.deleteCoffee", {
          attributes: { request },
        })
      ),
  };
});
