"use client";

import { useState } from "react";
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

// Coffee type definition
interface Coffee {
  id: number;
  name: string;
  origin: string;
  roast: string;
  price: number;
  weight: string;
  description: string;
  inStock: boolean;
}

// Initial coffee data
const initialCoffees: Coffee[] = [
  {
    id: 1,
    name: "Ethiopian Yirgacheffe",
    origin: "Ethiopia",
    roast: "Light",
    price: 24.99,
    weight: "12oz",
    description: "Bright and floral with notes of jasmine and citrus",
    inStock: true,
  },
  {
    id: 2,
    name: "Colombian Supremo",
    origin: "Colombia",
    roast: "Medium",
    price: 22.99,
    weight: "12oz",
    description: "Rich and balanced with chocolate and nutty undertones",
    inStock: true,
  },
  {
    id: 3,
    name: "Guatemala Antigua",
    origin: "Guatemala",
    roast: "Medium-Dark",
    price: 26.99,
    weight: "12oz",
    description: "Full-bodied with smoky notes and a spicy finish",
    inStock: false,
  },
  {
    id: 4,
    name: "Jamaican Blue Mountain",
    origin: "Jamaica",
    roast: "Medium",
    price: 89.99,
    weight: "8oz",
    description: "Smooth and mild with a clean, bright finish",
    inStock: true,
  },
  {
    id: 5,
    name: "Hawaiian Kona",
    origin: "Hawaii",
    roast: "Medium",
    price: 45.99,
    weight: "10oz",
    description: "Rich and smooth with a hint of sweetness",
    inStock: true,
  },
  {
    id: 6,
    name: "Sumatra Mandheling",
    origin: "Indonesia",
    roast: "Dark",
    price: 28.99,
    weight: "12oz",
    description: "Earthy and full-bodied with low acidity",
    inStock: true,
  },
];

export default function CoffeesPage() {
  const [coffees, setCoffees] = useState<Coffee[]>(initialCoffees);
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

  const handleCreate = () => {
    if (newCoffee.name && newCoffee.origin && newCoffee.price) {
      const coffee: Coffee = {
        id: Math.max(...coffees.map((c) => c.id)) + 1,
        name: newCoffee.name,
        origin: newCoffee.origin,
        roast: newCoffee.roast || "Medium",
        price: newCoffee.price,
        weight: newCoffee.weight || "12oz",
        description: newCoffee.description || "",
        inStock: newCoffee.inStock || true,
      };
      setCoffees([...coffees, coffee]);
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
  };

  const handleEdit = (coffee: Coffee) => {
    setEditingCoffee(coffee);
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (editingCoffee) {
      setCoffees(
        coffees.map((c) => (c.id === editingCoffee.id ? editingCoffee : c))
      );
      setIsEditOpen(false);
      setEditingCoffee(null);
    }
  };

  const handleDelete = (id: number) => {
    setCoffees(coffees.filter((c) => c.id !== id));
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
              className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium"
            >
              Coffees
            </NavigationLink>
            <NavigationLink
              href="/#about"
              className="px-4 py-2 rounded-lg hover:bg-primary/10 transition-all duration-300 font-medium"
            >
              About
            </NavigationLink>
            <NavigationLink
              href="/#location"
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-2">
              Coffee Inventory
            </h2>
            <p className="text-muted-foreground">
              Manage your coffee collection with ease
            </p>
          </div>
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
                      setNewCoffee({ ...newCoffee, inStock: value === "true" })
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
                Update the coffee information.
              </DialogDescription>
            </DialogHeader>
            {editingCoffee && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
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
                    Origin
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
                    Price
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
      <footer className="py-12 px-6 bg-card border-t mt-16">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
          <p className="text-lg text-foreground font-medium">
            © 2025 Cool Beans Coffee Management. All rights reserved.
          </p>
          <p className="text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer">
            Follow us on Instagram @coolbeanscoffee
          </p>
        </div>
      </footer>
    </div>
  );
}
