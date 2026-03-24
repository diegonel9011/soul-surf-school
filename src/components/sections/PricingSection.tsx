import { useNavigate } from "react-router-dom";
import SurfCard from "@/components/SurfCard";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/components/useScrollReveal";
import { User, Users, Sun, Sunrise, Check } from "lucide-react";

// ─── Datos reales del negocio ─────────────────────────────────────────────────
// Precios y reglas acordados con Soul Surf School
const packages = [
  {
    icon:      User,
    classType: "private",
    name:      "Clase Privada",
    price:     "$1,300",
    currency:  "MXN · 1 a 1",
    features: [
      "Instructor dedicado solo para ti",
      "2 horas (30 min teoría + agua)",
      "Tabla de surf + lycra incluidos",
      "Análisis de técnica personalizado",
      "Paquetes con descuento: 3, 4, 5 y 6+ clases",
    ],
  },
  {
    icon:      Users,
    classType: "group",
    name:      "Clase Grupal",
    price:     "$1,000",
    currency:  "MXN · por persona",
    features: [
      "Máximo 2 alumnos por instructor",
      "2 horas (30 min teoría + agua)",
      "Tabla de surf + lycra incluidos",
      "Ambiente divertido y motivador",
      "Ideal para amigos y parejas",
    ],
  },
  {
    icon:      Sunrise,
    classType: "half_day_trip",
    name:      "Excursión Medio Día",
    price:     "$2,800",
    currency:  "MXN · por persona",
    features: [
      "Hasta 4 personas · 2 guías expertos",
      "Transporte incluido",
      "Locaciones especiales sin aglomeraciones",
      "Sesión de mañana",
      "Tabla de surf + lycra incluidos",
    ],
  },
  {
    icon:        Sun,
    classType:   "full_day_trip",
    name:        "Excursión Día Completo",
    price:       "$5,000",
    currency:    "MXN · por persona",
    highlighted: true,
    features: [
      "Hasta 4 personas · 2 guías expertos",
      "Transporte incluido",
      "Locaciones especiales sin aglomeraciones",
      "Sesión de mañana + sesión de tarde",
      "Tabla de surf + lycra incluidos",
    ],
  },
] as const;

const PricingSection = () => {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollReveal();

  const handleSolicitar = (classType: string) => {
    navigate("/disponibilidad", { state: { classType } });
  };

  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-primary mb-3">Paquetes de Surf</p>
          <h2 className="font-brush text-3xl md:text-5xl text-foreground leading-[1.15]">
            Ride Your Wave
          </h2>
        </div>
        <div
          ref={ref}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
          {packages.map((pkg, i) => (
            <SurfCard
              key={pkg.name}
              className={`flex flex-col justify-between transition-all duration-700 ${isVisible ? "animate-reveal-up" : ""} ${"highlighted" in pkg && pkg.highlighted ? "ring-2 ring-primary animate-gentle-float" : ""}`}
              style={{ animationDelay: `${i * 100}ms` } as React.CSSProperties}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <pkg.icon size={22} className="text-primary" />
                </div>
                <h3 className="text-card-foreground font-bold text-lg mb-1">{pkg.name}</h3>
                <div className="mb-5">
                  <span className="text-3xl font-extrabold text-card-foreground">{pkg.price}</span>
                  <span className="text-xs text-muted-foreground ml-1">{pkg.currency}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-card-foreground/70">
                      <Check size={14} className="text-accent flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant={"highlighted" in pkg && pkg.highlighted ? "hero" : "outline"}
                className={`w-full btn-wave-shimmer ${"highlighted" in pkg && pkg.highlighted ? "" : "text-card-foreground border-card-foreground/20 hover:bg-card-foreground/5"}`}
                onClick={() => handleSolicitar(pkg.classType)}
              >
                Solicitar
              </Button>
            </SurfCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
