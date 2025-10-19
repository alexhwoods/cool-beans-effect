import { Effect } from "effect"
import type { GetUser, CreateUser, ListUsers, User } from "@collector/shared"

// In-memory user store
const users = new Map<string, User>()

// Seed some initial data
users.set("1", { id: "1", name: "Alice", email: "alice@example.com" })
users.set("2", { id: "2", name: "Bob", email: "bob@example.com" })

export const handleGetUser = (request: GetUser) =>
  Effect.gen(function* () {
    const user = users.get(request.id)
    if (!user) {
      return yield* Effect.fail(`User with id ${request.id} not found`)
    }
    return user
  })

export const handleCreateUser = (request: CreateUser) =>
  Effect.gen(function* () {
    const id = Math.random().toString(36).substring(7)
    const user: User = { id, name: request.name, email: request.email }
    users.set(id, user)
    return user
  })

export const handleListUsers = (_request: ListUsers) =>
  Effect.succeed(Array.from(users.values()))
