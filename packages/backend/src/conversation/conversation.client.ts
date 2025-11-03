import { Config, Layer } from "effect";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai";
import { FetchHttpClient } from "@effect/platform";

/**
 * OpenAI client layer configured from environment variables.
 * Reads OPENAI_API_KEY directly from the environment.
 *
 * This can be replaced with a mock layer in tests.
 */
export const OpenAiClientLive = OpenAiClient.layerConfig({
  apiKey: Config.redacted("OPENAI_API_KEY"),
}).pipe(Layer.provide(FetchHttpClient.layer));

export const Gpt4o = OpenAiLanguageModel.model("gpt-4o");
