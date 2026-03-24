import { Waves } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-10">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
      <a href="#" className="flex items-center gap-2">
        <Waves className="text-primary" size={22} />
        <span className="font-brush text-lg text-foreground">Soul Surf</span>
      </a>
      <div className="flex gap-6 text-sm text-foreground/50">
        <a href="#about" className="hover:text-foreground transition-colors">Nosotros</a>
        <a href="#pricing" className="hover:text-foreground transition-colors">Precios</a>
        <a href="#gallery" className="hover:text-foreground transition-colors">Galería</a>
        <a href="#location" className="hover:text-foreground transition-colors">Contacto</a>
      </div>
      <p className="text-xs text-foreground/30">
        © {new Date().getFullYear()} Soul Surf. Todos los derechos reservados.
      </p>
    </div>
  </footer>
);

export default Footer;
