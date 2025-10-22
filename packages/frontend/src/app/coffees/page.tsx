import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navigation, NavigationLink } from "@/components/ui/navigation";

// Sample coffee data
const coffees = [
  {
    id: 1,
    name: "Ethiopian Yirgacheffe",
    origin: "Ethiopia",
    roast: "Light",
    price: 24.99,
    weight: "12oz",
    description: "Bright and floral with notes of jasmine and citrus",
    inStock: true,
    image: "/spilled-beans.avif",
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
    image: "/community-first-lol.avif",
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
    image: "/iced-coffee.avif",
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
    image: "/roast-coffee.avif",
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
    image: "/shop-interior.avif",
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
    image: "/spilled-beans.avif",
  },
];

export default function CoffeesPage() {
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

      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-4 text-foreground">
            Our Coffee Collection
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our carefully curated selection of premium coffees from
            around the world. Each bean is expertly roasted to bring out its
            unique flavor profile.
          </p>
        </div>
      </section>

      {/* Coffee Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coffees.map((coffee) => (
            <Card
              key={coffee.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group relative"
              style={{
                boxShadow: "8px 8px 0px 0px oklch(0.6083 0.0623 44.3588)",
              }}
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={coffee.image}
                  alt={coffee.name}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      coffee.inStock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {coffee.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                    {coffee.name}
                  </CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ${coffee.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {coffee.weight}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="font-medium">{coffee.origin}</span>
                  <span>•</span>
                  <span className="capitalize">{coffee.roast} Roast</span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed mb-4">
                  {coffee.description}
                </CardDescription>
                <Button
                  className="w-full"
                  disabled={!coffee.inStock}
                  variant={coffee.inStock ? "default" : "outline"}
                >
                  {coffee.inStock ? "Add to Cart" : "Notify When Available"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Need Custom Roasting?</h2>
          <p className="text-xl mb-8">
            We offer custom roasting services for businesses and special events.
            Contact us to discuss your requirements.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-12 py-4 font-semibold shadow-2xl hover:scale-105 transition-transform duration-200"
          >
            Contact Us
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-card border-t">
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
