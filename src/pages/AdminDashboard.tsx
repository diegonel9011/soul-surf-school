import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SurfBadge from "@/components/SurfBadge";
import SurfCard from "@/components/SurfCard";
import {
  Waves, LayoutDashboard, CalendarDays, LogOut, Eye, Users,
  DollarSign, TrendingUp, X, Check, Copy, Link2, Plus,
  Clock, FileImage, Search, ChevronDown, AlertCircle,
  Loader2, CheckCircle2, CalendarPlus, CreditCard,
} from "lucide-react";

// ─── API ──────────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminView = "dashboard" | "reservas" | "horarios" | "spei";

interface Booking {
  id:              string;
  bookingRef:      string;
  firstName:       string;
  lastName:        string;
  email:           string;
  phone?:          string;
  classType:       string;
  date?:           string;
  time?:           string;
  beach?:          string;
  status:          string;
  totalAmount:     number;
  paymentMethod?:  string;
  instructor?:     string;
  numLessons?:     number;
  numParticipants?: number;
  createdAt:       string;
}

interface SpeiProof {
  id:         string;
  bookingRef: string;
  bookingId:  string;
  clientName: string;
  amount:     number;
  fileUrl?:   string;
  status:     string;
  createdAt:  string;
}

interface Slot {
  id:             string;
  date:           string;
  startTime:      string;
  classType:      string;
  instructor?:    string;
  availableSpots: number;
  maxCapacity:    number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_BOOKINGS: Booking[] = [
  { id:"b1", bookingRef:"SURF-2301", firstName:"Valentina", lastName:"Cruz",      email:"vale@email.com",    phone:"+52 954 100 2001", classType:"private",       date:"2026-03-25", time:"08:00", beach:"Carrizalillo", status:"confirmed",       totalAmount:1300, paymentMethod:"mercadopago", instructor:"Wilbert", numLessons:1,  numParticipants:1, createdAt:"2026-03-23T09:00:00Z" },
  { id:"b2", bookingRef:"SURF-2302", firstName:"Carlos",    lastName:"Mendoza",   email:"cmendoza@email.com",phone:"+52 954 200 3002", classType:"group",         date:"2026-03-25", time:"10:00", beach:"Carrizalillo", status:"pending_spei",    totalAmount:2000, paymentMethod:"spei",        instructor:"Ana",     numLessons:1,  numParticipants:2, createdAt:"2026-03-23T10:15:00Z" },
  { id:"b3", bookingRef:"SURF-2303", firstName:"Emma",      lastName:"Dupont",    email:"emma@email.com",    phone:"+33 6 00 11 22",   classType:"half_day_trip", date:"2026-03-26", time:"07:00", beach:"La Punta",     status:"confirmed",       totalAmount:2800, paymentMethod:"mercadopago", instructor:"Carlos",  numLessons:1,  numParticipants:1, createdAt:"2026-03-23T11:00:00Z" },
  { id:"b4", bookingRef:"SURF-2304", firstName:"Rodrigo",   lastName:"Vega",      email:"rvega@email.com",                             classType:"private",       date:"2026-03-27", time:"09:00", beach:"Carrizalillo", status:"pending_payment", totalAmount:2400, paymentMethod:"spei",        instructor:"Wilbert", numLessons:2,  numParticipants:1, createdAt:"2026-03-23T12:30:00Z" },
  { id:"b5", bookingRef:"SURF-2305", firstName:"Sofía",     lastName:"Ramírez",   email:"sofia@email.com",   phone:"+52 954 300 4003", classType:"full_day_trip", date:"2026-03-28", time:"07:00", beach:"La Punta",     status:"pending_spei",    totalAmount:5000, paymentMethod:"spei",        instructor:"Carlos",  numLessons:1,  numParticipants:1, createdAt:"2026-03-23T13:00:00Z" },
  { id:"b6", bookingRef:"SURF-2306", firstName:"Lucas",     lastName:"Torres",    email:"ltorres@email.com", phone:"+52 954 400 5004", classType:"private",       date:"2026-03-29", time:"11:00", beach:"Carrizalillo", status:"confirmed",       totalAmount:3300, paymentMethod:"mercadopago", instructor:"Wilbert", numLessons:3,  numParticipants:1, createdAt:"2026-03-23T14:00:00Z" },
];

const MOCK_PROOFS: SpeiProof[] = [
  { id:"sp1", bookingRef:"SURF-2302", bookingId:"b2", clientName:"Carlos Mendoza", amount:2000, status:"pending", createdAt:"2026-03-23T10:30:00Z" },
  { id:"sp2", bookingRef:"SURF-2305", bookingId:"b5", clientName:"Sofía Ramírez",  amount:5000, status:"pending", createdAt:"2026-03-23T13:15:00Z" },
];

const MOCK_SLOTS: Slot[] = [
  { id:"s1", date:"2026-03-25", startTime:"08:00", classType:"private",       instructor:"Wilbert", availableSpots:1, maxCapacity:1 },
  { id:"s2", date:"2026-03-25", startTime:"10:00", classType:"group",         instructor:"Ana",     availableSpots:2, maxCapacity:2 },
  { id:"s3", date:"2026-03-26", startTime:"07:00", classType:"half_day_trip", instructor:"Carlos",  availableSpots:3, maxCapacity:4 },
  { id:"s4", date:"2026-03-27", startTime:"09:00", classType:"private",       instructor:"Wilbert", availableSpots:1, maxCapacity:1 },
  { id:"s5", date:"2026-03-28", startTime:"07:00", classType:"full_day_trip", instructor:"Carlos",  availableSpots:2, maxCapacity:4 },
  { id:"s6", date:"2026-03-29", startTime:"11:00", classType:"private",       instructor:"Wilbert", availableSpots:1, maxCapacity:1 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CLASS_LABELS: Record<string, string> = {
  private:       "Clase Privada",
  group:         "Clase Grupal",
  half_day_trip: "Excursión Medio Día",
  full_day_trip: "Excursión Día Completo",
};

const STATUS_MAP: Record<string, { label: string; variant: "success" | "warning" | "error" | "default" }> = {
  confirmed:       { label: "Confirmado",       variant: "success"  },
  pending_spei:    { label: "SPEI Pendiente",   variant: "warning"  },
  pending_payment: { label: "Sin Pago",         variant: "warning"  },
  cancelled:       { label: "Cancelado",        variant: "error"    },
  rejected:        { label: "Rechazado",        variant: "error"    },
};

const today = new Date().toISOString().split("T")[0];

// ─── Component ────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();

  // ── Auth ───────────────────────────────────────────────────────────────
  const adminToken = localStorage.getItem("admin_token") ?? "";
  const adminName  = localStorage.getItem("admin_name")  ?? "Admin";
  const isDemo     = !API_URL || adminToken === "demo";

  useEffect(() => {
    // "undefined" o vacío = token inválido, limpiar y redirigir
    if (!adminToken || adminToken === "undefined" || adminToken === "null") {
      localStorage.removeItem("admin_token");
      navigate("/admin/login");
    }
  }, [adminToken, navigate]);

  // ── Navigation ─────────────────────────────────────────────────────────
  const [view,        setView]        = useState<AdminView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast,       setToast]       = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Data state ─────────────────────────────────────────────────────────
  const [bookings,   setBookings]   = useState<Booking[]>(MOCK_BOOKINGS);
  const [proofs,     setProofs]     = useState<SpeiProof[]>(MOCK_PROOFS);
  const [slots,      setSlots]      = useState<Slot[]>(() => {
    const saved: Slot[] = JSON.parse(localStorage.getItem("admin_slots") ?? "[]");
    return [...MOCK_SLOTS, ...saved.filter((s) => !MOCK_SLOTS.some((m) => m.id === s.id))];
  });
  const [isLoading,  setIsLoading]  = useState(false);

  // ── Auth fetch helper ──────────────────────────────────────────────────
  const authFetch = useCallback(async (path: string, opts: RequestInit = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
        ...(opts.headers as Record<string, string> ?? {}),
      },
    });
    if (res.status === 401) {
      localStorage.removeItem("admin_token");
      navigate("/admin/login");
      throw new Error("unauthorized");
    }
    return res;
  }, [adminToken, navigate]);

  // ── Fetch bookings ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isDemo) return;
    authFetch("/api/v1/admin/bookings")
      .then((r) => r.json())
      .then((raw) => {
        // Backend devuelve { ok, data: { bookings: [...] } }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list: any[] = raw?.data?.bookings ?? raw?.bookings ?? [];
        if (!list.length) return;
        // Mapear snake_case del backend → camelCase de la interfaz
        setBookings(list.map((b) => ({
          id:              b.id,
          bookingRef:      b.booking_ref   ?? b.bookingRef,
          firstName:       b.client?.first_name ?? b.firstName ?? "",
          lastName:        b.client?.last_name  ?? b.lastName  ?? "",
          email:           b.client?.email      ?? b.email     ?? "",
          phone:           b.client?.phone      ?? b.phone,
          classType:       b.class_type   ?? b.classType,
          date:            b.slot?.date   ?? b.date,
          time:            b.slot?.start_time ?? b.time,
          beach:           b.beach,
          status:          b.status,
          totalAmount:     b.total_amount ?? b.totalAmount ?? 0,
          paymentMethod:   b.payment_method ?? b.paymentMethod,
          instructor:      b.slot?.instructor?.name ?? b.instructor,
          numLessons:      b.num_lessons      ?? b.numLessons,
          numParticipants: b.num_participants  ?? b.numParticipants,
          createdAt:       b.created_at ?? b.createdAt,
        })));
      })
      .catch(() => {});
  }, [isDemo, authFetch]);

  // ── Fetch SPEI proofs ──────────────────────────────────────────────────
  useEffect(() => {
    if (isDemo) return;
    authFetch("/api/v1/admin/payments/spei/pending")
      .then((r) => r.json())
      .then((raw) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list: any[] = raw?.data ?? raw;
        if (!Array.isArray(list)) return;
        setProofs(list.map((p) => ({
          id:         p.proofId   ?? p.id,
          bookingRef: p.booking?.bookingRef  ?? p.bookingRef  ?? "",
          bookingId:  p.booking?.bookingId   ?? p.bookingId   ?? "",
          clientName: p.client?.name         ?? p.clientName  ?? "",
          amount:     p.payment?.amount      ?? p.booking?.totalAmount ?? p.amount ?? 0,
          fileUrl:    p.fileUrl  ?? p.file_url,
          status:     p.reviewStatus ?? p.status,
          createdAt:  p.uploadedAt   ?? p.createdAt ?? p.uploaded_at,
        })));
      })
      .catch(() => {});
  }, [isDemo, authFetch]);

  // ─────────────────────────────────────────────────────────────────────────
  // MODALS
  // ─────────────────────────────────────────────────────────────────────────
  const [detailBooking,  setDetailBooking]  = useState<Booking | null>(null);
  const [reviewProof,    setReviewProof]    = useState<SpeiProof | null>(null);
  const [rejectNotes,    setRejectNotes]    = useState("");
  const [payLinkBooking, setPayLinkBooking] = useState<Booking | null>(null);
  const [payLinkUrl,     setPayLinkUrl]     = useState<string | null>(null);
  const [payLinkLoading, setPayLinkLoading] = useState(false);
  const [copied,         setCopied]         = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // RESERVAS view state
  // ─────────────────────────────────────────────────────────────────────────
  const [search,         setSearch]         = useState("");
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterClass,    setFilterClass]    = useState("all");

  const filteredBookings = bookings.filter((b) => {
    const name = `${b.firstName} ${b.lastName} ${b.bookingRef}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (filterClass  !== "all" && b.classType !== filterClass) return false;
    return true;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // HORARIOS view state
  // ─────────────────────────────────────────────────────────────────────────
  const [slotDate,     setSlotDate]     = useState(today);
  const [newDate,      setNewDate]      = useState(today);
  const [newTime,      setNewTime]      = useState("09:00");
  const [newClass,     setNewClass]     = useState("private");
  const [newInstructor,setNewInstructor]= useState("");
  const [newCapacity,  setNewCapacity]  = useState("1");
  const [slotLoading,  setSlotLoading]  = useState(false);

  const daySlots = slots.filter((s) => s.date === slotDate);

  const fetchSlots = useCallback(async (date: string) => {
    if (isDemo) return;
    try {
      const r = await authFetch(`/api/v1/availability?date=${date}&class_type=private`);
      const data = await r.json();
      if (Array.isArray(data)) setSlots((prev) => [...prev.filter((s) => s.date !== date), ...data]);
    } catch {}
  }, [isDemo, authFetch]);

  useEffect(() => { fetchSlots(slotDate); }, [slotDate, fetchSlots]);

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  // Crear horario
  const handleCreateSlot = async () => {
    setSlotLoading(true);
    try {
      if (!isDemo) {
        const res = await authFetch("/api/v1/availability", {
          method: "POST",
          body: JSON.stringify({
            date:        newDate,
            start_time:  newTime,
            class_type:  newClass,
            max_capacity: parseInt(newCapacity),
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setSlots((prev) => [...prev, data]);
          showToast("Horario creado correctamente");
        } else {
          showToast(data.message ?? "Error al crear horario", "error");
        }
      } else {
        // Demo: agregar localmente y persistir en localStorage
        const newSlot: Slot = {
          id: `s-${Date.now()}`,
          date: newDate,
          startTime: newTime,
          classType: newClass,
          instructor: newInstructor || undefined,
          availableSpots: parseInt(newCapacity),
          maxCapacity: parseInt(newCapacity),
        };
        const saved: Slot[] = JSON.parse(localStorage.getItem("admin_slots") ?? "[]");
        localStorage.setItem("admin_slots", JSON.stringify([...saved, newSlot]));
        setSlots((prev) => [...prev, newSlot]);
        setSlotDate(newDate);
        showToast("Horario creado correctamente");
      }
    } catch {
      showToast("Error al crear horario", "error");
    } finally {
      setSlotLoading(false);
    }
  };

  // Aprobar SPEI
  const handleApprove = async (proof: SpeiProof) => {
    try {
      if (!isDemo) {
        const res = await authFetch(`/api/v1/admin/payments/spei/${proof.id}/approve`, { method: "POST" });
        if (!res.ok) { showToast("Error al aprobar", "error"); return; }
      }
      setProofs((prev) => prev.filter((p) => p.id !== proof.id));
      setBookings((prev) => prev.map((b) => b.id === proof.bookingId ? { ...b, status: "confirmed" } : b));
      setReviewProof(null);
      showToast(`Comprobante de ${proof.clientName} aprobado ✓`);
    } catch { showToast("Error al aprobar", "error"); }
  };

  // Rechazar SPEI
  const handleReject = async (proof: SpeiProof) => {
    if (!rejectNotes.trim()) { showToast("Escribe una razón para el rechazo", "error"); return; }
    try {
      if (!isDemo) {
        const res = await authFetch(`/api/v1/admin/payments/spei/${proof.id}/reject`, {
          method: "POST",
          body: JSON.stringify({ notes: rejectNotes }),
        });
        if (!res.ok) { showToast("Error al rechazar", "error"); return; }
      }
      setProofs((prev) => prev.filter((p) => p.id !== proof.id));
      setBookings((prev) => prev.map((b) => b.id === proof.bookingId ? { ...b, status: "rejected" } : b));
      setReviewProof(null);
      setRejectNotes("");
      showToast(`Comprobante rechazado y cliente notificado`);
    } catch { showToast("Error al rechazar", "error"); }
  };

  // Generar link de pago
  const handleGenerateLink = async (booking: Booking) => {
    setPayLinkBooking(booking);
    setPayLinkUrl(null);
    setPayLinkLoading(true);
    try {
      if (!isDemo) {
        const res = await authFetch(`/api/v1/admin/bookings/${booking.id}/payment-link`, {
          method: "POST",
          body: JSON.stringify({ expires_in_hours: 48 }),
        });
        const data = await res.json();
        if (res.ok) {
          setPayLinkUrl(data.url ?? data.paymentLink ?? JSON.stringify(data));
        } else {
          showToast(data.message ?? "Error al generar link", "error");
        }
      } else {
        // Demo
        await new Promise((r) => setTimeout(r, 900));
        const token = `demo-token-${booking.bookingRef}-${Date.now()}`;
        setPayLinkUrl(`${window.location.origin}/pay/${token}`);
      }
    } catch {
      showToast("Error al generar link", "error");
    } finally {
      setPayLinkLoading(false);
    }
  };

  const copyLink = () => {
    if (!payLinkUrl) return;
    navigator.clipboard.writeText(payLinkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    navigate("/admin/login");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // METRICS
  // ─────────────────────────────────────────────────────────────────────────
  const totalRevenue  = bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.totalAmount, 0);
  const pendingCount  = proofs.length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  const metrics = [
    { icon: CalendarDays, label: "Total reservas",    value: String(bookings.length), color: "text-primary" },
    { icon: CheckCircle2, label: "Confirmadas",        value: String(confirmedCount),  color: "text-accent"  },
    { icon: Clock,        label: "Comprobantes SPEI",  value: String(pendingCount),    color: "text-warning" },
    { icon: DollarSign,   label: "Ingresos confirmados", value: `$${totalRevenue.toLocaleString("es-MX")}`, color: "text-primary" },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // SIDEBAR ITEMS
  // ─────────────────────────────────────────────────────────────────────────
  const navItems: { key: AdminView; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { key: "dashboard", label: "Dashboard",     icon: LayoutDashboard },
    { key: "reservas",  label: "Reservas",      icon: CalendarDays,   badge: bookings.length },
    { key: "horarios",  label: "Horarios",      icon: CalendarPlus },
    { key: "spei",      label: "Comprobantes",  icon: CreditCard,     badge: pendingCount || undefined },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // SELECT STYLE (reused in forms)
  // ─────────────────────────────────────────────────────────────────────────
  const selectClass = "w-full rounded-xl border border-border bg-card text-card-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
  const inputClass  = "w-full rounded-xl border border-border bg-card text-card-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-theme min-h-screen bg-background flex">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ${sidebarOpen ? "w-60" : "w-0 lg:w-16"} overflow-hidden flex-shrink-0`}
        style={{ backgroundColor: "hsl(var(--admin-sidebar))" }}
      >
        <div className="flex items-center gap-2 px-5 py-5 min-w-[240px]">
          <Waves className="text-primary flex-shrink-0" size={22} />
          {sidebarOpen && <span className="font-brush text-lg text-white">Soul Surf</span>}
        </div>

        <nav className="flex-1 px-3 mt-2 min-w-[240px] space-y-1">
          {navItems.map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                view === key
                  ? "bg-primary/20 text-primary"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={17} className="flex-shrink-0" />
              {sidebarOpen && (
                <span className="flex-1 text-left">{label}</span>
              )}
              {sidebarOpen && badge !== undefined && badge > 0 && (
                <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {isDemo && sidebarOpen && (
          <div className="mx-3 mb-2 px-3 py-2 rounded-xl bg-warning/10 text-warning text-xs">
            Modo demo — sin backend
          </div>
        )}

        <div className="px-3 pb-5 min-w-[240px]">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-white/30 hover:text-white/60 transition-colors"
          >
            <LogOut size={17} />
            {sidebarOpen && "Cerrar sesión"}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-3.5 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground"
          >
            <LayoutDashboard size={18} />
          </button>
          <h1 className="font-bold text-foreground text-base flex-1">
            {{ dashboard: "Dashboard", reservas: "Reservas", horarios: "Horarios", spei: "Comprobantes SPEI" }[view]}
          </h1>
          <div className="flex items-center gap-3">
            {toast && (
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full animate-reveal-scale ${
                toast.type === "success" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
              }`}>
                {toast.msg}
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
              {adminName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">

          {/* ════════════════════════════════════════════════════
              VIEW: DASHBOARD
          ════════════════════════════════════════════════════ */}
          {view === "dashboard" && (
            <div className="space-y-6">
              {/* Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m) => (
                  <SurfCard key={m.label} className="!shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-card-foreground/50 text-xs mb-1">{m.label}</p>
                        <p className="text-card-foreground font-extrabold text-2xl tabular-nums">{m.value}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-card-foreground/[0.04] flex items-center justify-center">
                        <m.icon size={20} className={m.color} />
                      </div>
                    </div>
                  </SurfCard>
                ))}
              </div>

              {/* Recent bookings */}
              <SurfCard className="!p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-bold text-card-foreground">Últimas reservas</h2>
                  <button onClick={() => setView("reservas")} className="text-xs text-primary hover:underline">Ver todas →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Ref", "Cliente", "Clase", "Fecha", "Monto", "Estado"].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-card-foreground/40 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((b) => {
                        const s = STATUS_MAP[b.status] ?? { label: b.status, variant: "default" as const };
                        return (
                          <tr key={b.id} className="border-b border-border/40 hover:bg-card-foreground/[0.02]">
                            <td className="px-5 py-3 text-sm font-medium text-card-foreground tabular-nums">{b.bookingRef}</td>
                            <td className="px-5 py-3 text-sm text-card-foreground">{b.firstName} {b.lastName}</td>
                            <td className="px-5 py-3 text-sm text-card-foreground/60">{CLASS_LABELS[b.classType] ?? b.classType}</td>
                            <td className="px-5 py-3 text-sm text-card-foreground/60">{b.date ?? "—"}</td>
                            <td className="px-5 py-3 text-sm font-medium tabular-nums">${b.totalAmount.toLocaleString("es-MX")}</td>
                            <td className="px-5 py-3"><SurfBadge variant={s.variant}>{s.label}</SurfBadge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </SurfCard>

              {/* SPEI pending alert */}
              {pendingCount > 0 && (
                <div className="flex items-center gap-3 rounded-2xl border border-warning/20 bg-warning/5 px-5 py-4">
                  <AlertCircle size={18} className="text-warning flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-warning text-sm font-semibold">
                      {pendingCount} comprobante{pendingCount > 1 ? "s" : ""} SPEI esperando revisión
                    </p>
                  </div>
                  <button onClick={() => setView("spei")} className="text-xs text-warning font-semibold hover:underline">
                    Revisar →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              VIEW: RESERVAS
          ════════════════════════════════════════════════════ */}
          {view === "reservas" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-card-foreground/40" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o ref…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <div className="relative">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${selectClass} pr-8 appearance-none`}>
                    <option value="all">Todos los estados</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="pending_spei">SPEI Pendiente</option>
                    <option value="pending_payment">Sin Pago</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-card-foreground/40 pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className={`${selectClass} pr-8 appearance-none`}>
                    <option value="all">Todos los tipos</option>
                    <option value="private">Clase Privada</option>
                    <option value="group">Clase Grupal</option>
                    <option value="half_day_trip">Excursión Medio Día</option>
                    <option value="full_day_trip">Excursión Día Completo</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-card-foreground/40 pointer-events-none" />
                </div>
              </div>

              <SurfCard className="!p-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-card-foreground/40 text-sm">{filteredBookings.length} resultado{filteredBookings.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Ref", "Cliente", "Clase", "Fecha / Hora", "Monto", "Pago", "Estado", ""].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-card-foreground/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => {
                        const s = STATUS_MAP[b.status] ?? { label: b.status, variant: "default" as const };
                        return (
                          <tr key={b.id} className="border-b border-border/40 hover:bg-card-foreground/[0.02]">
                            <td className="px-5 py-3 text-sm font-medium text-card-foreground tabular-nums whitespace-nowrap">{b.bookingRef}</td>
                            <td className="px-5 py-3 text-sm">
                              <p className="text-card-foreground">{b.firstName} {b.lastName}</p>
                              <p className="text-card-foreground/40 text-xs">{b.email}</p>
                            </td>
                            <td className="px-5 py-3 text-sm text-card-foreground/60 whitespace-nowrap">{CLASS_LABELS[b.classType] ?? b.classType}</td>
                            <td className="px-5 py-3 text-sm text-card-foreground/60 whitespace-nowrap">{b.date ?? "—"} {b.time ? `${b.time} hrs` : ""}</td>
                            <td className="px-5 py-3 text-sm font-medium tabular-nums whitespace-nowrap">${b.totalAmount.toLocaleString("es-MX")}</td>
                            <td className="px-5 py-3 text-xs text-card-foreground/50 capitalize">{b.paymentMethod ?? "—"}</td>
                            <td className="px-5 py-3"><SurfBadge variant={s.variant}>{s.label}</SurfBadge></td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setDetailBooking(b)}
                                  className="p-1.5 rounded-lg text-card-foreground/40 hover:text-primary hover:bg-primary/5 transition-colors"
                                  title="Ver detalle"
                                >
                                  <Eye size={15} />
                                </button>
                                {(b.status === "pending_payment" || b.status === "pending_spei") && (
                                  <button
                                    onClick={() => handleGenerateLink(b)}
                                    className="p-1.5 rounded-lg text-card-foreground/40 hover:text-accent hover:bg-accent/5 transition-colors"
                                    title="Generar link de pago"
                                  >
                                    <Link2 size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </SurfCard>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              VIEW: HORARIOS
          ════════════════════════════════════════════════════ */}
          {view === "horarios" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Crear horario */}
              <SurfCard>
                <h2 className="font-bold text-card-foreground mb-5 flex items-center gap-2">
                  <Plus size={17} className="text-primary" /> Crear Nuevo Horario
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block">Fecha</label>
                    <input type="date" value={newDate} min={today} onChange={(e) => setNewDate(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block">Hora de inicio</label>
                    <div className="relative">
                      <select value={newTime} onChange={(e) => setNewTime(e.target.value)} className={`${selectClass} pr-8 appearance-none`}>
                        {["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"].map((t) => (
                          <option key={t} value={t}>{t} hrs</option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-card-foreground/40 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block">Tipo de clase</label>
                    <div className="relative">
                      <select value={newClass} onChange={(e) => { setNewClass(e.target.value); setNewCapacity(e.target.value === "private" ? "1" : e.target.value === "group" ? "2" : "4"); }} className={`${selectClass} pr-8 appearance-none`}>
                        <option value="private">Clase Privada (máx 1)</option>
                        <option value="group">Clase Grupal (máx 2)</option>
                        <option value="half_day_trip">Excursión Medio Día (máx 4)</option>
                        <option value="full_day_trip">Excursión Día Completo (máx 4)</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-card-foreground/40 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block">Instructor (opcional)</label>
                    <input type="text" placeholder="Ej. Wilbert" value={newInstructor} onChange={(e) => setNewInstructor(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block">Capacidad máxima</label>
                    <input type="number" min={1} max={4} value={newCapacity} onChange={(e) => setNewCapacity(e.target.value)} className={inputClass} />
                  </div>
                  <Button variant="hero" size="lg" className="w-full" onClick={handleCreateSlot} disabled={slotLoading}>
                    {slotLoading ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Creando…</span> : <span className="flex items-center gap-2"><Plus size={15} /> Crear Horario</span>}
                  </Button>
                </div>
              </SurfCard>

              {/* Ver horarios del día */}
              <div className="space-y-4">
                <SurfCard className="!py-4">
                  <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block">Ver horarios del día</label>
                  <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} className={inputClass} />
                </SurfCard>

                {daySlots.length === 0 ? (
                  <SurfCard>
                    <p className="text-card-foreground/40 text-sm text-center py-4">Sin horarios para este día</p>
                  </SurfCard>
                ) : (
                  <div className="space-y-3">
                    {daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((slot) => (
                      <SurfCard key={slot.id} className="!py-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <Clock size={16} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-card-foreground font-bold tabular-nums">{slot.startTime} hrs</p>
                              <p className="text-card-foreground/40 text-xs">{CLASS_LABELS[slot.classType]} {slot.instructor ? `· ${slot.instructor}` : ""}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            slot.availableSpots === 0
                              ? "bg-destructive/10 text-destructive"
                              : "bg-accent/10 text-accent"
                          }`}>
                            {slot.availableSpots}/{slot.maxCapacity} lugares
                          </span>
                        </div>
                      </SurfCard>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              VIEW: COMPROBANTES SPEI
          ════════════════════════════════════════════════════ */}
          {view === "spei" && (
            <div className="space-y-4">
              {proofs.length === 0 ? (
                <SurfCard className="text-center py-12">
                  <CheckCircle2 size={40} className="text-accent mx-auto mb-3" />
                  <p className="text-card-foreground font-semibold">Sin comprobantes pendientes</p>
                  <p className="text-card-foreground/40 text-sm mt-1">Todos los comprobantes han sido revisados</p>
                </SurfCard>
              ) : (
                proofs.map((proof) => (
                  <SurfCard key={proof.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                          <FileImage size={22} className="text-warning" />
                        </div>
                        <div>
                          <p className="text-card-foreground font-semibold">{proof.clientName}</p>
                          <p className="text-card-foreground/50 text-xs">{proof.bookingRef} · ${proof.amount.toLocaleString("es-MX")} MXN</p>
                          <p className="text-card-foreground/30 text-xs mt-0.5">
                            Subido: {new Date(proof.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-primary flex-shrink-0" onClick={() => { setReviewProof(proof); setRejectNotes(""); }}>
                        <Eye size={14} /> Revisar
                      </Button>
                    </div>
                  </SurfCard>
                ))
              )}
            </div>
          )}

        </div>
      </main>

      {/* ════════════════════════════════════════════════════════════════
          MODAL: Detalle de reserva
      ════════════════════════════════════════════════════════════════ */}
      {detailBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setDetailBooking(null)}>
          <SurfCard className="max-w-lg w-full animate-reveal-scale relative max-h-[90vh] overflow-y-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <button onClick={() => setDetailBooking(null)} className="absolute top-4 right-4 text-card-foreground/30 hover:text-card-foreground">
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <SurfBadge variant={(STATUS_MAP[detailBooking.status] ?? { variant: "default" }).variant}>
                {(STATUS_MAP[detailBooking.status] ?? { label: detailBooking.status }).label}
              </SurfBadge>
              <span className="text-card-foreground/40 text-sm tabular-nums">{detailBooking.bookingRef}</span>
            </div>

            <h2 className="text-card-foreground font-bold text-xl mb-5">{detailBooking.firstName} {detailBooking.lastName}</h2>

            <div className="space-y-2 text-sm">
              {[
                ["Email",       detailBooking.email],
                ["Teléfono",    detailBooking.phone ?? "—"],
                ["Clase",       CLASS_LABELS[detailBooking.classType] ?? detailBooking.classType],
                ["Fecha",       detailBooking.date ?? "—"],
                ["Hora",        detailBooking.time ? `${detailBooking.time} hrs` : "—"],
                ["Playa",       detailBooking.beach ?? "—"],
                ["Instructor",  detailBooking.instructor ?? "—"],
                ["Clases",      detailBooking.numLessons ?? "—"],
                ["Personas",    detailBooking.numParticipants ?? "—"],
                ["Monto",       `$${detailBooking.totalAmount.toLocaleString("es-MX")} MXN`],
                ["Método pago", detailBooking.paymentMethod ?? "—"],
                ["Creado",      new Date(detailBooking.createdAt).toLocaleString("es-MX")],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between rounded-xl bg-card-foreground/[0.03] px-4 py-2.5">
                  <span className="text-card-foreground/50">{label}</span>
                  <span className="text-card-foreground font-medium text-right">{String(value)}</span>
                </div>
              ))}
            </div>

            {(detailBooking.status === "pending_payment" || detailBooking.status === "pending_spei") && (
              <Button variant="hero" size="lg" className="w-full mt-5 gap-2" onClick={() => { setDetailBooking(null); handleGenerateLink(detailBooking); }}>
                <Link2 size={16} /> Generar Link de Pago
              </Button>
            )}
          </SurfCard>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: Revisar comprobante SPEI
      ════════════════════════════════════════════════════════════════ */}
      {reviewProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setReviewProof(null)}>
          <SurfCard className="max-w-md w-full animate-reveal-scale relative" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <button onClick={() => setReviewProof(null)} className="absolute top-4 right-4 text-card-foreground/30 hover:text-card-foreground">
              <X size={20} />
            </button>

            <h2 className="text-card-foreground font-bold text-lg mb-1">Revisar Comprobante</h2>
            <p className="text-card-foreground/50 text-sm mb-5">{reviewProof.bookingRef} — {reviewProof.clientName}</p>

            <div className="rounded-xl bg-card-foreground/[0.04] border border-border p-8 flex items-center justify-center mb-4">
              {reviewProof.fileUrl ? (
                <div className="flex flex-col items-center gap-2 w-full">
                  <a href={reviewProof.fileUrl} target="_blank" rel="noopener noreferrer">
                    <img src={reviewProof.fileUrl} alt="Comprobante" className="max-h-64 object-contain rounded-lg hover:opacity-90 transition-opacity" />
                  </a>
                  <a href={reviewProof.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">
                    Abrir en pantalla completa →
                  </a>
                </div>
              ) : (
                <div className="text-center">
                  <FileImage size={40} className="text-card-foreground/20 mx-auto mb-2" />
                  <p className="text-card-foreground/40 text-sm">Sin archivo adjunto</p>
                </div>
              )}
            </div>

            <p className="text-card-foreground/60 text-sm text-center mb-4">
              Monto esperado: <span className="font-bold text-card-foreground">${reviewProof.amount.toLocaleString("es-MX")} MXN</span>
            </p>

            {/* Notas de rechazo */}
            <div className="mb-4">
              <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block">
                Razón de rechazo <span className="text-card-foreground/30">(requerido solo si rechazas)</span>
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Ej: El monto no coincide, transferencia de diferente cuenta…"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive"
                onClick={() => handleReject(reviewProof)}
              >
                <X size={16} /> Rechazar
              </Button>
              <Button
                variant="hero"
                size="lg"
                className="flex-1 gap-2"
                onClick={() => handleApprove(reviewProof)}
              >
                <Check size={16} /> Aprobar
              </Button>
            </div>
          </SurfCard>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: Link de pago generado
      ════════════════════════════════════════════════════════════════ */}
      {payLinkBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => { setPayLinkBooking(null); setPayLinkUrl(null); }}>
          <SurfCard className="max-w-md w-full animate-reveal-scale relative" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <button onClick={() => { setPayLinkBooking(null); setPayLinkUrl(null); }} className="absolute top-4 right-4 text-card-foreground/30 hover:text-card-foreground">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Link2 size={18} className="text-primary" />
              </div>
              <div>
                <h2 className="text-card-foreground font-bold">Link de Pago</h2>
                <p className="text-card-foreground/50 text-xs">{payLinkBooking.bookingRef} — {payLinkBooking.firstName} {payLinkBooking.lastName}</p>
              </div>
            </div>

            {payLinkLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            ) : payLinkUrl ? (
              <>
                <div className="rounded-xl bg-card-foreground/[0.04] border border-border px-4 py-3 mb-4 break-all text-sm text-card-foreground/70 font-mono">
                  {payLinkUrl}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1 gap-2" onClick={copyLink}>
                    {copied ? <><Check size={15} className="text-accent" /> Copiado</> : <><Copy size={15} /> Copiar link</>}
                  </Button>
                  <a
                    href={`https://wa.me/529541483342?text=${encodeURIComponent(`Hola ${payLinkBooking.firstName}, tu link de pago para la reserva ${payLinkBooking.bookingRef} es: ${payLinkUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="hero" size="lg" className="w-full gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Enviar por WhatsApp
                    </Button>
                  </a>
                </div>
                <p className="text-card-foreground/30 text-xs text-center mt-3">El link expira en 48 horas</p>
              </>
            ) : null}
          </SurfCard>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
