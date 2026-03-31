import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Samudaay</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#roles" className="hover:text-foreground transition-colors">For You</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Log In</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/register">Join Community</Link>
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 pb-4 space-y-3 animate-fade-in">
          <a href="#features" className="block text-sm font-medium text-muted-foreground hover:text-foreground">Features</a>
          <a href="#how-it-works" className="block text-sm font-medium text-muted-foreground hover:text-foreground">How It Works</a>
          <a href="#roles" className="block text-sm font-medium text-muted-foreground hover:text-foreground">For You</a>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" size="sm" asChild className="flex-1">
              <Link to="/login">Log In</Link>
            </Button>
            <Button variant="hero" size="sm" asChild className="flex-1">
              <Link to="/register">Join Community</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
