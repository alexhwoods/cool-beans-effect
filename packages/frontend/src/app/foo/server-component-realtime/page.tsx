import type { Foo } from "@collector/shared";
import { AllRpcs } from "@collector/shared";
import { Suspense } from "react";
import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer, Stream, Chunk } from "effect";

const ProtocolLive = RpcClient.layerProtocolHttp({
  url: "http://localhost:8000/rpc",
}).pipe(
  Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson])
);

// Fetch ALL items from the stream once and cache the result
async function fetchAllFoos(): Promise<readonly Foo[]> {
  const program = Effect.gen(function* () {
    const client = yield* RpcClient.make(AllRpcs);

    // Collect all items from the stream
    const items = yield* Stream.runCollect(client.streamFoo());
    return Chunk.toReadonlyArray(items);
  }).pipe(Effect.scoped, Effect.provide(ProtocolLive));

  return await Effect.runPromise(program);
}

// Create a single shared promise for all components to use
const allFoosPromise = fetchAllFoos();

async function FooItem({ index }: { index: number }) {
  // All components share the same promise, so the stream is only fetched once
  const allFoos = await allFoosPromise;
  const foo = allFoos[index];

  if (!foo) return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            {foo.name}
          </h2>
          <p className="text-gray-400">{foo.description}</p>
        </div>
        <span className="text-xs text-gray-500 font-mono">ID: {foo.id}</span>
      </div>
    </div>
  );
}

function FooSkeleton() {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-8 bg-slate-700/50 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
        </div>
        <div className="h-4 bg-slate-700/50 rounded w-16"></div>
      </div>
    </div>
  );
}

export default function FooServerRealtimePage() {
  // We know we have 9 items based on the backend
  const itemCount = 9;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">
            Foo Items (Server Streaming)
          </h1>
          <span className="text-xs text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">
            Server Streaming
          </span>
        </div>

        <div className="bg-purple-500/10 border border-purple-500 rounded-xl p-4 mb-6">
          <p className="text-purple-400 text-sm">
            <strong>Server Component with Streaming:</strong> This page uses
            React Server Components with Suspense boundaries. Each item is
            wrapped in a Suspense boundary that streams progressively as data
            becomes available.
          </p>
        </div>

        <div className="grid gap-4">
          {Array.from({ length: itemCount }, (_, index) => (
            <Suspense key={index} fallback={<FooSkeleton />}>
              <FooItem index={index} />
            </Suspense>
          ))}
        </div>
      </div>
    </div>
  );
}
