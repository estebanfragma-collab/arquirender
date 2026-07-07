import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const traducirError = (mensaje: string) => {
  const m = mensaje.toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("user already")) return "Este correo ya está registrado. Inicia sesión.";
  if (m.includes("password should be at least")) return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("invalid email") || m.includes("unable to validate email")) return "El correo no es válido.";
  if (m.includes("email not confirmed")) return "Debes confirmar tu correo antes de iniciar sesión.";
  if (m.includes("rate limit")) return "Demasiados intentos. Espera un momento e intenta de nuevo.";
  return mensaje;
};

const AuthModal = ({ onClose, onSuccess }: AuthModalProps) => {
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const esLogin = modo === "login";

  const alternarModo = () => {
    setModo(esLogin ? "registro" : "login");
    setError("");
    setAviso("");
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cargando) return;

    setError("");
    setAviso("");

    if (!email.trim() || !password) {
      setError("Completa correo y contraseña.");
      return;
    }

    setCargando(true);
    try {
      if (esLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) {
          setError(traducirError(authError.message));
          return;
        }
        onSuccess();
      } else {
        const { data, error: authError } = await supabase.auth.signUp({ email: email.trim(), password });
        if (authError) {
          setError(traducirError(authError.message));
          return;
        }
        if (!data.session) {
          setAviso("Cuenta creada. Revisa tu correo para confirmar la cuenta antes de continuar.");
          return;
        }
        onSuccess();
      }
    } catch {
      setError("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const claseInput = "w-full rounded-full border border-[hsl(var(--input-border))] bg-input px-4 py-3 text-sm text-foreground outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#EA580C]">ArquiRender</div>
            <h2 className="m-0 mt-1 text-xl font-black text-foreground">{esLogin ? "Iniciar sesión" : "Crear cuenta"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full px-2 text-lg font-bold text-muted-foreground transition hover:text-foreground">✕</button>
        </div>

        <form onSubmit={enviar} className="space-y-3">
          <input type="email" autoComplete="email" placeholder="tu@correo.com" className={claseInput} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" autoComplete={esLogin ? "current-password" : "new-password"} placeholder="Contraseña" className={claseInput} value={password} onChange={(e) => setPassword(e.target.value)} />

          {error && <p className="text-sm font-bold text-destructive">{error}</p>}
          {aviso && <p className="text-sm font-bold text-[#EA580C]">{aviso}</p>}

          <button type="submit" disabled={cargando} className="w-full rounded-full bg-[#EA580C] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#c2470a] disabled:cursor-not-allowed disabled:opacity-60">
            {cargando ? "Procesando..." : esLogin ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          {esLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button type="button" onClick={alternarModo} className="font-extrabold text-[#EA580C] transition hover:underline">
            {esLogin ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
