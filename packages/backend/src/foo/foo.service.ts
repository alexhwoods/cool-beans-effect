import { Context, Effect, Layer, Random, Stream } from "effect";
import { Foo } from "@cool-beans/shared";

export class FooService extends Context.Tag("FooService")<
  FooService,
  {
    readonly getFoos: () => Stream.Stream<Foo>;
    readonly getFooResponse: () => Stream.Stream<string>;
  }
>() {}

// Implementation of the FooService
export const FooServiceLive = Layer.succeed(FooService, {
  getFoos: () =>
    Stream.fromIterable([
      { id: "1", name: "Foo One", description: "The first foo" },
      { id: "2", name: "Foo Two", description: "The second foo" },
      { id: "3", name: "Foo Three", description: "The third foo" },
      { id: "4", name: "Foo Four", description: "The fourth foo" },
      { id: "5", name: "Foo Five", description: "The fifth foo" },
      { id: "6", name: "Foo Six", description: "The sixth foo" },
      { id: "7", name: "Foo Seven", description: "The seventh foo" },
      { id: "8", name: "Foo Eight", description: "The eighth foo" },
      { id: "9", name: "Foo Nine", description: "The ninth foo" },
    ]).pipe(
      Stream.tap(() =>
        Effect.gen(function* () {
          // Increase for dramatic effect
          const jitter = yield* Random.nextIntBetween(1, 20);
          yield* Effect.sleep(`${jitter} millis`);
        })
      )
    ),
  getFooResponse: () => {
    const paragraph =
      "The quick brown fox jumps over the lazy dog. This is a sample paragraph that will be streamed slowly to demonstrate the streaming capabilities of the RPC framework. Each word appears with a small delay to simulate real-time text generation.";
    const words = paragraph.split(" ");

    return Stream.fromIterable(words).pipe(
      Stream.tap(() =>
        Effect.gen(function* () {
          // Add delay between 50ms and 150ms per word
          const delay = yield* Random.nextIntBetween(1, 10);
          yield* Effect.sleep(`${delay} millis`);
        })
      ),
      Stream.mapAccum("", (acc, word) => {
        const newAcc = acc ? `${acc} ${word}` : word;
        return [newAcc, newAcc];
      })
    );
  },
});
