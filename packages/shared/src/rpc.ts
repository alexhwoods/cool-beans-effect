import { Schema } from "@effect/schema"
import { Rpc } from "@effect/rpc"

// User schema
export const User = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
})

export type User = Schema.Schema.Type<typeof User>

// Define RPC requests using Schema.TaggedRequest
export class GetUser extends Schema.TaggedRequest<GetUser>()(
  "GetUser",
  {
    failure: Schema.String,
    success: User,
    payload: {
      id: Schema.String,
    },
  }
) {}

export class CreateUser extends Schema.TaggedRequest<CreateUser>()(
  "CreateUser",
  {
    failure: Schema.String,
    success: User,
    payload: {
      name: Schema.String,
      email: Schema.String,
    },
  }
) {}

export class ListUsers extends Schema.TaggedRequest<ListUsers>()(
  "ListUsers",
  {
    failure: Schema.String,
    success: Schema.Array(User),
    payload: {},
  }
) {}

// Create RPC requests union type
export type UserRequests = GetUser | CreateUser | ListUsers

// Create the requests schema union
export const UserRequestsSchema = Schema.Union(GetUser, CreateUser, ListUsers)
