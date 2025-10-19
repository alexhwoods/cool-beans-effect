import { FetchHttpClient } from '@effect/platform'
import { RpcClient, RpcSerialization } from '@effect/rpc'
import { Effect, Layer, Stream } from 'effect'
import { UserRpcs } from '@collector/shared'
import type { User } from '@collector/shared'

// Choose which protocol to use
const ProtocolLive = RpcClient.layerProtocolHttp({
  url: 'http://localhost:8000/rpc',
}).pipe(
  Layer.provide([
    // use fetch for http requests
    FetchHttpClient.layer,
    // use ndjson for serialization
    RpcSerialization.layerNdjson,
  ]),
)

export function listUsers() {
  return Effect.gen(function* () {
    const client = yield* RpcClient.make(UserRpcs)
    return yield* Stream.runCollect(client.UserList()).pipe(
      Effect.map((users) => Array.from(users)),
    )
  }).pipe(
    Effect.scoped,
    Effect.provide(ProtocolLive),
    Effect.runPromise<Array<User>, any>,
  )
}
