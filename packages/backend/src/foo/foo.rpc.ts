import { Effect } from "effect";
import { FooRpcs } from "@collector/shared";
import { FooService } from "./foo.service";

export const FooRpcLive = FooRpcs.toLayer(
  Effect.gen(function* () {
    const fooService = yield* FooService;

    return {
      streamFoo: () => fooService.getFoos(),
    };
  })
);
