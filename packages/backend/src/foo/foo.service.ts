import { Context, Effect, Layer, Stream } from "effect";
import { Foo } from "@collector/shared";

// Define the FooService as a class with Context.Tag
export class FooService extends Context.Tag("FooService")<
  FooService,
  {
    readonly getFoos: () => Stream.Stream<Foo>;
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
    ]).pipe(Stream.tap(() => Effect.sleep("1 second"))),
});
