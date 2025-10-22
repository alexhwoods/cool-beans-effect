import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
  children?: React.ReactNode;
}

const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn("flex items-center space-x-6", className)}
      {...props}
    />
  )
);
Navigation.displayName = "Navigation";

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavigationLink = React.forwardRef<HTMLAnchorElement, NavigationLinkProps>(
  ({ href, children, className, ...props }, ref) => (
    <Link
      ref={ref}
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
);
NavigationLink.displayName = "NavigationLink";

export { Navigation, NavigationLink };
