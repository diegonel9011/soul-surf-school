import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SurfCard from "@/components/SurfCard";
import SurfInput from "@/components/SurfInput";
import { Mail, Lock, AlertCircle, Waves } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (API_URL) {
        // ── Auth real con backend ───────────────────────────────
        const res  = await fetch(`${API_URL}/api/v1/admin/auth/login`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message ?? data.data?.message ?? "Credenciales incorrectas.");
          return;
        }

        // El backend envuelve la respuesta en { ok, data: { token, admin } }
        const payload = data.data ?? data;
        localStorage.setItem("admin_token", payload.token);
        localStorage.setItem("admin_name",  payload.admin?.name ?? "Admin");
        navigate("/admin/dashboard");
        return;
      }
    } catch {
      // Backend offline → caer a modo demo
    }

    // ── Modo demo (sin backend) ─────────────────────────────────
    await new Promise((r) => setTimeout(r, 800));
    if (email === "admin@soulsurfschool.mx" && password === "admin") {
      localStorage.setItem("admin_token", "demo");
      localStorage.setItem("admin_name",  "Admin Demo");
      navigate("/admin/dashboard");
    } else {
      setError("Credenciales incorrectas. En demo usa admin@soulsurf.mx / admin");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SurfCard className="max-w-sm w-full animate-reveal-scale">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Waves className="text-primary" size={28} />
          <span className="font-brush text-2xl text-card-foreground">Soul Surf</span>
        </div>

        <h1 className="text-card-foreground font-bold text-lg text-center mb-1">Panel Admin</h1>
        <p className="text-card-foreground/50 text-sm text-center mb-6">Ingresa tus credenciales</p>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 mb-5 animate-reveal-up">
            <AlertCircle size={16} className="text-destructive flex-shrink-0" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block">Email</label>
            <SurfInput
              icon={<Mail size={16} />}
              type="email"
              placeholder="admin@soulsurfschool.mx"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error}
            />
          </div>
          <div>
            <label className="text-card-foreground/60 text-xs font-medium mb-1.5 block">Contraseña</label>
            <SurfInput
              icon={<Lock size={16} />}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
            />
          </div>
          <Button variant="hero" size="lg" className="w-full" disabled={loading || !email || !password}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <p className="text-[11px] text-card-foreground/30 text-center mt-5">
          Demo: admin@soulsurfschool.mx / admin
        </p>
      </SurfCard>
    </div>
  );
};

export default AdminLoginPage;
