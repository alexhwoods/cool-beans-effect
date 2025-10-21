"use client";

import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer, Stream } from "effect";
import { AllRpcs } from "@collector/shared";
import type { Foo } from "@collector/shared";
import { useEffect, useState } from "react";
import { HttpClient } from "@effect/platform/HttpClient";

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

export default function FooPage() {
  const [foos, setFoos] = useState<Foo[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Stream foos progressively as they arrive
    const program = Effect.gen(function* () {
      const client = yield* RpcClient.make(AllRpcs);

      // Stream items and add them to state as they arrive
      yield* Stream.runForEach(client.streamFoo(), (foo) =>
        Effect.sync(() => {
          setFoos((prev) => [...prev, foo]);
        })
      );

      setIsStreaming(false);
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.catchAll((err) =>
        Effect.sync(() => {
          setError(String(err));
          setIsStreaming(false);
        })
      )
    );

    Effect.runPromise(program.pipe);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Foo Items</h1>
          {isStreaming && (
            <div className="flex items-center gap-2 text-cyan-400">
              <div className="animate-pulse w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-sm">Streaming...</span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 mb-4">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        <div className="grid gap-4">
          {foos.map((foo, index) => (
            <div
              key={foo.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 animate-fade-in"
              style={{
                animation: `fadeIn 0.5s ease-in ${index * 0.1}s forwards`,
                opacity: 0,
              }}
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

        {foos.length === 0 && !isStreaming && !error && (
          <p className="text-gray-400 text-center">No foo items found.</p>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
