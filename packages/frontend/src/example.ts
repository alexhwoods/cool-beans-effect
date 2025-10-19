import { Effect } from "effect"
import { listUsersEffect, getUserEffect, createUserEffect } from "./rpc-client.js"

// Example: List all users
export const example1 = Effect.gen(function* () {
  console.log("Listing all users...")
  const users = yield* listUsersEffect()
  console.log("Users:", users)
  return users
})

// Example: Get a specific user
export const example2 = Effect.gen(function* () {
  console.log("Getting user with id 1...")
  const user = yield* getUserEffect("1")
  console.log("User:", user)
  return user
})

// Example: Create a new user
export const example3 = Effect.gen(function* () {
  console.log("Creating new user...")
  const newUser = yield* createUserEffect("Charlie", "charlie@example.com")
  console.log("Created user:", newUser)
  return newUser
})

// Example: Chain multiple operations
export const example4 = Effect.gen(function* () {
  console.log("Creating user and listing all users...")

  const created = yield* createUserEffect("Diana", "diana@example.com")
  console.log("Created:", created)

  const allUsers = yield* listUsersEffect()
  console.log("All users:", allUsers)

  return { created, allUsers }
})

// Run an example
if (import.meta.main) {
  Effect.runPromise(example4).then(
    (result) => console.log("Success:", result),
    (error) => console.error("Error:", error)
  )
}
