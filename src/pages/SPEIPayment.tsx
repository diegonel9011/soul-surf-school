import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SurfCard from "@/components/SurfCard";
import { ArrowLeft, Upload, FileCheck, Copy, Check, Waves, Loader2, AlertCircle } from "lucide-react";

// ─── API ─────────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BookingDetails {
  bookingRef:  string;
  totalAmount: number;
  classType:   string;
  date?:       string;
  clabe?:      string;   // Si el backend devuelve CLABE dinámica por reserva
  concept?:    string;   // Si el backend devuelve concepto/referencia dinámica
}

// ─── Component ────────────────────────────────────────────────────────────────
const SPEIPaymentPage = () => {
  const navigate       = useNavigate();
  const { token }      = useParams<{ token: string }>();

  // ── File state ─────────────────────────────────────────────────────────
  const [file,       setFile]       = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied,     setCopied]     = useState<string | null>(null);

  // ── UI state ───────────────────────────────────────────────────────────
  const [isLoading,      setIsLoading]      = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [paymentId,      setPaymentId]      = useState<string | null>(null);

  // ── Fetch booking details by token (bookingId) ────────────────────────
  useEffect(() => {
    if (!token || !API_URL || token.startsWith("demo-")) return;
    fetch(`${API_URL}/api/v1/payments/spei/instructions?booking_id=${token}`)
      .then((r) => r.json())
      .then((raw) => {
        const d = raw.data ?? raw;
        if (d?.bookingRef || d?.paymentId) {
          setPaymentId(d.paymentId ?? null);
          setBookingDetails({
            bookingRef:  d.bookingRef,
            totalAmount: d.totalAmount ?? d.amount,
            classType:   d.classType ?? "",
            clabe:       d.clabe ?? d.bankDetails?.clabe,
            concept:     d.concept ?? d.bookingRef,
          });
        }
      })
      .catch(() => {});
  }, [token]);

  // ── Bank details (dinámicos si el backend los provee) ─────────────────
  const amount  = bookingDetails?.totalAmount
    ? `$${bookingDetails.totalAmount.toLocaleString("es-MX")}.00 MXN`
    : "$1,300.00 MXN";
  const concept = bookingDetails?.bookingRef ?? "SURF-REF-2026";
  const clabe   = bookingDetails?.clabe      ?? "012 180 0015 8923 4561";

  const bankDetails = [
    { label: "Banco",        value: "BBVA México"                },
    { label: "Beneficiario", value: "Soul Surf S.A. de C.V."     },
    { label: "CLABE",        value: clabe,    copyable: true      },
    { label: "Concepto",     value: concept,  copyable: true      },
    { label: "Monto",        value: amount                        },
  ];

  // ── Drag & drop ────────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Submit → POST /api/v1/payment-proofs ──────────────────────────────
  const handleSubmit = async () => {
    if (!file || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Modo demo: token que empieza con "demo-" o sin API_URL configurada
      if (!API_URL || token.startsWith("demo-")) {
        await new Promise((r) => setTimeout(r, 1200));
        const ref = token.replace("demo-token-", "") ?? "SURF-DEMO";
        navigate(`/booking/${ref}/success?status=pending`);
        return;
      }

      if (!paymentId) {
        setError("No se encontró el ID de pago. Recarga la página e intenta de nuevo.");
        return;
      }

      const formData = new FormData();
      formData.append("proof",       file);
      formData.append("payment_id",  paymentId);
      formData.append("booking_id",  token);

      const res = await fetch(`${API_URL}/api/v1/payments/spei/upload-proof`, {
        method: "POST",
        body:   formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Error al subir el comprobante");

      const ref = bookingDetails?.bookingRef ?? "spei";
      navigate(`/booking/${ref}/success?status=pending`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg === "Failed to fetch" || msg.includes("fetch")
          ? "No se pudo conectar con el servidor. Contáctanos por WhatsApp al +52 954 123 4567."
          : msg || "No se pudo enviar el comprobante. Inténtalo de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">

        <button
          onClick={() => navigate("/reservar")}
          className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Volver al checkout</span>
        </button>

        <SurfCard className="animate-reveal-scale">

          <div className="flex items-center gap-3 mb-6">
            <Waves className="text-primary" size={24} />
            <h1 className="font-brush text-2xl text-card-foreground">Pago SPEI</h1>
          </div>

          <p className="text-card-foreground/60 text-sm mb-6">
            Transfiere el monto exacto a la siguiente cuenta y sube tu comprobante.
          </p>

          {/* Banner de error */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 mb-6 text-sm text-destructive">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Datos bancarios */}
          <div className="space-y-3 mb-8">
            {bankDetails.map((d) => (
              <div key={d.label} className="flex items-center justify-between rounded-xl bg-card-foreground/[0.03] px-4 py-3">
                <div>
                  <p className="text-[11px] text-card-foreground/40 uppercase tracking-wider">{d.label}</p>
                  <p className="text-card-foreground font-medium text-sm tabular-nums">{d.value}</p>
                </div>
                {d.copyable && (
                  <button
                    onClick={() => copyToClipboard(d.value, d.label)}
                    className="text-primary hover:text-primary/70 transition-colors p-1"
                    aria-label={`Copiar ${d.label}`}
                  >
                    {copied === d.label ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              file
                ? "border-accent bg-accent/5"
                : isDragging
                ? "border-primary bg-primary/5"
                : "border-card-foreground/15 hover:border-card-foreground/30"
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileCheck size={32} className="text-accent" />
                <p className="text-card-foreground font-medium text-sm">{file.name}</p>
                <p className="text-card-foreground/40 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                <button
                  onClick={() => setFile(null)}
                  className="text-xs text-destructive hover:underline mt-1"
                >
                  Eliminar archivo
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} className="text-card-foreground/30" />
                <p className="text-card-foreground/60 text-sm">
                  Arrastra tu comprobante aquí
                </p>
                <p className="text-card-foreground/30 text-xs">o</p>
                <label className="cursor-pointer text-primary text-sm font-medium hover:underline">
                  Seleccionar archivo
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full mt-6"
            disabled={!file || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Subiendo…
              </span>
            ) : (
              "Enviar Comprobante"
            )}
          </Button>

        </SurfCard>
      </div>
    </div>
  );
};

export default SPEIPaymentPage;
