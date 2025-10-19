import { HttpMiddleware } from "@effect/platform";

export const corsMiddleware = HttpMiddleware.cors({
  allowedOrigins: ["http://localhost:3000"],
});
