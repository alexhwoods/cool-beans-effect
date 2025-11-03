import { Config, Layer } from "effect";
import { Model } from "@effect/ai";
import { OpenAiClient } from "@effect/ai-openai";
import { FetchHttpClient } from "@effect/platform";

/**
 * OpenAI client layer configured from environment variables.
 * Uses OPENAI_API_KEY from config.
 *
 * This can be replaced with a mock layer in tests.
 */
export const OpenAiClientLive = OpenAiClient.layerConfig({
  apiKey: Config.redacted("OPENAI_API_KEY"),
}).pipe(Layer.provide(FetchHttpClient.layer));
