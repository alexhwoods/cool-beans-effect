export function Footer() {
  return (
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
            © 2025 Cool Beans. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
