import { Effect } from "effect";
import { FooService } from "./foo.service";

export const makeFooRpcHandlers = Effect.gen(function* () {
  const fooService = yield* FooService;

  return {
    streamFoo: () => fooService.getFoos(),
    getFooResponse: () => fooService.getFooResponse(),
  };
});
