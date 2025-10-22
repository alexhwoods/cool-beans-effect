"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Effect } from "effect";
import {
  Coffee,
  UpdateCoffeeRequest,
  CoffeeNotFound,
} from "@cool-beans/shared";
import { makeRpcClient, ProtocolLive } from "@/rpc-client";

interface EditCoffeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  coffee: Coffee | null;
  onCoffeeUpdated: (coffee: Coffee) => void;
  onError: (error: string) => void;
}

export function EditCoffeeDialog({
  isOpen,
  onOpenChange,
  coffee,
  onCoffeeUpdated,
  onError,
}: EditCoffeeDialogProps) {
  const [editingCoffee, setEditingCoffee] = useState<Coffee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update editing coffee when coffee prop changes
  useEffect(() => {
    if (coffee) {
      setEditingCoffee(coffee);
    }
  }, [coffee]);

  const handleUpdate = async () => {
    if (editingCoffee) {
      setIsSubmitting(true);

      const request: UpdateCoffeeRequest = {
        id: editingCoffee.id,
        name: editingCoffee.name,
        origin: editingCoffee.origin,
        roast: editingCoffee.roast,
        price: editingCoffee.price,
        weight: editingCoffee.weight,
        description: editingCoffee.description,
        inStock: editingCoffee.inStock,
      };

      const program = Effect.gen(function* () {
        const client = yield* makeRpcClient();
        return yield* client.updateCoffee(request);
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
        const updatedCoffee = await Effect.runPromise(program);
        if (updatedCoffee) {
          onCoffeeUpdated(updatedCoffee);
          onOpenChange(false);
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : "Failed to update coffee");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!editingCoffee) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Coffee</DialogTitle>
          <DialogDescription>
            Update the coffee information below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Name *
            </Label>
            <Input
              id="edit-name"
              value={editingCoffee.name}
              onChange={(e) =>
                setEditingCoffee({
                  ...editingCoffee,
                  name: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-origin" className="text-right">
              Origin *
            </Label>
            <Input
              id="edit-origin"
              value={editingCoffee.origin}
              onChange={(e) =>
                setEditingCoffee({
                  ...editingCoffee,
                  origin: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-price" className="text-right">
              Price *
            </Label>
            <Input
              id="edit-price"
              type="number"
              step="0.01"
              value={editingCoffee.price}
              onChange={(e) =>
                setEditingCoffee({
                  ...editingCoffee,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-roast" className="text-right">
              Roast
            </Label>
            <Select
              value={editingCoffee.roast}
              onValueChange={(value) =>
                setEditingCoffee({ ...editingCoffee, roast: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Light">Light</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Medium-Dark">Medium-Dark</SelectItem>
                <SelectItem value="Dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-weight" className="text-right">
              Weight
            </Label>
            <Select
              value={editingCoffee.weight}
              onValueChange={(value) =>
                setEditingCoffee({ ...editingCoffee, weight: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8oz">8oz</SelectItem>
                <SelectItem value="10oz">10oz</SelectItem>
                <SelectItem value="12oz">12oz</SelectItem>
                <SelectItem value="16oz">16oz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              Description
            </Label>
            <Input
              id="edit-description"
              value={editingCoffee.description}
              onChange={(e) =>
                setEditingCoffee({
                  ...editingCoffee,
                  description: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-inStock" className="text-right">
              In Stock
            </Label>
            <Select
              value={editingCoffee.inStock.toString()}
              onValueChange={(value) =>
                setEditingCoffee({
                  ...editingCoffee,
                  inStock: value === "true",
                })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Coffee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
