"use client";

import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer, Stream } from "effect";
import { AllRpcs } from "@collector/shared";
import { useEffect, useState } from "react";

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

export default function FooAiPage() {
  const [response, setResponse] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleGetResponse = () => {
    setResponse("");
    setError(null);
    setIsStreaming(true);
    setIsTyping(true);

    const program = Effect.gen(function* () {
      const client = yield* RpcClient.make(AllRpcs);

      // Stream the response and add it to state as it arrives
      yield* Stream.runForEach(client.getFooResponse(), (chunk) =>
        Effect.sync(() => {
          setResponse((prev) => chunk);
        })
      );

      setIsStreaming(false);
      setIsTyping(false);
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.catchAll((err) =>
        Effect.sync(() => {
          setError(String(err));
          setIsStreaming(false);
          setIsTyping(false);
        })
      )
    );

    Effect.runPromise(program);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Foo AI Response</h1>
          <button
            onClick={handleGetResponse}
            disabled={isStreaming}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/25"
          >
            {isStreaming ? "Streaming..." : "Get AI Response"}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 mb-6">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 min-h-[400px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h2 className="text-xl font-semibold text-white">AI Assistant</h2>
            {isTyping && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            )}
          </div>

          <div className="prose prose-invert max-w-none">
            {response ? (
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {response}
                {isTyping && (
                  <span className="inline-block w-2 h-5 bg-cyan-400 ml-1 animate-pulse"></span>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Click the button above to get an AI response about foo items...
              </p>
            )}
          </div>
        </div>

        {response && !isStreaming && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setResponse("")}
              className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors duration-200"
            >
              Clear Response
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
