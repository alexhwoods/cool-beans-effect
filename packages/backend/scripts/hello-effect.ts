import { Effect } from "effect";

// create an effect that logs "Hello, world!"
const program = Effect.gen(function* () {
  const x = "bar";

  yield* Effect.log("asdfasdf");
  yield* Effect.log("Hello, world!");
});

// run it
Effect.runPromise(program).then(() => {
  console.log("done");
});
