import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Waves } from "lucide-react";

const navLinks = [
  { label: "Nosotros", href: "#about" },
  { label: "Precios", href: "#pricing" },
  { label: "Galería", href: "#gallery" },
  { label: "Reseñas", href: "#testimonials" },
  { label: "Ubicación", href: "#location" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm">
      <div className="container flex items-center justify-between py-4">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <Waves className="text-primary" size={28} />
          <span className="font-brush text-xl text-foreground">Soul Surf</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-sm text-foreground/70 hover:text-foreground transition-colors duration-200 group/nav py-1"
            >
              {l.label}
              {/* Wave underline on hover */}
              <svg
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 w-full h-[6px] opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300"
              >
                <path
                  d="M0,4 C20,0 30,8 50,4 C70,0 80,8 100,4"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                  className="[stroke-dasharray:120] [stroke-dashoffset:120] group-hover/nav:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-500"
                />
              </svg>
            </a>
          ))}
          <Button variant="hero" size="default" asChild>
            <a href="#hero-widget">Solicitar Reserva</a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border animate-reveal-up">
          <div className="container py-6 flex flex-col gap-4">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-foreground/80 hover:text-foreground py-2 text-lg"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Button variant="hero" size="lg" className="mt-2" asChild>
              <a href="#hero-widget" onClick={() => setOpen(false)}>
                Solicitar Reserva
              </a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
