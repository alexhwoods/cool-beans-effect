import { RpcServer } from "@effect/rpc";
import { Effect, Layer } from "effect";

import { AllRpcs } from "@cool-beans/shared";
import { makeCoffeeRpcHandlers } from "./coffee/coffee.rpc";
import { CoffeeServiceLive } from "./coffee/coffee.service";
import { makeConversationRpcHandlers } from "../src/conversation/conversation.rpc";
import { ConversationServiceLive } from "../src/conversation/conversation.service";
import {
  Gpt4o,
  OpenAiClientLive,
} from "../src/conversation/conversation.client";

// Combine all RPC handlers into a single implementation layer
const AllRpcHandlersLive = AllRpcs.toLayer(
  Effect.gen(function* () {
    const coffeeHandlers = yield* makeCoffeeRpcHandlers;
    const conversationHandlers = yield* makeConversationRpcHandlers;

    return {
      ...coffeeHandlers,
      ...conversationHandlers,
    };
  })
);

// Main RPC layer with all dependencies
export const RpcLayerLive = RpcServer.layer(AllRpcs).pipe(
  Layer.provide(AllRpcHandlersLive),
  Layer.provide(CoffeeServiceLive),
  Layer.provide(ConversationServiceLive),
  Layer.provide(Layer.provide(Gpt4o, OpenAiClientLive))
);
