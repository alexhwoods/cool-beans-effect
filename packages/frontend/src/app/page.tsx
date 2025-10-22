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
      <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
        <Image
          src="/roast-coffee.avif"
          alt="Cool Beans Coffee Shop"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 flex items-center justify-center">
          <div className="text-center text-white z-10 max-w-4xl px-6">
            <h2 className="text-7xl font-bold mb-6 drop-shadow-2xl leading-tight">
              Where Every Cup Tells a Story
            </h2>
            <p className="text-2xl mb-10 drop-shadow-lg max-w-2xl mx-auto leading-relaxed">
              Handcrafted coffee, locally roasted, served with love
            </p>
            <Button
              size="lg"
              className="text-lg px-12 py-4 text-lg font-semibold shadow-2xl hover:scale-105 transition-transform duration-200"
            >
              Order Now
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-foreground">
            Our Services
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {/* Card 1 - Spilled Beans */}
          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
            <div className="relative h-72 w-full overflow-hidden">
              <Image
                src="/spilled-beans.avif"
                alt="Fresh Coffee Beans"
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                Fresh Roasted Beans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Small-batch roasting ensures peak freshness and flavor in every
                cup.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card 2 - Local Businesses */}
          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
            <div className="relative h-72 w-full overflow-hidden">
              <Image
                src="/community-first-lol.avif"
                alt="Supporting Local Businesses"
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                Community First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Supporting local farmers and roasters. Every cup helps our
                community thrive.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card 3 - Iced Coffee */}
          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
            <div className="relative h-72 w-full overflow-hidden">
              <Image
                src="/iced-coffee.avif"
                alt="Iced Coffee"
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                Iced Coffee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Smooth and refreshing. Perfect for warm days and cool vibes.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-card py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div>
              <h2 className="text-5xl font-bold mb-4 text-foreground">
                About Cool Beans
              </h2>
              <div className="w-24 h-1 bg-primary rounded-full"></div>
            </div>
            <div className="space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                We're more than just a coffee shop – we're a community hub where
                friends meet, ideas brew, and moments are savored one cup at a
                time.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our beans are ethically sourced, locally roasted, and expertly
                prepared by our passionate baristas who take pride in every
                pour.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Whether you're here for a quick morning pick-me-up or settling
                in for an afternoon of work, Cool Beans is your home away from
                home.
              </p>
            </div>
          </div>
          <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
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
        className="py-20 px-6 bg-primary text-primary-foreground relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary opacity-50"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-bold mb-8">Visit Us Today</h2>
          <div className="space-y-4 mb-12">
            <p className="text-2xl font-medium">
              123 Coffee Street, Bean Town, CA 94000
            </p>
            <p className="text-xl opacity-90">Open Daily: 7:00 AM - 8:00 PM</p>
          </div>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-12 py-4 font-semibold shadow-2xl hover:scale-105 transition-transform duration-200"
          >
            Get Directions
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-card border-t">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
          <p className="text-lg text-foreground font-medium">
            © 2025 Cool Beans Coffee Shop. All rights reserved.
          </p>
          <p className="text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer">
            Follow us on Instagram @coolbeanscoffee
          </p>
        </div>
      </footer>
    </div>
  );
}
