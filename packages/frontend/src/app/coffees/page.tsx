"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation, NavigationLink } from "@/components/ui/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateCoffeeDialog } from "./components/create-coffee-dialog";
import { EditCoffeeDialog } from "./components/edit-coffee-dialog";
import { DuplicateCoffeeDialog } from "./components/duplicate-coffee-dialog";
import { Effect } from "effect";
import {
  Coffee,
  CreateCoffeeRequest,
  DeleteCoffeeRequest,
} from "@cool-beans/shared";
import { makeRpcClient, ProtocolLive } from "@/rpc-client";
import { generateRandomCoffeeRequest } from "@/lib/coffee-utils";

export default function CoffeesPage() {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<Coffee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [duplicateCoffee, setDuplicateCoffee] = useState<{
    attemptedName: string;
    suggestion: string;
    coffeeData: CreateCoffeeRequest;
  } | null>(null);

  // Load coffees on component mount
  useEffect(() => {
    loadCoffees();
  }, []);

  const loadCoffees = async () => {
    setLoading(true);
    setError(null);

    const loadCoffeesEffect = Effect.gen(function* () {
      const client = yield* makeRpcClient();
      return yield* client.listCoffees();
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.catchAll((err) =>
        Effect.sync(() => {
          setError(String(err));
          return [];
        })
      )
    );

    try {
      const result = await Effect.runPromise(loadCoffeesEffect);
      setCoffees([...result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load coffees");
    } finally {
      setLoading(false);
    }
  };

  const handleCoffeeCreated = (coffee: Coffee) => {
    setCoffees([...coffees, coffee]);
  };

  const handleDuplicateCoffee = (error: {
    attemptedName: string;
    suggestion: string;
    coffeeData: CreateCoffeeRequest;
  }) => {
    setDuplicateCoffee(error);
    setIsDuplicateDialogOpen(true);
  };

  const handleEdit = (coffee: Coffee) => {
    setEditingCoffee(coffee);
    setIsEditOpen(true);
  };

  const handleCoffeeUpdated = (coffee: Coffee) => {
    setCoffees(coffees.map((c) => (c.id === coffee.id ? coffee : c)));
    setIsEditOpen(false);
    setEditingCoffee(null);
  };

  const handleDelete = async (id: number) => {
    const request: DeleteCoffeeRequest = { id };

    const program = Effect.gen(function* () {
      const client = yield* makeRpcClient();
      return yield* client.deleteCoffee(request);
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.catchAll((err) =>
        Effect.sync(() => {
          setError(String(err));
          return false;
        })
      )
    );

    try {
      const success = await Effect.runPromise(program);
      if (success !== false) {
        setCoffees(coffees.filter((c) => c.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete coffee");
    }
  };

  const handleDuplicateDialogClose = () => {
    setIsDuplicateDialogOpen(false);
    setDuplicateCoffee(null);
  };

  const generateRandomCoffee = async () => {
    const request = generateRandomCoffeeRequest();

    const createCoffeeEffect = Effect.gen(function* () {
      const client = yield* makeRpcClient();
      return yield* client.createCoffee(request);
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.catchTags({
        CoffeeAlreadyExists: (err) => {
          return Effect.sync(() => {
            // Prompt the user with the suggestion
            handleDuplicateCoffee({
              attemptedName: err.name,
              suggestion: err.suggestion || `${request.name} 2`,
              coffeeData: request,
            });
            return null;
          });
        },
      })
    );

    try {
      const createdCoffee = await Effect.runPromise(createCoffeeEffect);
      if (createdCoffee) {
        handleCoffeeCreated(createdCoffee);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create random coffee"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-2">
            Loading...
          </div>
          <div className="text-muted-foreground">Fetching coffee inventory</div>
        </div>
      </div>
    );
  }

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
      <div className="flex relative">
        {/* Main Content Area - Scrollable */}
        <div className="flex-1">
          <div className="min-h-[calc(100vh-88px)]">
            <div className="pt-8 pb-8 px-6 max-w-7xl mx-auto">
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

              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-foreground mb-2">
                    Inventory
                  </h2>
                  <p className="text-muted-foreground">
                    Manage your coffee collection with ease
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={generateRandomCoffee}
                    className="hover:bg-secondary/50"
                  >
                    🎲 Generate Random
                  </Button>
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    + Add Coffee
                  </Button>
                </div>
              </div>

              {/* Coffee Table */}
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead>Origin</TableHead>
                      <TableHead>Roast</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coffees.map((coffee) => (
                      <TableRow key={coffee.id}>
                        <TableCell className="font-medium">
                          {coffee.name}
                        </TableCell>
                        <TableCell>{coffee.origin}</TableCell>
                        <TableCell>{coffee.roast}</TableCell>
                        <TableCell className="text-right">
                          ${coffee.price.toFixed(2)}
                        </TableCell>
                        <TableCell>{coffee.weight}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              coffee.inStock
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {coffee.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(coffee)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(coffee.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              {/* Dialog Components */}
              <CreateCoffeeDialog
                isOpen={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onCoffeeCreated={handleCoffeeCreated}
                onDuplicateError={handleDuplicateCoffee}
              />

              <EditCoffeeDialog
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                coffee={editingCoffee}
                onCoffeeUpdated={handleCoffeeUpdated}
                onError={setError}
              />

              <DuplicateCoffeeDialog
                isOpen={isDuplicateDialogOpen}
                onOpenChange={handleDuplicateDialogClose}
                duplicateError={duplicateCoffee}
                onCoffeeCreated={handleCoffeeCreated}
                onError={setError}
              />

              {/* Footer - Inside main content area so it adjusts with sidebar */}
              <footer className="bg-card border-t border-border/50 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-bold">
                          ☕
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-foreground">
                        Cool Beans
                      </span>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      © 2024 Cool Beans. All rights reserved.
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
