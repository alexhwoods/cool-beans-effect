import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer, Stream } from "effect";
import { UserRpcs } from "@cool-beans/shared";
import type { User } from "@cool-beans/shared";

import Image from "next/image";

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

export default async function Home() {
  // Choose which protocol to use

  function listUsers() {
    return Effect.gen(function* () {
      const client = yield* RpcClient.make(UserRpcs);
      return yield* Stream.runCollect(client.UserList()).pipe(
        Effect.map((users) => Array.from(users))
      );
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.runPromise<Array<User>, any>
    );
  }

  const users = await listUsers();

  return <div>{JSON.stringify(users)}</div>;
}
