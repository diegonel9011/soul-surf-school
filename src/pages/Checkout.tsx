import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SurfCard from "@/components/SurfCard";
import SurfInput from "@/components/SurfInput";
import SurfSelect from "@/components/SurfSelect";
import {
  ArrowLeft, User, Mail, Phone, BarChart3,
  CreditCard, Building2, Waves, Loader2, AlertCircle,
} from "lucide-react";

// ─── API ─────────────────────────────────────────────────────────────────────
// Vite expone las vars de entorno con import.meta.env (prefijo VITE_)
// Crea un archivo .env en la raíz con: VITE_API_URL=http://localhost:3001
const API_URL = import.meta.env.VITE_API_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────
// Este estado viene de /disponibilidad via navigate("/reservar", { state })
interface BookingState {
  classType?:       "private" | "group" | "half_day_trip" | "full_day_trip";
  slotId?:          string;
  numLessons?:      number;
  numParticipants?: number;
  pricePerLesson?:  number;
  totalAmount?:     number;
  date?:            string;       // "28 mar. 2026"
  dateRaw?:         string;       // "YYYY-MM-DD"
  time?:            string;       // "09:00"
  beach?:           string;       // "Carrizalillo"
  instructor?:      string;
}

interface FieldErrors {
  fullName?:      string;
  email?:         string;
  level?:         string;
  paymentMethod?: string;
}

const CLASS_LABELS: Record<string, string> = {
  private:       "Clase Privada",
  group:         "Clase Grupal",
  half_day_trip: "Excursión Medio Día",
  full_day_trip: "Excursión Día Completo",
};

// ─── Component ────────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Datos de la reserva enviados desde el widget de búsqueda
  const booking = (location.state as BookingState) ?? {};

  // ── Form fields ────────────────────────────────────────────────────────
  const [fullName,      setFullName]      = useState("");
  const [email,         setEmail]         = useState("");
  const [phone,         setPhone]         = useState("");
  const [level,         setLevel]         = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "spei" | "">("");

  // ── UI states ──────────────────────────────────────────────────────────
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // ── Derived summary ────────────────────────────────────────────────────
  const totalAmount     = booking.totalAmount     ?? 1300;
  const pricePerLesson  = booking.pricePerLesson  ?? 1300;
  const numLessons      = booking.numLessons      ?? 1;
  const numParticipants = booking.numParticipants ?? 1;
  const classLabel      = CLASS_LABELS[booking.classType ?? "private"];

  // ── Helpers ────────────────────────────────────────────────────────────
  const clearFieldError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: FieldErrors = {};

    if (!fullName.trim())
      errs.fullName = "El nombre es requerido";

    if (!email.trim())
      errs.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Email inválido";

    if (!level)
      errs.level = "Selecciona tu nivel de surf";

    if (!paymentMethod)
      errs.paymentMethod = "Selecciona un método de pago";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit → POST /api/v1/bookings ─────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setError(null);

    // Partir "Nombre Apellido" en dos partes para la API
    const parts     = fullName.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName  = parts.length > 1 ? parts.slice(1).join(" ") : parts[0];

    try {
      let data: { paymentUrl?: string; paymentLinkToken?: string; bookingId?: string; bookingRef?: string };

      if (!API_URL) {
        // ── Modo demo: sin backend ──────────────────────────────────────
        await new Promise((r) => setTimeout(r, 1200)); // simula latencia
        const demoRef = `SURF-DEMO-${Math.floor(Math.random() * 9000) + 1000}`;
        data = paymentMethod === "mercadopago"
          ? { paymentUrl: `/booking/${demoRef}/success?status=success&classType=${booking.classType ?? "private"}&date=${encodeURIComponent(booking.date ?? "")}&time=${encodeURIComponent(booking.time ?? "")}&beach=${encodeURIComponent(booking.beach ?? "")}` }
          : { paymentLinkToken: `demo-token-${demoRef}` };
      } else {
        // Si el slot_id no es UUID (demo-*, s-*) → modo demo aunque haya API_URL
        const slotId = booking.slotId ?? "";
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slotId);
        if (!isUUID) {
          await new Promise((r) => setTimeout(r, 1200));
          const demoRef = `SURF-DEMO-${Math.floor(Math.random() * 9000) + 1000}`;
          data = paymentMethod === "mercadopago"
            ? { paymentUrl: `/booking/${demoRef}/success?status=success&classType=${booking.classType ?? "private"}&date=${encodeURIComponent(booking.date ?? "")}&time=${encodeURIComponent(booking.time ?? "")}&beach=${encodeURIComponent(booking.beach ?? "")}` }
            : { paymentLinkToken: `demo-token-${demoRef}` };
        } else {
          const res = await fetch(`${API_URL}/api/v1/bookings`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              class_type:       booking.classType       ?? "private",
              slot_id:          slotId,
              num_lessons:      booking.numLessons      ?? 1,
              num_participants: booking.numParticipants ?? 1,
              client: {
                first_name: firstName,
                last_name:  lastName,
                email,
                phone:      phone || undefined,
                surf_level: level,
              },
              waiver:          true,
              payment_method:  paymentMethod || undefined,
            }),
          });

          const raw = await res.json();
          if (!res.ok) throw new Error(raw.message ?? raw.data?.message ?? "Error al crear la reserva");
          // Backend devuelve { ok, data: { bookingId, bookingRef, ... } }
          const payload = raw.data ?? raw;
          data = {
            bookingId:        payload.bookingId,
            bookingRef:       payload.bookingRef,
            paymentUrl:       payload.paymentUrl,
            paymentLinkToken: payload.bookingId, // reutilizamos bookingId como token SPEI
          };
        }
      }

      // ── Redirección según método ─────────────────────────────────────
      if (paymentMethod === "mercadopago") {
        window.location.href = data.paymentUrl!;
      } else {
        navigate(`/pay/${data.paymentLinkToken}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg === "Failed to fetch" || msg.includes("NetworkError") || msg.includes("fetch")
          ? "No se pudo conectar con el servidor. Contáctanos por WhatsApp al +52 954 123 4567."
          : msg || "No se pudo procesar la reserva. Inténtalo de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = !paymentMethod || !fullName || !email || !level || isLoading;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-5xl">

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Volver al inicio</span>
        </button>

        <div className="flex items-center gap-3 mb-10">
          <Waves className="text-primary" size={28} />
          <h1 className="font-brush text-3xl md:text-4xl text-foreground">Reservar Clase</h1>
        </div>

        {/* Banner de error global */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 mb-6 text-sm text-destructive">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Formulario — izquierda ─────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">

            <SurfCard>
              <h2 className="text-card-foreground font-bold text-lg mb-6">Datos Personales</h2>
              <div className="space-y-4">

                <div>
                  <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block">Nombre completo</label>
                  <SurfInput
                    icon={<User size={16} />}
                    placeholder="Ej. María García"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); clearFieldError("fullName"); }}
                    error={!!fieldErrors.fullName}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-destructive text-xs mt-1.5 pl-2">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block">Email</label>
                  <SurfInput
                    icon={<Mail size={16} />}
                    type="email"
                    placeholder="maria@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                    error={!!fieldErrors.email}
                  />
                  {fieldErrors.email && (
                    <p className="text-destructive text-xs mt-1.5 pl-2">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block">
                    Teléfono <span className="text-card-foreground/30">(opcional)</span>
                  </label>
                  <SurfInput
                    icon={<Phone size={16} />}
                    type="tel"
                    placeholder="+52 954 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block">Nivel de surf</label>
                  <SurfSelect
                    icon={<BarChart3 size={16} />}
                    placeholder="Selecciona tu nivel"
                    value={level}
                    onChange={(e) => { setLevel(e.target.value); clearFieldError("level"); }}
                    options={[
                      { value: "beginner",     label: "Principiante" },
                      { value: "intermediate", label: "Intermedio"   },
                      { value: "advanced",     label: "Avanzado"     },
                    ]}
                    className={fieldErrors.level ? "border-destructive focus:ring-destructive" : ""}
                  />
                  {fieldErrors.level && (
                    <p className="text-destructive text-xs mt-1.5 pl-2">{fieldErrors.level}</p>
                  )}
                </div>
              </div>
            </SurfCard>

            <SurfCard>
              <h2 className="text-card-foreground font-bold text-lg mb-6">Método de Pago</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <button
                  type="button"
                  onClick={() => { setPaymentMethod("mercadopago"); clearFieldError("paymentMethod"); }}
                  className={`rounded-2xl border-2 p-5 flex items-center gap-4 transition-all duration-200 active:scale-[0.97] ${
                    paymentMethod === "mercadopago"
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-card-foreground/10 hover:border-card-foreground/25"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "mercadopago" ? "bg-primary/15 text-primary" : "bg-card-foreground/5 text-card-foreground/40"}`}>
                    <CreditCard size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-card-foreground text-sm">Mercado Pago</p>
                    <p className="text-xs text-card-foreground/50">Tarjeta, OXXO, etc.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod("spei"); clearFieldError("paymentMethod"); }}
                  className={`rounded-2xl border-2 p-5 flex items-center gap-4 transition-all duration-200 active:scale-[0.97] ${
                    paymentMethod === "spei"
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-card-foreground/10 hover:border-card-foreground/25"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "spei" ? "bg-primary/15 text-primary" : "bg-card-foreground/5 text-card-foreground/40"}`}>
                    <Building2 size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-card-foreground text-sm">SPEI</p>
                    <p className="text-xs text-card-foreground/50">Transferencia bancaria</p>
                  </div>
                </button>
              </div>
              {fieldErrors.paymentMethod && (
                <p className="text-destructive text-xs mt-3 pl-2">{fieldErrors.paymentMethod}</p>
              )}
            </SurfCard>
          </div>

          {/* ── Resumen — derecha ──────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <SurfCard className="sticky top-24">
              <h2 className="text-card-foreground font-bold text-lg mb-5">Resumen</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-card-foreground/60">Clase</span>
                  <span className="text-card-foreground font-medium">{classLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-card-foreground/60">Playa</span>
                  <span className="text-card-foreground font-medium">{booking.beach ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-card-foreground/60">Fecha</span>
                  <span className="text-card-foreground font-medium">{booking.date ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-card-foreground/60">Hora</span>
                  <span className="text-card-foreground font-medium">
                    {booking.time ? `${booking.time} hrs` : "—"}
                  </span>
                </div>
                {booking.instructor && (
                  <div className="flex justify-between">
                    <span className="text-card-foreground/60">Instructor</span>
                    <span className="text-card-foreground font-medium">{booking.instructor}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-card-foreground/60">
                    {booking.classType === "private" ? "Clases" : "Personas"}
                  </span>
                  <span className="text-card-foreground font-medium">
                    {booking.classType === "private" ? numLessons : numParticipants}
                  </span>
                </div>

                {/* Desglose del precio */}
                <div className="rounded-xl bg-card-foreground/[0.03] px-3 py-2.5 text-xs text-card-foreground/50">
                  {booking.classType === "private"
                    ? `${numLessons} ${numLessons === 1 ? "clase" : "clases"} × $${pricePerLesson.toLocaleString()}/clase`
                    : `${numParticipants} ${numParticipants === 1 ? "persona" : "personas"} × $${pricePerLesson.toLocaleString()}/persona`}
                </div>

                <div className="border-t border-card-foreground/10 pt-3 mt-1 flex justify-between items-end">
                  <span className="text-card-foreground font-bold">Total</span>
                  <span className="text-card-foreground font-extrabold text-xl tabular-nums">
                    ${totalAmount.toLocaleString("es-MX")}{" "}
                    <span className="text-xs font-normal text-card-foreground/50">MXN</span>
                  </span>
                </div>
              </div>

              <Button
                variant="hero"
                size="xl"
                className="w-full mt-6"
                disabled={isSubmitDisabled}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Procesando…
                  </span>
                ) : (
                  "Confirmar Reserva"
                )}
              </Button>
              <p className="text-[11px] text-card-foreground/40 text-center mt-3">
                Al confirmar aceptas nuestros términos y condiciones
              </p>
            </SurfCard>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
