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

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-4 px-6 shadow-lg bg-card border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Cool Beans</h1>
          <Navigation>
            <NavigationLink href="#menu">Menu</NavigationLink>
            <NavigationLink href="#about">About</NavigationLink>
            <NavigationLink href="#location">Location</NavigationLink>
          </Navigation>
        </div>
      </header>

      {/* Hero Section - Coffee Shop Photography */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src="/roast-coffee.avif"
          alt="Cool Beans Coffee Shop"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white z-10">
            <h2 className="text-6xl font-bold mb-4 drop-shadow-lg">
              Where Every Cup Tells a Story
            </h2>
            <p className="text-2xl mb-8 drop-shadow-md">
              Handcrafted coffee, locally roasted, served with love
            </p>
            <Button size="lg" className="text-lg">
              Order Now
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
          Our Services
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 - Spilled Beans */}
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-64 w-full">
              <Image
                src="/spilled-beans.avif"
                alt="Fresh Coffee Beans"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardHeader>
              <CardTitle>Fresh Roasted Beans</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Small-batch roasting ensures peak freshness and flavor in every
                cup.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card 2 - Local Businesses */}
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-64 w-full">
              <Image
                src="/community-first-lol.avif"
                alt="Supporting Local Businesses"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardHeader>
              <CardTitle>Community First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Supporting local farmers and roasters. Every cup helps our
                community thrive.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card 3 - Iced Coffee */}
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-64 w-full">
              <Image
                src="/iced-coffee.avif"
                alt="Iced Coffee"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardHeader>
              <CardTitle>Iced Coffee</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Smooth and refreshing. Perfect for warm days and cool vibes.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-card py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              About Cool Beans
            </h2>
            <p className="text-muted-foreground text-lg mb-4">
              We're more than just a coffee shop – we're a community hub where
              friends meet, ideas brew, and moments are savored one cup at a
              time.
            </p>
            <p className="text-muted-foreground text-lg mb-4">
              Our beans are ethically sourced, locally roasted, and expertly
              prepared by our passionate baristas who take pride in every pour.
            </p>
            <p className="text-muted-foreground text-lg">
              Whether you're here for a quick morning pick-me-up or settling in
              for an afternoon of work, Cool Beans is your home away from home.
            </p>
          </div>
          <div className="relative h-96 w-full rounded-lg overflow-hidden">
            <Image
              src="/shop-interior.avif"
              alt="Cool Beans Shop Interior"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Location/CTA Section */}
      <section
        id="location"
        className="py-16 px-6 bg-primary text-primary-foreground"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Visit Us Today</h2>
          <p className="text-xl mb-8">123 Coffee Street, Bean Town, CA 94000</p>
          <p className="text-lg mb-8">Open Daily: 7:00 AM - 8:00 PM</p>
          <Button size="lg" variant="secondary" className="text-lg">
            Get Directions
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-card border-t">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-2 text-foreground">
            © 2025 Cool Beans Coffee Shop. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Follow us on Instagram @coolbeanscoffee
          </p>
        </div>
      </footer>
    </div>
  );
}
