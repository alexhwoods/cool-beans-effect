# Collector - Bun Monorepo with Effect & Effect RPC

A Bun monorepo showcasing Effect and Effect RPC for type-safe communication between frontend and backend.

## 📁 Structure

```
collector/
├── packages/
│   ├── shared/          # Shared RPC schemas and types
│   ├── backend/         # Effect RPC server
│   └── frontend/        # RPC client examples
└── package.json         # Workspace configuration
```

## 🚀 Getting Started

### Install Dependencies

```bash
bun install
```

### Run Backend Server

```bash
bun run --filter @cool-beans/backend dev
```

The server will start on `http://localhost:8000` with the RPC endpoint at `/rpc`.

### Run Frontend Examples

In a separate terminal:

```bash
bun run packages/frontend/src/example.ts
```

## 📦 Packages

### @cool-beans/shared

Contains shared RPC request/response schemas using `@effect/schema`:

- `GetUser` - Fetch a user by ID
- `CreateUser` - Create a new user
- `ListUsers` - List all users

### @cool-beans/backend

Effect-based HTTP server with RPC handlers using:

- `@effect/platform` - HTTP server abstractions
- `@effect/platform-bun` - Bun-specific runtime
- Effect `RequestResolver` for handling RPC requests

**Endpoints:**

- `GET /` - Health check
- `POST /rpc` - RPC endpoint

### @cool-beans/frontend

RPC client utilities and examples demonstrating:

- Direct async/await RPC calls
- Effect-wrapped RPC calls
- Composing multiple RPC operations

## 🔧 Available Scripts

```bash
# Run all packages in dev mode
bun run dev

# Run specific package
bun run --filter @cool-beans/backend dev
bun run --filter @cool-beans/frontend dev

# Build all packages
bun run build

# Clean all packages
bun run clean
```

## 📚 Key Concepts

### RPC Schema Definition

```typescript
// In shared package
export class GetUser extends Schema.TaggedRequest<GetUser>()("GetUser", {
  failure: Schema.String,
  success: User,
  payload: {
    id: Schema.String,
  },
}) {}
```

### Backend Handler

```typescript
// RequestResolver with Effect
export const GetUserResolver = RequestResolver.fromEffect((request: GetUser) =>
  Effect.gen(function* () {
    const user = users.get(request.id);
    if (!user) {
      return yield* Effect.fail(`User not found`);
    }
    return user;
  })
);
```

### Frontend Client

```typescript
// Simple async wrapper
export async function getUser(id: string): Promise<User> {
  return rpcCall<User>(new GetUser({ id }));
}

// Or use Effect directly
export const getUserEffect = (id: string) => Effect.promise(() => getUser(id));
```

## 🛠 Technologies

- **[Bun](https://bun.sh)** - Fast JavaScript runtime & package manager
- **[Effect](https://effect.website)** - Powerful TypeScript framework
- **[@effect/schema](https://effect.website/docs/schema)** - Schema validation
- **[@effect/platform](https://effect.website/docs/platform)** - Platform abstractions
- **[@effect/rpc](https://effect-ts.github.io/effect/docs/rpc)** - Type-safe RPC

## 📝 Example Usage

```typescript
import { Effect } from "effect";
import { createUserEffect, listUsersEffect } from "./rpc-client";

const program = Effect.gen(function* () {
  // Create a user
  const newUser = yield* createUserEffect("Alice", "alice@example.com");

  // List all users
  const users = yield* listUsersEffect();

  return { newUser, users };
});

// Run the program
Effect.runPromise(program);
```
