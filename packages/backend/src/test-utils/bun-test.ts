import { Effect } from "effect";
import { test as bunTest } from "bun:test";

// Helper function to create an effect test runner with skip/only methods
const createEffectTest = (testFn: typeof bunTest) => {
  const effectTest = <A, E, R>(
    name: string,
    fn: () => Effect.Effect<A, E, R>,
    options?: { timeout?: number }
  ) => {
    return testFn(
      name,
      async () => {
        // Note: Effects with dependencies (R) will fail at runtime if not provided
        await Effect.runPromise(fn() as Effect.Effect<A, E, never>);
      },
      options
    );
  };

  // Add skip and only methods that also support effects
  effectTest.skip = <A, E, R>(
    name: string,
    fn: () => Effect.Effect<A, E, R>,
    options?: { timeout?: number }
  ) => {
    return testFn.skip(
      name,
      async () => {
        await Effect.runPromise(fn() as Effect.Effect<A, E, never>);
      },
      options
    );
  };

  effectTest.only = <A, E, R>(
    name: string,
    fn: () => Effect.Effect<A, E, R>,
    options?: { timeout?: number }
  ) => {
    return testFn.only(
      name,
      async () => {
        await Effect.runPromise(fn() as Effect.Effect<A, E, never>);
      },
      options
    );
  };

  return effectTest;
};

// Extend the original Bun `test` function so built-ins like `test.only` and
// `test.skip` continue to work, while adding a convenient `test.effect` helper
// that also supports `.skip` and `.only`.
export const test = Object.assign(bunTest, {
  effect: createEffectTest(bunTest),
});
