import { Effect, Layer } from "effect";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { FetchHttpClient } from "@effect/platform";
import { AllRpcs } from "@cool-beans/shared";
import {
  Coffee,
  CreateCoffeeRequest,
  UpdateCoffeeRequest,
  DeleteCoffeeRequest,
} from "@cool-beans/shared";

// Create the protocol layer
const ProtocolLive = RpcClient.layerProtocolHttp({
  url: "http://localhost:8000/rpc",
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]));

// Coffee service functions
export const listCoffees = () =>
  Effect.gen(function* () {
    const client = yield* RpcClient.make(AllRpcs);
    return yield* client.listCoffees();
  }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

export const createCoffee = (request: CreateCoffeeRequest) =>
  Effect.gen(function* () {
    const client = yield* RpcClient.make(AllRpcs);
    return yield* client.createCoffee(request);
  }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

export const updateCoffee = (request: UpdateCoffeeRequest) =>
  Effect.gen(function* () {
    const client = yield* RpcClient.make(AllRpcs);
    return yield* client.updateCoffee(request);
  }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);

export const deleteCoffee = (request: DeleteCoffeeRequest) =>
  Effect.gen(function* () {
    const client = yield* RpcClient.make(AllRpcs);
    return yield* client.deleteCoffee(request);
  }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);
