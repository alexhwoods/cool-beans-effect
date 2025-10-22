"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Effect } from "effect";
import { Coffee, CreateCoffeeRequest } from "@cool-beans/shared";
import { makeRpcClient, ProtocolLive } from "@/rpc-client";

interface DuplicateCoffeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  duplicateError: {
    attemptedName: string;
    suggestion: string;
    coffeeData: CreateCoffeeRequest;
  } | null;
  onCoffeeCreated: (coffee: Coffee) => void;
  onError: (error: string) => void;
}

export function DuplicateCoffeeDialog({
  isOpen,
  onOpenChange,
  duplicateError,
  onCoffeeCreated,
  onError,
}: DuplicateCoffeeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAcceptSuggestion = async () => {
    if (!duplicateError) return;

    setIsSubmitting(true);

    const request = {
      ...duplicateError.coffeeData,
      name: duplicateError.suggestion,
    };

    const program = Effect.gen(function* () {
      const client = yield* makeRpcClient();
      return yield* client.createCoffee(request);
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.catchAll((err) =>
        Effect.sync(() => {
          onError(String(err));
          return null;
        })
      )
    );

    try {
      const createdCoffee = await Effect.runPromise(program);
      if (createdCoffee) {
        onCoffeeCreated(createdCoffee);
        onOpenChange(false);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to create coffee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSuggestion = () => {
    onOpenChange(false);
  };

  if (!duplicateError) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>☕ Coffee Name Already Exists</DialogTitle>
          <DialogDescription>
            A coffee with this name already exists. We've suggested an
            alternative name for you.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-800 mb-2">
                Attempted Name:
              </div>
              <div className="text-lg font-mono text-red-900 bg-red-100 p-2 rounded">
                {duplicateError.attemptedName}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-2xl text-gray-400">↓</div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-medium text-green-800 mb-2">
                Suggested Name:
              </div>
              <div className="text-lg font-mono text-green-900 bg-green-100 p-2 rounded">
                {duplicateError.suggestion}
              </div>
            </div>

            <div className="text-sm text-gray-600 text-center">
              Would you like to create the coffee with the suggested name?
            </div>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRejectSuggestion}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleAcceptSuggestion} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Use Suggested Name"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
