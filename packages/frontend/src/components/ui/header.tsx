"use client";

import { Button } from "@/components/ui/button";
import { Navigation, NavigationLink } from "@/components/ui/navigation";

export function Header() {
  return (
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
  );
}
