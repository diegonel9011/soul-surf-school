import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Calendar, User, Users, Sunrise, Sun, MapPin, BarChart3 } from "lucide-react";
import heroImg from "@/assets/hero-surf.jpg";

const WA_URL = "https://wa.me/529541483342?text=Hola%2C%20me%20interesa%20reservar%20una%20clase%20de%20surf%20%F0%9F%8F%84";

const PRICE_MAP: Record<string, number> = {
  private:       1300,
  group:         1000,
  half_day_trip: 2800,
  full_day_trip: 5000,
};

const MAX_PERSONS: Record<string, number> = {
  private:       1,
  group:         2,
  half_day_trip: 4,
  full_day_trip: 4,
};

const CLASS_OPTIONS = [
  { value: "private",       label: "Solo / Clase Privada",      desc: "1 alumno · instructor dedicado",      icon: User    },
  { value: "group",         label: "En Pareja / Clase Grupal",  desc: "2 alumnos · mismo instructor",        icon: Users   },
  { value: "half_day_trip", label: "Excursión Medio Día",       desc: "Hasta 4 personas · 2 guías",         icon: Sunrise },
  { value: "full_day_trip", label: "Excursión Día Completo",    desc: "Hasta 4 personas · mañana + tarde",   icon: Sun     },
];

const BEACH_LABELS: Record<string, string> = {
  carrizalillo: "Carrizalillo",
  "la-punta":   "La Punta",
};

const formatDateDisplay = (d: string) => {
  if (!d) return "";
  return new Date(d + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
};

const today = new Date().toISOString().split("T")[0];

// ─── Component ────────────────────────────────────────────────────────────────
const HeroSection = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [classType, setClassType] = useState("private");
  const [date,      setDate]      = useState("");
  const [beach,     setBeach]     = useState("carrizalillo");
  const [level,     setLevel]     = useState("beginner");

  const handleSolicitar = () => {
    const pricePerLesson  = PRICE_MAP[classType] ?? 1300;
    const numParticipants = MAX_PERSONS[classType] ?? 1;
    navigate("/disponibilidad", {
      state: {
        classType,
        level,
        numParticipants,
        pricePerLesson,
        totalAmount: pricePerLesson * numParticipants,
        date:        formatDateDisplay(date),
        dateRaw:     date,
        beach:       BEACH_LABELS[beach] ?? beach,
      },
    });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-12 px-4">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="Surfer en Puerto Escondido" className="w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      {/* Headings */}
      <div className="text-center animate-reveal-up">
        <p className="text-sm md:text-base uppercase tracking-[0.3em] text-foreground/60 mb-3">
          Bienvenidos al paraíso
        </p>
        <h1 className="font-brush text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-foreground leading-[1.1]">
          Experience the
          <br />
          <span className="text-gradient-hero">Extraordinary</span>
        </h1>
        <p className="mt-4 text-foreground/60 max-w-md mx-auto text-base md:text-lg">
          Cuéntanos tu fecha preferida y te confirmamos el mejor horario según la previsión de olas.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Button
            variant="hero"
            size="xl"
            className="w-full sm:w-auto min-w-52"
            onClick={() => setShowModal(true)}
          >
            Solicitar Reserva
          </Button>

          <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="xl"
              className="w-full sm:w-auto min-w-52 gap-2.5 border-foreground/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contáctanos por WhatsApp
            </Button>
          </a>
        </div>
      </div>

      {/* ── Modal de reserva ─────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-card rounded-3xl shadow-2xl w-full max-w-md p-6 animate-reveal-scale"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-card-foreground font-bold text-xl">¿Cómo quieres surfear?</h2>
              <button onClick={() => setShowModal(false)} className="text-card-foreground/30 hover:text-card-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Tipo de clase */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {CLASS_OPTIONS.map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setClassType(value)}
                  className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 active:scale-[0.97] ${
                    classType === value
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <Icon size={20} className={classType === value ? "text-primary mb-2" : "text-card-foreground/40 mb-2"} />
                  <p className="text-card-foreground font-semibold text-sm leading-tight">{label}</p>
                  <p className="text-card-foreground/40 text-xs mt-0.5">{desc}</p>
                </button>
              ))}
            </div>

            {/* Fecha */}
            <div className="mb-4">
              <label className="text-card-foreground/60 text-xs font-medium mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} /> Fecha preferida
                <span className="text-destructive ml-1">*</span>
              </label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full rounded-xl border bg-background text-card-foreground px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  !date ? "border-destructive/50" : "border-border"
                }`}
              />
            </div>

            {/* Playa */}
            <div className="mb-4">
              <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block flex items-center gap-1.5">
                <MapPin size={13} /> Playa
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: "carrizalillo", label: "Carrizalillo" }, { value: "la-punta", label: "La Punta" }].map((b) => (
                  <button
                    key={b.value}
                    onClick={() => setBeach(b.value)}
                    className={`rounded-xl border-2 py-2.5 text-sm font-medium transition-all ${
                      beach === b.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-card-foreground/60 hover:border-primary/30"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nivel */}
            <div className="mb-6">
              <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block flex items-center gap-1.5">
                <BarChart3 size={13} /> Tu nivel de surf
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "beginner",     label: "Principiante" },
                  { value: "intermediate", label: "Intermedio"   },
                  { value: "advanced",     label: "Avanzado"     },
                ].map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    className={`rounded-xl border-2 py-2.5 text-xs font-medium transition-all ${
                      level === l.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-card-foreground/60 hover:border-primary/30"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full" disabled={!date} onClick={handleSolicitar}>
              Ver Horarios Disponibles →
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
