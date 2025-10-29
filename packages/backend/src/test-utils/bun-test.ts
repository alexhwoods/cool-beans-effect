import { Effect } from "effect";
import { test as bunTest } from "bun:test";

export const test = Object.assign({}, bunTest, {
  effect: <A, E, R>(
    name: string,
    fn: () => Effect.Effect<A, E, R>,
    options?: { timeout?: number }
  ) => {
    return bunTest(
      name,
      async () => {
        // Note: Effects with dependencies (R) will fail at runtime if not provided
        await Effect.runPromise(fn() as Effect.Effect<A, E, never>);
      },
      options
    );
  },
});
