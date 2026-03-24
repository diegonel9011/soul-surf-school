import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SurfCard from "@/components/SurfCard";
import { CheckCircle2, Clock, XCircle, Waves } from "lucide-react";

type BookingStatus = "success" | "pending" | "failure";

const statusConfig: Record<BookingStatus, {
  icon:        typeof CheckCircle2;
  iconClass:   string;
  title:       string;
  description: string;
}> = {
  success: {
    icon:        CheckCircle2,
    iconClass:   "text-accent",
    title:       "¡Tu reserva está confirmada!",
    description: "Te enviamos un correo con los detalles de tu clase. Nos vemos en la playa 🤙",
  },
  pending: {
    icon:        Clock,
    iconClass:   "text-warning",
    title:       "Comprobante recibido",
    description: "Estamos verificando tu pago SPEI. Te notificaremos por correo cuando sea confirmado.",
  },
  failure: {
    icon:        XCircle,
    iconClass:   "text-destructive",
    title:       "Algo salió mal",
    description: "No pudimos procesar tu reserva. Por favor intenta de nuevo o contáctanos directamente.",
  },
};

const CLASS_LABELS: Record<string, string> = {
  private:       "Privada",
  group:         "Grupal",
  half_day_trip: "Excursión Medio Día",
  full_day_trip: "Excursión Día Completo",
};

const BookingSuccessPage = () => {
  const navigate = useNavigate();

  // bookingId viene del path: /booking/:bookingId/success
  // Es el bookingRef real devuelto por la API (ej. "SURF-0328")
  const { bookingId } = useParams<{ bookingId: string }>();

  // Datos adicionales opcionales pasados como query params
  const [searchParams] = useSearchParams();
  const status    = (searchParams.get("status")    as BookingStatus) || "success";
  const classType = searchParams.get("classType")  ?? "";
  const date      = searchParams.get("date")        ?? "";
  const time      = searchParams.get("time")        ?? "";
  const beach     = searchParams.get("beach")       ?? "";

  const config    = statusConfig[status];
  const Icon      = config.icon;
  const classLabel = CLASS_LABELS[classType] ?? classType;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SurfCard className="max-w-md w-full text-center animate-reveal-scale">
        <div className="flex justify-center mb-6">
          <div className="animate-check-bounce">
            <Icon size={72} className={config.iconClass} strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <Waves className="text-primary" size={20} />
          <span className="font-brush text-lg text-card-foreground">Soul Surf</span>
        </div>

        <h1 className="text-card-foreground font-bold text-xl md:text-2xl mb-3">
          {config.title}
        </h1>
        <p className="text-card-foreground/60 text-sm mb-8 max-w-xs mx-auto">
          {config.description}
        </p>

        {/* Detalle de reserva — visible en success y pending */}
        {(status === "success" || status === "pending") && bookingId && (
          <div className="rounded-xl bg-card-foreground/[0.03] p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-card-foreground/50">Referencia</span>
              <span className="text-card-foreground font-medium tabular-nums">{bookingId}</span>
            </div>
            {classLabel && (
              <div className="flex justify-between text-sm">
                <span className="text-card-foreground/50">Clase</span>
                <span className="text-card-foreground font-medium">
                  {classLabel}{beach ? ` — ${beach}` : ""}
                </span>
              </div>
            )}
            {(date || time) && (
              <div className="flex justify-between text-sm">
                <span className="text-card-foreground/50">Fecha</span>
                <span className="text-card-foreground font-medium">
                  {[date, time].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
        )}

        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={() => navigate(status === "failure" ? "/reservar" : "/")}
        >
          {status === "failure" ? "Intentar de nuevo" : "Volver al inicio"}
        </Button>
      </SurfCard>
    </div>
  );
};

export default BookingSuccessPage;
