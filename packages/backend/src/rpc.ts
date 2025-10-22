import { RpcServer } from "@effect/rpc";
import { Effect, Layer } from "effect";

import { AllRpcs } from "@cool-beans/shared";
import { makeUserRpcHandlers } from "./users/user.rpc";
import { UserServiceLive } from "./users/user.service";
import { makeFooRpcHandlers } from "./foo/foo.rpc";
import { FooServiceLive } from "./foo/foo.service";
import { makeCoffeeRpcHandlers } from "./coffee/coffee.rpc";
import { CoffeeServiceLive } from "./coffee/coffee.service";

// Combine all RPC handlers into a single implementation layer
const AllRpcHandlersLive = AllRpcs.toLayer(
  Effect.gen(function* () {
    const userHandlers = yield* makeUserRpcHandlers;
    const fooHandlers = yield* makeFooRpcHandlers;
    const coffeeHandlers = yield* makeCoffeeRpcHandlers;

    return {
      ...userHandlers,
      ...fooHandlers,
      ...coffeeHandlers,
    };
  })
);

// Main RPC layer with all dependencies
export const RpcLayerLive = RpcServer.layer(AllRpcs).pipe(
  Layer.provide(AllRpcHandlersLive),
  Layer.provide(UserServiceLive),
  Layer.provide(FooServiceLive),
  Layer.provide(CoffeeServiceLive)
);
