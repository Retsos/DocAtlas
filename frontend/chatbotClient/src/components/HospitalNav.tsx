import { Phone } from "lucide-react";

const HospitalNav = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-700 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">+</span>
          </div>
          <span className="font-display text-xl font-semibold text-foreground">
            Care<span className="text-cyan-700">Medik</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span>(2310) 000000</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HospitalNav;
