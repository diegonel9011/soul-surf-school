import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SurfCard from "@/components/SurfCard";
import {
  ArrowLeft, Clock, User, Users, MapPin,
  CalendarDays, Sparkles, Loader2, AlertCircle,
} from "lucide-react";

// ─── API ─────────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BookingState {
  classType?:       "private" | "group" | "half_day_trip" | "full_day_trip";
  numParticipants?: number;
  date?:            string;   // display "28 mar. 2026"
  dateRaw?:         string;   // "YYYY-MM-DD" para la API
  beach?:           string;
  level?:           string;
  pricePerLesson?:  number;
  totalAmount?:     number;
}

interface Slot {
  id:             string;
  startTime:      string;
  availableSpots: number;
  instructor?:    string;
  date?:          string;
}

// ─── Datos de referencia ──────────────────────────────────────────────────────

// Horarios demo: se muestran cuando la API no responde (backend apagado, CORS, etc.)
const MOCK_SLOTS: Slot[] = [
  { id: "demo-0700", startTime: "07:00", availableSpots: 1, instructor: "Wilbert" },
  { id: "demo-0900", startTime: "09:00", availableSpots: 2, instructor: "Carlos"  },
  { id: "demo-1100", startTime: "11:00", availableSpots: 1, instructor: "Wilbert" },
  { id: "demo-1400", startTime: "14:00", availableSpots: 1, instructor: "Ana"     },
];

// Tramos de precio para clases privadas (igual que seed.js del backend)
const PRIVATE_TIERS = [
  { label: "1 clase",   minLessons: 1, maxLessons: 1,    price: 1300, save: 0    },
  { label: "2 clases",  minLessons: 2, maxLessons: 2,    price: 1300, save: 0    },
  { label: "3 clases",  minLessons: 3, maxLessons: 3,    price: 1200, save: 300  },
  { label: "4 clases",  minLessons: 4, maxLessons: 4,    price: 1150, save: 600  },
  { label: "5 clases",  minLessons: 5, maxLessons: 5,    price: 1100, save: 1000 },
  { label: "6+ clases", minLessons: 6, maxLessons: null, price: 1050, save: 1500 },
];

// Precio base por classType (para excursiones y grupales, precio fijo)
const PRICE_MAP: Record<string, number> = {
  private:       1300,
  group:         1000,
  half_day_trip: 2800,
  full_day_trip: 5000,
};

const CLASS_LABELS: Record<string, string> = {
  private:       "Clase Privada",
  group:         "Clase Grupal",
  half_day_trip: "Excursión Medio Día",
  full_day_trip: "Excursión Día Completo",
};

// ─── Component ────────────────────────────────────────────────────────────────
const AvailabilityPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking  = (location.state as BookingState) ?? {};

  const classType       = booking.classType ?? "private";
  const isPrivate       = classType === "private";
  const numParticipants = booking.numParticipants ?? 1;

  // ── State ──────────────────────────────────────────────────────────────
  const [slots,        setSlots]        = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isMock,       setIsMock]       = useState(false);
  const [numLessons,   setNumLessons]   = useState(1);

  // ── Fetch horarios disponibles (API → localStorage → mock) ───────────
  useEffect(() => {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 4000);

    // Slots creados desde el admin panel (guardados en localStorage)
    const adminSlots: Slot[] = JSON.parse(localStorage.getItem("admin_slots") ?? "[]");
    const adminForDate = booking.dateRaw
      ? adminSlots.filter((s) => s.date === booking.dateRaw)
      : [];

    fetch(
      `${API_URL}/api/v1/availability?date=${booking.dateRaw ?? ""}&class_type=${classType}`,
      { signal: controller.signal },
    )
      .then((r) => r.json())
      .then((raw) => {
        // El backend envuelve la respuesta en { ok, data: [...] }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list: any[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        // Normalizar nombres de campos del backend → interfaz Slot del frontend
        const data: Slot[] = list
          .filter((s) => (s.availableSpots ?? s.available_spots ?? 1) > 0)
          .map((s) => ({
            id:             s.slotId ?? s.id,
            startTime:      s.startTime,
            availableSpots: s.availableSpots,
            instructor:     typeof s.instructor === "object" ? s.instructor?.name : s.instructor,
            date:           s.date,
          }));
        if (data.length > 0) {
          // API real respondió: combinar con slots de admin para esa fecha
          setSlots([...data, ...adminForDate.filter((a) => !data.some((d) => d.id === a.id))]);
          setIsMock(false);
        } else if (adminForDate.length > 0) {
          // Sin respuesta de API pero hay slots del admin para este día
          setSlots(adminForDate);
          setIsMock(false);
        } else {
          setSlots(MOCK_SLOTS);
          setIsMock(true);
        }
      })
      .catch(() => {
        if (adminForDate.length > 0) {
          setSlots(adminForDate);
          setIsMock(false);
        } else {
          setSlots(MOCK_SLOTS);
          setIsMock(true);
        }
      })
      .finally(() => {
        clearTimeout(timeout);
        setIsLoading(false);
      });

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cálculo de precio ──────────────────────────────────────────────────
  const getCurrentTier = () =>
    [...PRIVATE_TIERS].reverse().find((t) => numLessons >= t.minLessons) ?? PRIVATE_TIERS[0];

  const pricePerLesson = isPrivate
    ? getCurrentTier().price
    : (PRICE_MAP[classType] ?? 1300);

  const totalAmount = isPrivate
    ? pricePerLesson * numLessons
    : pricePerLesson * numParticipants;

  // ── Navega al checkout con el estado completo ──────────────────────────
  const handleContinuar = () => {
    if (!selectedSlot) return;

    navigate("/reservar", {
      state: {
        ...booking,
        slotId:          selectedSlot.id,
        numLessons:      isPrivate ? numLessons : 1,
        numParticipants,
        pricePerLesson,
        totalAmount,
        time:            selectedSlot.startTime,
        instructor:      selectedSlot.instructor,
      },
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-3xl">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Volver</span>
        </button>

        {/* Resumen de la búsqueda */}
        <SurfCard className="mb-6 !hover:-translate-y-0">
          <p className="text-xs text-foreground/40 uppercase tracking-widest mb-3">Tu solicitud</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5 text-foreground/80">
              <CalendarDays size={14} className="text-primary shrink-0" />
              <span>{booking.date || "Fecha por confirmar"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground/80">
              <MapPin size={14} className="text-primary shrink-0" />
              <span>{booking.beach ?? "Carrizalillo"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground/80">
              {isPrivate
                ? <User  size={14} className="text-primary shrink-0" />
                : <Users size={14} className="text-primary shrink-0" />}
              <span>{CLASS_LABELS[classType]}</span>
            </div>
            {numParticipants > 1 && (
              <div className="flex items-center gap-1.5 text-foreground/80">
                <Users size={14} className="text-primary shrink-0" />
                <span>{numParticipants} personas</span>
              </div>
            )}
          </div>
        </SurfCard>

        {/* ── Selector de paquete — solo clases privadas ───────────────── */}
        {isPrivate && (
          <SurfCard className="mb-6">
            <h2 className="text-card-foreground font-bold text-base mb-1">
              ¿Cuántas clases quieres?
            </h2>
            <p className="text-card-foreground/50 text-xs mb-4">
              Más clases = menor precio por clase
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              {PRIVATE_TIERS.map((tier) => {
                const isActive = numLessons >= tier.minLessons &&
                  (tier.maxLessons === null || numLessons <= tier.maxLessons);
                return (
                  <button
                    key={tier.label}
                    onClick={() => setNumLessons(tier.minLessons)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "border border-border text-foreground/60 hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {tier.label}
                    {tier.save > 0 && (
                      <span className={`ml-1.5 text-xs font-normal ${
                        isActive ? "text-primary-foreground/70" : "text-accent"
                      }`}>
                        −${tier.save.toLocaleString()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Desglose de precio */}
            <div className="rounded-2xl bg-card-foreground/[0.03] px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-card-foreground/50">
                  {numLessons} {numLessons === 1 ? "clase" : "clases"} × ${pricePerLesson.toLocaleString()}/clase
                </p>
                {getCurrentTier().save > 0 && (
                  <div className="flex items-center gap-1 text-accent text-xs mt-0.5">
                    <Sparkles size={11} />
                    Ahorras ${getCurrentTier().save.toLocaleString()} MXN vs precio base
                  </div>
                )}
              </div>
              <span className="font-extrabold text-card-foreground tabular-nums text-lg">
                ${totalAmount.toLocaleString()} <span className="text-xs font-normal text-card-foreground/40">MXN</span>
              </span>
            </div>
          </SurfCard>
        )}

        {/* ── Horarios disponibles ──────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground font-bold">Horarios disponibles</h2>
            {isMock && !isLoading && (
              <span className="text-[11px] text-foreground/40 bg-muted px-3 py-1 rounded-full">
                Datos de ejemplo
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : slots.length === 0 ? (
            <SurfCard>
              <div className="flex items-center gap-3 text-foreground/50">
                <AlertCircle size={18} />
                <p className="text-sm">Sin horarios para este día. Elige otra fecha.</p>
              </div>
            </SurfCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-3xl border-2 p-5 text-left transition-all duration-200 active:scale-[0.98] w-full ${
                    selectedSlot?.id === slot.id
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border bg-card hover:border-primary/30 hover:bg-primary/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-primary" />
                      <span className="font-bold text-card-foreground text-xl tabular-nums">
                        {slot.startTime} <span className="text-sm font-normal text-card-foreground/40">hrs</span>
                      </span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      slot.availableSpots <= 1
                        ? "bg-warning/10 text-warning"
                        : "bg-accent/10 text-accent"
                    }`}>
                      {slot.availableSpots} {slot.availableSpots === 1 ? "lugar" : "lugares"}
                    </span>
                  </div>
                  {slot.instructor && (
                    <p className="text-xs text-card-foreground/40">
                      <User size={11} className="inline mr-1" />
                      Instructor: {slot.instructor}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          variant="hero"
          size="xl"
          className="w-full"
          disabled={!selectedSlot}
          onClick={handleContinuar}
        >
          {selectedSlot
            ? `Continuar con las ${selectedSlot.startTime} hrs →`
            : "Selecciona un horario"}
        </Button>

        <p className="text-center text-xs text-foreground/30 mt-4">
          Playa Carrizalillo o La Punta según las condiciones del mar · Te confirmamos por WhatsApp
        </p>
      </div>
    </div>
  );
};

export default AvailabilityPage;
