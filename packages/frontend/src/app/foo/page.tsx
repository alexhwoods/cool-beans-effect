import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer, Stream } from "effect";
import { FooRpcs } from "@collector/shared";
import type { Foo } from "@collector/shared";

const ProtocolLive = RpcClient.layerProtocolHttp({
  url: "http://localhost:8000/rpc",
}).pipe(
  Layer.provide([
    // use fetch for http requests
    FetchHttpClient.layer,
    // use ndjson for serialization
    RpcSerialization.layerNdjson,
  ])
);

export default async function FooPage() {
  function streamFoos() {
    return Effect.gen(function* () {
      const client = yield* RpcClient.make(FooRpcs);
      return yield* Stream.runCollect(client.streamFoo()).pipe(
        Effect.map((foos) => Array.from(foos))
      );
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.runPromise<Array<Foo>, any>
    );
  }

  const foos = await streamFoos();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Foo Items</h1>

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

        {foos.length === 0 && (
          <p className="text-gray-400 text-center">No foo items found.</p>
        )}
      </div>
    </div>
  );
}
