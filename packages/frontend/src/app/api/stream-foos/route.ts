import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer, Stream } from "effect";
import { AllRpcs } from "@cool-beans/shared";

const ProtocolLive = RpcClient.layerProtocolHttp({
  url: "http://localhost:8000/rpc",
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]));

export async function GET() {
  // Create a ReadableStream that will stream the foo items
  const stream = new ReadableStream({
    async start(controller) {
      const program = Effect.gen(function* () {
        const client = yield* RpcClient.make(AllRpcs);

        // Stream each foo item as it arrives
        yield* Stream.runForEach(client.streamFoo(), (foo) =>
          Effect.sync(() => {
            // Send each item as a newline-delimited JSON chunk
            const data = JSON.stringify(foo) + "\n";
            controller.enqueue(new TextEncoder().encode(data));
          })
        );

        // Close the stream when done
        controller.close();
      }).pipe(
        Effect.scoped,
        Effect.provide(ProtocolLive),
        Effect.catchAll((error) =>
          Effect.sync(() => {
            console.error("Stream error:", error);
            controller.error(error);
          })
        )
      );

      await Effect.runPromise(program);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
