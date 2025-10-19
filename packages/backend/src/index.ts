import {
  HttpServer,
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import { Schema } from "@effect/schema";
import { GetUser, CreateUser, ListUsers } from "@collector/shared";
import {
  GetUserResolver,
  CreateUserResolver,
  ListUsersResolver,
} from "./router.js";

// Simple RPC handler that routes requests based on _tag
const handleRpc = HttpServerRequest.HttpServerRequest.pipe(
  Effect.flatMap((request) => request.json),
  Effect.flatMap((body) => {
    const bodyObj = body as { _tag?: string };

    // Parse and handle based on request type
    if (bodyObj._tag === "GetUser") {
      return Schema.decodeUnknown(GetUser)(body).pipe(
        Effect.flatMap((parsed) => Effect.request(parsed, GetUserResolver)),
        Effect.map((result) => HttpServerResponse.json(result))
      );
    } else if (bodyObj._tag === "CreateUser") {
      return Schema.decodeUnknown(CreateUser)(body).pipe(
        Effect.flatMap((parsed) => Effect.request(parsed, CreateUserResolver)),
        Effect.map((result) => HttpServerResponse.json(result))
      );
    } else if (bodyObj._tag === "ListUsers") {
      return Schema.decodeUnknown(ListUsers)(body).pipe(
        Effect.flatMap((parsed) => Effect.request(parsed, ListUsersResolver)),
        Effect.map((result) => HttpServerResponse.json(result))
      );
    }

    return Effect.succeed(
      HttpServerResponse.json(
        { error: "Unknown request type" },
        { status: 400 }
      )
    );
  }),
  Effect.flatten
);

// Create HTTP Router with RPC endpoint
const httpRouter = HttpRouter.empty.pipe(
  HttpRouter.post("/rpc", handleRpc),
  HttpRouter.get(
    "/",
    Effect.succeed(HttpServerResponse.text("Backend server running!"))
  )
);

// Create and run the server
const ServerLive = BunHttpServer.layer({ port: 8000 });

const app = httpRouter.pipe(
  HttpServer.serve(),
  Layer.provide(ServerLive),
  Layer.launch
);

Effect.runFork(app);

console.log("🚀 Backend server running on http://localhost:8000");
console.log("📡 RPC endpoint available at http://localhost:8000/rpc");
