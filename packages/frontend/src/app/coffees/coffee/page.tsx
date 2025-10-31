"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navigation, NavigationLink } from "@/components/ui/navigation";
import { Effect, Layer, Stream } from "effect";
import {
  CreateConversationResponse,
  SendUserMessageRequest,
} from "@cool-beans/shared";
import { makeRpcClient, ProtocolLive } from "@/rpc-client";

type Message = {
  sender: "user" | "ai";
  message: string;
};

const toMessage = (c: any): Message => ({
  sender: c.sender,
  message: c.message,
});

function AssistantLiveBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed bg-card text-foreground border rounded-bl-sm">
        {text}
      </div>
    </div>
  );
}

export default function CoffeeAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // Track the index of the AI message currently being streamed so we can update the same bubble
  const aiStreamIndexRef = useRef<number | null>(null);

  // Create conversation on mount
  useEffect(() => {
    createConversation();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  const createConversation = async () => {
    setLoading(true);
    setError(null);

    const program = Effect.gen(function* () {
      const client = yield* makeRpcClient();
      return yield* client.createConversation();
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.catchAll((err) =>
        Effect.sync(() => {
          setError(String(err));
          return null;
        })
      )
    );

    try {
      const result = await Effect.runPromise(program);
      if (result) {
        setConversationId(result.id);
        // Add initial AI message
        setMessages([
          {
            sender: "ai",
            message:
              "Hi! I'm your Coffee Assistant. Tell me about the coffee you want to create — name, origin, roast, price, weight, and a short description.",
          },
        ]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create conversation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !conversationId || loading) return;

    setLoading(true);
    setError(null);
    // New message cycle: reset AI streaming index and clear live bubble; append user message now
    aiStreamIndexRef.current = null;
    setAiResponse(null);
    setMessages((prev) => [...prev, { sender: "user", message: trimmed }]);

    const request: SendUserMessageRequest = {
      conversationId,
      message: trimmed,
    };

    const program = Effect.gen(function* () {
      const client = yield* makeRpcClient();
      // Stream messages and update the live assistant bubble progressively
      yield* Stream.runForEach(client.sendUserMessage(request), (m) =>
        Effect.sync(() => {
          setAiResponse((prev) =>
            prev ? `${prev} ${String(m.response)}` : String(m.response)
          );
        })
      );
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.catchAll((err) =>
        Effect.sync(() => {
          setError(String(err));
        })
      )
    );

    try {
      await Effect.runPromise(program);
      // Commit the live bubble into the durable history and clear it (dedupe-safe)
      setAiResponse((current) => {
        const text = (current ?? "").trim();
        if (text) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.sender === "ai" && last.message === text) {
              return prev;
            }
            return [...prev, { sender: "ai", message: text }];
          });
        }
        return null;
      });
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setAiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-6 px-6 bg-gradient-to-r from-card via-background to-card border-b-2 border-primary/20 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-lg">
                ☕
              </span>
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Cool Beans
            </h1>
          </div>
          <Navigation className="hidden md:flex">
            <NavigationLink
              href="/coffees"
              className="px-4 py-2 rounded-lg hover:bg-primary/10 transition-all duration-300 font-medium"
            >
              Coffees
            </NavigationLink>
            <NavigationLink
              href="#about"
              className="px-4 py-2 rounded-lg hover:bg-primary/10 transition-all duration-300 font-medium"
            >
              About
            </NavigationLink>
            <NavigationLink
              href="#location"
              className="px-4 py-2 rounded-lg hover:bg-primary/10 transition-all duration-300 font-medium"
            >
              Pricing
            </NavigationLink>
          </Navigation>
          <Button className="md:hidden" size="sm" variant="outline">
            ☰
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8 px-6 max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
            Error: {error}
            <Button
              onClick={() => setError(null)}
              className="ml-4"
              size="sm"
              variant="outline"
            >
              Dismiss
            </Button>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Coffee Assistant
          </h2>
          <p className="text-muted-foreground">
            Chat with AI to draft a new coffee
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat */}
          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader className="border-b bg-card/50">
              <CardTitle>Create a new coffee</CardTitle>
              <CardDescription>
                Describe what you have in mind. I’ll help you fill in details
                and avoid duplicates.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div
                ref={scrollRef}
                className="h-[520px] overflow-y-auto px-6 py-6 space-y-4 bg-background chat-scroll"
              >
                {loading && !conversationId && (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-muted-foreground">
                      Creating conversation...
                    </div>
                  </div>
                )}
                {messages.map((m, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      m.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
                        m.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card text-foreground border rounded-bl-sm"
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                ))}
                {aiResponse && <AssistantLiveBubble text={aiResponse} />}

                {/* Suggestion chips */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {[
                    "Suggest coffee names",
                    "Pick an origin",
                    "Choose a roast",
                    "Set a price",
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="text-xs px-3 py-1 rounded-full border hover:bg-primary/10 transition-colors text-foreground"
                      onClick={() =>
                        setInput((prev) => (prev ? prev + " " + s : s))
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Composer */}
              <div className="border-t p-4 bg-card/50">
                <div className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your coffee idea..."
                    disabled={loading || !conversationId}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={loading || !conversationId || !input.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {loading ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle>Tips for great coffees</CardTitle>
              <CardDescription>
                What the assistant can help with
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="p-3 rounded-lg bg-card border">
                Name brainstorming with brand tone
              </div>
              <div className="p-3 rounded-lg bg-card border">
                Suggesting origin and roast pairings
              </div>
              <div className="p-3 rounded-lg bg-card border">
                Price guidance based on similar items
              </div>
              <div className="p-3 rounded-lg bg-card border">
                Duplicate name detection and alternatives
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold">☕</span>
              </div>
              <span className="text-2xl font-bold text-foreground">
                Cool Beans
              </span>
            </div>
            <div className="text-muted-foreground text-sm">
              © 2025 Cool Beans. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
