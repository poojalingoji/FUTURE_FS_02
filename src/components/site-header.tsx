import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="/#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
          <Button asChild size="sm" className="bg-gradient-primary shadow-elegant">
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <Logo />
          <p>© {new Date().getFullYear()} LeadFlow CRM. Built for modern sales teams.</p>
          <div className="flex gap-6">
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
            <Link to="/login" className="hover:text-foreground">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
