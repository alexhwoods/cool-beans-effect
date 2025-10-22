import { Effect, Layer } from "effect";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { FetchHttpClient } from "@effect/platform";
import { AllRpcs } from "@cool-beans/shared";

// Create the protocol layer
export const ProtocolLive = RpcClient.layerProtocolHttp({
  url: "http://localhost:8000/rpc",
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]));

// Export the RPC client maker for use in components
export const makeRpcClient = () => RpcClient.make(AllRpcs);
