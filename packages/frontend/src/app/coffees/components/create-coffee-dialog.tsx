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
  DialogTrigger,
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
  CreateCoffeeRequest,
  CoffeeAlreadyExists,
} from "@cool-beans/shared";
import { makeRpcClient, ProtocolLive } from "@/rpc-client";

interface CreateCoffeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCoffeeCreated: (coffee: Coffee) => void;
  onDuplicateError: (error: {
    attemptedName: string;
    suggestion: string;
    coffeeData: CreateCoffeeRequest;
  }) => void;
}

export function CreateCoffeeDialog({
  isOpen,
  onOpenChange,
  onCoffeeCreated,
  onDuplicateError,
}: CreateCoffeeDialogProps) {
  const [newCoffee, setNewCoffee] = useState<Partial<Coffee>>({
    name: "",
    origin: "",
    roast: "Medium",
    price: 0,
    weight: "12oz",
    description: "",
    inStock: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (newCoffee.name && newCoffee.origin && newCoffee.price) {
      setIsSubmitting(true);

      const request: CreateCoffeeRequest = {
        name: newCoffee.name,
        origin: newCoffee.origin,
        roast: newCoffee.roast || "Medium",
        price: newCoffee.price,
        weight: newCoffee.weight || "12oz",
        description: newCoffee.description || "",
        inStock: newCoffee.inStock ?? true,
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
              onDuplicateError({
                attemptedName: err.name,
                suggestion: err.suggestion,
                coffeeData: request,
              });
              return null;
            });
          },
        })
      );

      try {
        const createdCoffee = await Effect.runPromise(program);
        if (createdCoffee) {
          onCoffeeCreated(createdCoffee);
          setNewCoffee({
            name: "",
            origin: "",
            roast: "Medium",
            price: 0,
            weight: "12oz",
            description: "",
            inStock: true,
          });
          onOpenChange(false);
        }
      } catch (err) {
        console.error("Error creating coffee:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Coffee</DialogTitle>
          <DialogDescription>
            Create a new coffee entry with minimal required information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name *
            </Label>
            <Input
              id="name"
              value={newCoffee.name}
              onChange={(e) =>
                setNewCoffee({ ...newCoffee, name: e.target.value })
              }
              className="col-span-3"
              placeholder="Coffee name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="origin" className="text-right">
              Origin *
            </Label>
            <Input
              id="origin"
              value={newCoffee.origin}
              onChange={(e) =>
                setNewCoffee({ ...newCoffee, origin: e.target.value })
              }
              className="col-span-3"
              placeholder="Country/Region"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price *
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={newCoffee.price}
              onChange={(e) =>
                setNewCoffee({
                  ...newCoffee,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              className="col-span-3"
              placeholder="0.00"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="roast" className="text-right">
              Roast
            </Label>
            <Select
              value={newCoffee.roast}
              onValueChange={(value) =>
                setNewCoffee({ ...newCoffee, roast: value })
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
            <Label htmlFor="weight" className="text-right">
              Weight
            </Label>
            <Select
              value={newCoffee.weight}
              onValueChange={(value) =>
                setNewCoffee({ ...newCoffee, weight: value })
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
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={newCoffee.description}
              onChange={(e) =>
                setNewCoffee({
                  ...newCoffee,
                  description: e.target.value,
                })
              }
              className="col-span-3"
              placeholder="Flavor notes (optional)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inStock" className="text-right">
              In Stock
            </Label>
            <Select
              value={newCoffee.inStock?.toString()}
              onValueChange={(value) =>
                setNewCoffee({
                  ...newCoffee,
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
          <Button type="submit" onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Coffee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
