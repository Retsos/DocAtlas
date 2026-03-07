import { useState } from "react";
import { Button } from "./ui/button";
import { Menu, Phone, X } from "lucide-react";

const HospitalNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">+</span>
          </div>
          <span className="font-display text-xl font-semibold text-foreground">
            MediCare<span className="text-primary">Plus</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span>(555) 123-4567</span>
          </div>
          <Button>Book Appointment</Button>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
    </nav>
  );
};

export default HospitalNav;
