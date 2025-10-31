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
import { Effect, Stream } from "effect";
import {
  CreateConversationResponse,
  SendUserMessageRequest,
} from "@cool-beans/shared";
import { makeRpcClient, ProtocolLive } from "@/rpc-client";

type Message = {
  sender: "user" | "ai";
  message: string;
};

function AssistantLiveBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed bg-card text-foreground border rounded-bl-sm">
        {text}
      </div>
    </div>
  );
}

interface InventoryChatbotProps {
  className?: string;
  isExpanded: boolean;
  onToggle: (expanded: boolean) => void;
}

export function InventoryChatbot({
  className,
  isExpanded,
  onToggle,
}: InventoryChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Create conversation on mount
  useEffect(() => {
    createConversation();
  }, []);

  useEffect(() => {
    if (isExpanded && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length, isExpanded]);

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
        // Add initial AI message focused on inventory management
        setMessages([
          {
            sender: "ai",
            message:
              "Hi! I'm your Inventory Assistant. I can help you manage your coffee inventory - create new coffees, suggest names, check for duplicates, and answer questions about your collection.",
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
    <>
      {/* Toggle Button - Always visible when collapsed */}
      {!isExpanded && (
        <div className="fixed right-0 top-20 z-50">
          <Button
            onClick={() => onToggle(true)}
            className="rounded-l-lg rounded-r-none shadow-lg bg-primary hover:bg-primary/90 h-12 px-4"
            size="lg"
            title="Open Inventory Assistant"
          >
            💬 Chat
          </Button>
        </div>
      )}

      {/* Sidebar Container - Fixed to viewport, aligned with header bottom */}
      <div
        className={`${
          isExpanded ? "w-96" : "w-0"
        } fixed right-0 top-[88px] h-[calc(100vh-88px)] transition-all duration-300 ease-in-out overflow-hidden flex flex-col z-40 ${className || ""}`}
      >

      {/* Sidebar Content */}
      {isExpanded && (
        <div className="bg-card border-l border-border shadow-2xl flex flex-col h-full w-96">
        <Card className="rounded-none border-0 h-full flex flex-col pt-8">
          <CardHeader className="border-b bg-card/50 flex-shrink-0 pt-0 pb-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Inventory Assistant</CardTitle>
                <CardDescription className="text-xs">
                  Manage your coffee inventory
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onToggle(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Collapse sidebar"
                >
                  ←
                </Button>
                <Button
                  onClick={() => onToggle(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Close"
                >
                  ✕
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background chat-scroll"
            >
              {loading && !conversationId && (
                <div className="flex justify-center items-center h-full">
                  <div className="text-muted-foreground text-sm">
                    Starting conversation...
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
                    className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm text-xs leading-relaxed ${
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

              {error && (
                <div className="p-2 bg-red-100 border border-red-300 rounded-lg text-red-800 text-xs">
                  {error}
                </div>
              )}

              {/* Suggestion chips */}
              {messages.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {[
                    "Show all coffees",
                    "Create a new coffee",
                    "Check inventory status",
                    "Suggest a name",
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="text-xs px-2 py-1 rounded-full border hover:bg-primary/10 transition-colors text-foreground"
                      onClick={() =>
                        setInput((prev) => (prev ? prev + " " + s : s))
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t p-3 bg-card/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your inventory..."
                  disabled={loading || !conversationId}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="text-sm"
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !conversationId || !input.trim()}
                  className="bg-primary hover:bg-primary/90 flex-shrink-0"
                  size="sm"
                >
                  {loading ? "..." : "→"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      )}
      </div>
    </>
  );
}
