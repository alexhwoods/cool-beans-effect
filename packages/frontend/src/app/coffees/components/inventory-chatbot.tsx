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
import { DuplicateCoffeeDialog } from "./duplicate-coffee-dialog";
import { Effect, Stream } from "effect";
import {
  CreateConversationResponse,
  SendUserMessageRequest,
  CoffeeSuggestion,
  Coffee,
  CreateCoffeeRequest,
  CoffeeAlreadyExists,
} from "@cool-beans/shared";
import { makeRpcClient, ProtocolLive } from "@/rpc-client";

type MessageStatus = "streaming" | "final" | "error";

type Message = {
  id: string;
  sender: "user" | "ai";
  message: string;
  status: MessageStatus;
};

interface MessageBubbleProps {
  sender: "user" | "ai";
  text: string;
  isStreaming?: boolean;
}

function MessageBubble({
  sender,
  text,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = sender === "user";
  const isEmpty = text.trim() === "";
  const showTypingIndicator = isEmpty && isStreaming && !isUser;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm text-xs leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card text-foreground border rounded-bl-sm"
        } ${isStreaming ? "opacity-90" : ""}`}
      >
        {showTypingIndicator ? (
          <div className="flex items-center gap-1 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-pulse"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:0.4s]"></span>
          </div>
        ) : (
          text
        )}
      </div>
    </div>
  );
}

interface CoffeeSuggestionCardProps {
  suggestion: CoffeeSuggestion;
  onAccept: (suggestion: CoffeeSuggestion) => void;
  onDismiss: () => void;
}

function CoffeeSuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}: CoffeeSuggestionCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await onAccept(suggestion);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-green-800">
          ☕ Coffee Suggestion
        </div>
        <Button
          onClick={onDismiss}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-green-800 hover:text-green-900"
        >
          ✕
        </Button>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium text-green-900">Name:</span>
          <div className="mt-1 text-green-900 bg-green-100 p-2 rounded font-mono">
            {suggestion.name}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium text-green-900">Origin:</span>
            <div className="mt-1 text-green-900 bg-green-100 p-2 rounded">
              {suggestion.origin}
            </div>
          </div>
          <div>
            <span className="font-medium text-green-900">Roast:</span>
            <div className="mt-1 text-green-900 bg-green-100 p-2 rounded">
              {suggestion.roast}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium text-green-900">Price:</span>
            <div className="mt-1 text-green-900 bg-green-100 p-2 rounded">
              ${suggestion.price.toFixed(2)}
            </div>
          </div>
          <div>
            <span className="font-medium text-green-900">Weight:</span>
            <div className="mt-1 text-green-900 bg-green-100 p-2 rounded">
              {suggestion.weight}
            </div>
          </div>
        </div>

        <div>
          <span className="font-medium text-green-900">Description:</span>
          <div className="mt-1 text-green-900 bg-green-100 p-2 rounded">
            {suggestion.description}
          </div>
        </div>

        <div>
          <span className="font-medium text-green-900">Status:</span>
          <div className="mt-1">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                suggestion.inStock
                  ? "bg-green-200 text-green-900"
                  : "bg-red-200 text-red-900"
              }`}
            >
              {suggestion.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDismiss}
          disabled={isSubmitting}
          className="flex-1 text-xs"
        >
          Dismiss
        </Button>
        <Button
          onClick={handleAccept}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
        >
          {isSubmitting ? "Creating..." : "Create Coffee"}
        </Button>
      </div>
    </div>
  );
}

interface InventoryChatbotProps {
  className?: string;
  isExpanded: boolean;
  onToggle: (expanded: boolean) => void;
  onCoffeeCreated?: (coffee: Coffee) => void;
  onDuplicateError?: (error: {
    attemptedName: string;
    suggestion: string;
    coffeeData: CreateCoffeeRequest;
  }) => void;
}

export function InventoryChatbot({
  className,
  isExpanded,
  onToggle,
  onCoffeeCreated,
  onDuplicateError,
}: InventoryChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestSuggestion, setLatestSuggestion] =
    useState<CoffeeSuggestion | null>(null);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [duplicateError, setDuplicateError] = useState<{
    attemptedName: string;
    suggestion: string;
    coffeeData: CreateCoffeeRequest;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (isExpanded && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

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
            id: crypto.randomUUID(),
            sender: "ai",
            message:
              "Hi! I'm your Inventory Assistant. I can help you manage your coffee inventory - create new coffees, suggest names, check for duplicates, and answer questions about your collection.",
            status: "final",
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
    setLatestSuggestion(null); // Clear any previous suggestion when starting new message
    // Append user message
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: "user",
        message: trimmed,
        status: "final",
      },
      // Seed streaming AI message (empty text that will be progressively filled)
      {
        id: crypto.randomUUID(),
        sender: "ai",
        message: "",
        status: "streaming",
      },
    ]);

    const request: SendUserMessageRequest = {
      conversationId,
      message: trimmed,
    };

    const program = Effect.gen(function* () {
      const client = yield* makeRpcClient();
      // Stream messages and update the live assistant bubble progressively
      yield* Stream.runForEach(client.sendUserMessage(request), (m) =>
        Effect.sync(() => {
          // Check if the response is a CoffeeSuggestion or a string
          // CoffeeSuggestion will be an object with coffee properties
          const response = m.response;
          if (
            typeof response === "object" &&
            response !== null &&
            "name" in response &&
            typeof response.name === "string" &&
            "origin" in response &&
            typeof response.origin === "string" &&
            "roast" in response &&
            typeof response.roast === "string" &&
            "price" in response &&
            typeof response.price === "number"
          ) {
            // It's a CoffeeSuggestion
            setLatestSuggestion(response as CoffeeSuggestion);
          } else {
            // It's a string - append to message text
            const chunk = String(response);
            setMessages((prev) => {
              if (prev.length === 0) return prev;
              const next = [...prev];
              const lastIndex = next.length - 1;
              const last = next[lastIndex];
              if (last.sender === "ai" && last.status === "streaming") {
                next[lastIndex] = {
                  ...last,
                  message: last.message ? `${last.message} ${chunk}` : chunk,
                };
              }
              return next;
            });
          }
          scrollToBottom();
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
      // Flip last AI message from streaming to final, or remove it if empty
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const lastIndex = next.length - 1;
        const last = next[lastIndex];
        if (last.sender === "ai" && last.status === "streaming") {
          // If message is empty (only had CoffeeSuggestions), remove it
          if (last.message.trim() === "") {
            return next.slice(0, -1);
          }
          // Otherwise mark it as final
          next[lastIndex] = { ...last, status: "final" };
        }
        return next;
      });
      setInput("");
      // Clear suggestion after message is finalized (or keep it if you want it to persist)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      // Mark last AI message as error if present
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const lastIndex = next.length - 1;
        const last = next[lastIndex];
        if (last.sender === "ai" && last.status === "streaming") {
          next[lastIndex] = { ...last, status: "error" };
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button - Always visible when collapsed */}
      {!isExpanded && (
        <>
          <div
            onClick={() => onToggle(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-50 w-6 h-24 rounded-l-md bg-primary/80 hover:bg-primary shadow-md cursor-pointer flex items-center justify-center group"
            title="Open Inventory Assistant"
          >
            <div className="w-1 h-12 bg-primary-foreground/30 group-hover:bg-primary-foreground/50 rounded-full flex flex-col gap-1">
              <div className="w-full h-1 bg-primary-foreground/30 group-hover:bg-primary-foreground/50 rounded-full"></div>
              <div className="w-full h-1 bg-primary-foreground/30 group-hover:bg-primary-foreground/50 rounded-full"></div>
              <div className="w-full h-1 bg-primary-foreground/30 group-hover:bg-primary-foreground/50 rounded-full"></div>
            </div>
          </div>
        </>
      )}

      {/* Sidebar Container - Fixed to viewport, aligned with header bottom */}
      <div
        className={`${
          isExpanded ? "w-96" : "w-0"
        } fixed right-0 top-[88px] h-[calc(100vh-88px)] transition-all duration-300 ease-in-out overflow-hidden flex flex-col z-40 ${
          className || ""
        }`}
      >
        {/* Sidebar Content */}
        {isExpanded && (
          <div className="bg-card border-l border-border shadow-2xl flex flex-col h-full w-96">
            <Card className="rounded-none border-0 h-full flex flex-col pt-8">
              <CardHeader className="border-b bg-card/50 flex-shrink-0 pt-0 pb-4 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Inventory Assistant
                    </CardTitle>
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
                  {messages
                    .filter(
                      (m) => m.message.trim() !== "" || m.status === "streaming"
                    )
                    .map((m) => (
                      <MessageBubble
                        key={m.id}
                        sender={m.sender}
                        text={m.message}
                        isStreaming={m.status === "streaming"}
                      />
                    ))}

                  {/* Latest Coffee Suggestion */}
                  {latestSuggestion && (
                    <CoffeeSuggestionCard
                      suggestion={latestSuggestion}
                      onAccept={async (suggestion) => {
                        const request: CreateCoffeeRequest = {
                          name: suggestion.name,
                          origin: suggestion.origin,
                          roast: suggestion.roast,
                          price: suggestion.price,
                          weight: suggestion.weight,
                          description: suggestion.description,
                          inStock: suggestion.inStock,
                        };

                        const program = Effect.gen(function* () {
                          const client = yield* makeRpcClient();
                          return yield* client.createCoffee(request);
                        }).pipe(
                          Effect.scoped,
                          Effect.provide(ProtocolLive),
                          Effect.catchTags({
                            CoffeeAlreadyExists: (err) => {
                              return Effect.sync(() => {
                                // Show duplicate dialog instead of error banner
                                if (onDuplicateError) {
                                  onDuplicateError({
                                    attemptedName: err.name,
                                    suggestion:
                                      err.suggestion || `${request.name} 2`,
                                    coffeeData: request,
                                  });
                                } else {
                                  // Fallback: use internal dialog
                                  setDuplicateError({
                                    attemptedName: err.name,
                                    suggestion:
                                      err.suggestion || `${request.name} 2`,
                                    coffeeData: request,
                                  });
                                  setIsDuplicateDialogOpen(true);
                                }
                                return null;
                              });
                            },
                          }),
                          Effect.catchAll((err) =>
                            Effect.sync(() => {
                              setError(String(err));
                              return null;
                            })
                          )
                        );

                        try {
                          const createdCoffee = await Effect.runPromise(
                            program
                          );
                          if (createdCoffee) {
                            onCoffeeCreated?.(createdCoffee);
                            setLatestSuggestion(null);
                          }
                        } catch (err) {
                          setError(
                            err instanceof Error
                              ? err.message
                              : "Failed to create coffee"
                          );
                        }
                      }}
                      onDismiss={() => setLatestSuggestion(null)}
                    />
                  )}

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

      {/* Duplicate Coffee Dialog - for handling duplicates from suggestions */}
      <DuplicateCoffeeDialog
        isOpen={isDuplicateDialogOpen}
        onOpenChange={(open) => {
          setIsDuplicateDialogOpen(open);
          if (!open) {
            setDuplicateError(null);
          }
        }}
        duplicateError={duplicateError}
        onCoffeeCreated={(coffee) => {
          onCoffeeCreated?.(coffee);
          setLatestSuggestion(null);
          setIsDuplicateDialogOpen(false);
          setDuplicateError(null);
        }}
        onError={setError}
      />
    </>
  );
}
