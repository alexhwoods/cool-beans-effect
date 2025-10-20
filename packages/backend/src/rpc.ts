import { RpcServer } from "@effect/rpc";
import { Effect, Layer } from "effect";

import { AllRpcs } from "@collector/shared";
import { makeUserRpcHandlers } from "./users/user.rpc";
import { UserServiceLive } from "./users/user.service";
import { makeFooRpcHandlers } from "./foo/foo.rpc";
import { FooServiceLive } from "./foo/foo.service";

// Combine all RPC handlers into a single implementation layer
const AllRpcHandlersLive = AllRpcs.toLayer(
  Effect.gen(function* () {
    const userHandlers = yield* makeUserRpcHandlers;
    const fooHandlers = yield* makeFooRpcHandlers;

    return {
      ...userHandlers,
      ...fooHandlers,
    };
  })
);

// Main RPC layer with all dependencies
export const RpcLayerLive = RpcServer.layer(AllRpcs).pipe(
  Layer.provide(AllRpcHandlersLive),
  Layer.provide(UserServiceLive),
  Layer.provide(FooServiceLive)
);
