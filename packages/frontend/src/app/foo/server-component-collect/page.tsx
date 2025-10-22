import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer, Stream } from "effect";
import { AllRpcs } from "@cool-beans/shared";
import type { Foo } from "@cool-beans/shared";
import { Suspense } from "react";

const ProtocolLive = RpcClient.layerProtocolHttp({
  url: "http://localhost:8000/rpc",
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]));

async function streamFoos() {
  return Effect.gen(function* () {
    const client = yield* RpcClient.make(AllRpcs);
    return yield* Stream.runCollect(client.streamFoo()).pipe(
      Effect.map((foos) => Array.from(foos))
    );
  }).pipe(Effect.scoped, Effect.provide(ProtocolLive), Effect.runPromise);
}

async function FooList() {
  const foos = await streamFoos();

  return (
    <div className="grid gap-4">
      {foos.map((foo) => (
        <div
          key={foo.id}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                {foo.name}
              </h2>
              <p className="text-gray-400">{foo.description}</p>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              ID: {foo.id}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      <p className="text-gray-400 mt-4">Loading foo items...</p>
    </div>
  );
}

export default function FooServerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">
            Foo Items (Server Component)
          </h1>
          <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
            Server Rendered
          </span>
        </div>

        <div className="bg-blue-500/10 border border-blue-500 rounded-xl p-4 mb-6">
          <p className="text-blue-400 text-sm">
            <strong>Server Component:</strong> This page fetches all data on the
            server before rendering. The entire list loads at once after all
            items are collected.
          </p>
        </div>

        <Suspense fallback={<LoadingState />}>
          <FooList />
        </Suspense>
      </div>
    </div>
  );
}
