import { Effect } from 'effect'
import { GetUser, CreateUser, ListUsers } from '@collector/shared'
import type { User } from '@collector/shared'

const RPC_ENDPOINT = 'http://localhost:8000/rpc'

// Generic RPC call function
async function rpcCall<T>(request: { _tag: string }): Promise<T> {
  const response = await fetch(RPC_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`RPC call failed: ${response.statusText}`)
  }

  return response.json()
}

// Client functions
export async function getUser(id: string): Promise<User> {
  return rpcCall<User>(new GetUser({ id }))
}

export async function createUser(name: string, email: string): Promise<User> {
  return rpcCall<User>(new CreateUser({ name, email }))
}

export async function listUsers(): Promise<User[]> {
  return rpcCall<User[]>(new ListUsers({}))
}

// Example usage with Effect
export const getUserEffect = (id: string) => Effect.promise(() => getUser(id))

export const createUserEffect = (name: string, email: string) =>
  Effect.promise(() => createUser(name, email))

export const listUsersEffect = () => Effect.promise(() => listUsers())
