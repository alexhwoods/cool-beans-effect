"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
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

    const result = await Effect.runPromise(loadCoffeesEffect);
    setCoffees([...result]);
    setLoading(false);
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

    const deleteCoffeeEffect = Effect.gen(function* () {
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

    const success = await Effect.runPromise(deleteCoffeeEffect);
    if (success !== false) {
      setCoffees(coffees.filter((c) => c.id !== id));
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
      }),
      Effect.catchAll((err) =>
        Effect.sync(() => {
          setError(String(err));
          return null;
        })
      )
    );

    const createdCoffee = await Effect.runPromise(createCoffeeEffect);
    if (createdCoffee) {
      handleCoffeeCreated(createdCoffee);
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
      <Header />

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

              <Footer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
