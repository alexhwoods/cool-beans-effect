"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navigation, NavigationLink } from "@/components/ui/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Effect, Layer } from "effect";
import {
  Coffee,
  CreateCoffeeRequest,
  UpdateCoffeeRequest,
  DeleteCoffeeRequest,
  CoffeeNotFound,
  CoffeeAlreadyExists,
} from "@cool-beans/shared";
import { makeRpcClient, ProtocolLive } from "@/rpc-client";

export default function CoffeesPage() {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<Coffee | null>(null);
  const [newCoffee, setNewCoffee] = useState<Partial<Coffee>>({
    name: "",
    origin: "",
    roast: "Medium",
    price: 0,
    weight: "12oz",
    description: "",
    inStock: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load coffees on component mount
  useEffect(() => {
    loadCoffees();
  }, []);

  const loadCoffees = async () => {
    setLoading(true);
    setError(null);

    const program = Effect.gen(function* () {
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
      const result = await Effect.runPromise(program);
      setCoffees([...result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load coffees");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (newCoffee.name && newCoffee.origin && newCoffee.price) {
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
        Effect.catchAll((err) =>
          Effect.sync(() => {
            // Check if the error message contains CoffeeAlreadyExists information
            const errorStr = String(err);
            if (errorStr.includes("CoffeeAlreadyExists")) {
              // Try to extract the coffee name from the error message
              const nameMatch = errorStr.match(/name[":\s]*"([^"]+)"/);
              const suggestionMatch = errorStr.match(
                /suggestion[":\s]*"([^"]+)"/
              );
              const name = nameMatch ? nameMatch[1] : "this name";
              const suggestion = suggestionMatch
                ? ` Try "${suggestionMatch[1]}" instead.`
                : "";
              setError(`A coffee named "${name}" already exists.${suggestion}`);
            } else {
              setError(errorStr);
            }
            return null;
          })
        )
      );

      try {
        const createdCoffee = await Effect.runPromise(program);
        if (createdCoffee) {
          setCoffees([...coffees, createdCoffee]);
          setNewCoffee({
            name: "",
            origin: "",
            roast: "Medium",
            price: 0,
            weight: "12oz",
            description: "",
            inStock: true,
          });
          setIsCreateOpen(false);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create coffee"
        );
      }
    }
  };

  const handleEdit = (coffee: Coffee) => {
    setEditingCoffee(coffee);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (editingCoffee) {
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
            setError(String(err));
            return null;
          })
        )
      );

      try {
        const updatedCoffee = await Effect.runPromise(program);
        if (updatedCoffee) {
          setCoffees(
            coffees.map((c) => (c.id === editingCoffee.id ? updatedCoffee : c))
          );
          setIsEditOpen(false);
          setEditingCoffee(null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update coffee"
        );
      }
    }
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

  const generateRandomCoffee = async () => {
    const coffeeNames = [
      "Ethiopian Yirgacheffe",
      "Colombian Supremo",
      "Guatemala Antigua",
      "Jamaican Blue Mountain",
      "Hawaiian Kona",
      "Sumatra Mandheling",
      "Kenya AA",
      "Costa Rica Tarrazu",
      "Peru Organic",
      "Brazil Santos",
      "Tanzania Peaberry",
      "Nicaragua Maragogype",
      "Panama Geisha",
      "Rwanda Bourbon",
      "Mexico Chiapas",
      "El Salvador Pacamara",
      "Honduras Copan",
      "Bolivia Caranavi",
      "Ecuador Galapagos",
      "Dominican Republic Barahona",
    ];

    const origins = [
      "Ethiopia",
      "Colombia",
      "Guatemala",
      "Jamaica",
      "Hawaii",
      "Indonesia",
      "Kenya",
      "Costa Rica",
      "Peru",
      "Brazil",
      "Tanzania",
      "Nicaragua",
      "Panama",
      "Rwanda",
      "Mexico",
      "El Salvador",
      "Honduras",
      "Bolivia",
      "Ecuador",
      "Dominican Republic",
    ];

    const roastLevels = ["Light", "Medium", "Medium-Dark", "Dark"];
    const weights = ["8oz", "10oz", "12oz", "16oz"];

    const descriptions = [
      "Bright and floral with notes of jasmine and citrus",
      "Rich and balanced with chocolate and nutty undertones",
      "Full-bodied with smoky notes and a spicy finish",
      "Smooth and mild with a clean, bright finish",
      "Rich and smooth with a hint of sweetness",
      "Earthy and full-bodied with low acidity",
      "Wine-like acidity with berry and wine notes",
      "Clean and bright with citrus and floral notes",
      "Chocolatey with caramel and nutty flavors",
      "Fruity and complex with tropical fruit notes",
      "Spicy with cinnamon and clove undertones",
      "Sweet and syrupy with molasses notes",
      "Elegant and refined with tea-like qualities",
      "Bold and intense with dark chocolate notes",
      "Delicate and nuanced with herbal notes",
    ];

    const randomName =
      coffeeNames[Math.floor(Math.random() * coffeeNames.length)];
    const randomOrigin = origins[Math.floor(Math.random() * origins.length)];
    const randomRoast =
      roastLevels[Math.floor(Math.random() * roastLevels.length)];
    const randomWeight = weights[Math.floor(Math.random() * weights.length)];
    const randomDescription =
      descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomPrice = Math.round((Math.random() * 80 + 15) * 100) / 100; // $15-$95
    const randomInStock = Math.random() > 0.2; // 80% chance of being in stock

    const request: CreateCoffeeRequest = {
      name: randomName,
      origin: randomOrigin,
      roast: randomRoast,
      price: randomPrice,
      weight: randomWeight,
      description: randomDescription,
      inStock: randomInStock,
    };

    const program = Effect.gen(function* () {
      const client = yield* makeRpcClient();
      return yield* client.createCoffee(request);
    }).pipe(
      Effect.scoped,
      Effect.provide(ProtocolLive),
      Effect.catchAll((err) =>
        Effect.sync(() => {
          // Check if the error message contains CoffeeAlreadyExists information
          const errorStr = String(err);
          if (errorStr.includes("CoffeeAlreadyExists")) {
            // Try to extract the coffee name from the error message
            const nameMatch = errorStr.match(/name[":\s]*"([^"]+)"/);
            const suggestionMatch = errorStr.match(
              /suggestion[":\s]*"([^"]+)"/
            );
            const name = nameMatch ? nameMatch[1] : "this name";
            const suggestion = suggestionMatch
              ? ` Try "${suggestionMatch[1]}" instead.`
              : "";
            setError(`A coffee named "${name}" already exists.${suggestion}`);
          } else {
            setError(errorStr);
          }
          return null;
        })
      )
    );

    try {
      const createdCoffee = await Effect.runPromise(program);
      if (createdCoffee) {
        setCoffees([...coffees, createdCoffee]);
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

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-2">
              Coffee Inventory
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
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  + Add Coffee
                </Button>
              </DialogTrigger>
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
                  <Button type="submit" onClick={handleCreate}>
                    Add Coffee
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                  <TableCell className="font-medium">{coffee.name}</TableCell>
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

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Coffee</DialogTitle>
              <DialogDescription>
                Update the coffee information below.
              </DialogDescription>
            </DialogHeader>
            {editingCoffee && (
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
            )}
            <DialogFooter>
              <Button type="submit" onClick={handleUpdate}>
                Update Coffee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              © 2024 Cool Beans. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
