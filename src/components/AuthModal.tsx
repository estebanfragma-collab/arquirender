import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Meta Pixel (fbq) inyectado por el script del pixel; opcional.
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

type Modo = "login" | "registro" | "recuperar";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  /** Vista con la que abre el modal. Por defecto, login. */
  modoInicial?: Modo;
}

/** Segundos que el botón de recuperación queda bloqueado tras un envío. */
const ESPERA_REENVIO = 30;

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

const AuthModal = ({ onClose, onSuccess, modoInicial = "login" }: AuthModalProps) => {
  const [modo, setModo] = useState<Modo>(modoInicial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [espera, setEspera] = useState(0);

  const esLogin = modo === "login";
  const esRegistro = modo === "registro";
  const esRecuperar = modo === "recuperar";

  // Cuenta atrás del bloqueo de reenvío.
  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const irA = (siguiente: Modo) => {
    setModo(siguiente);
    setError("");
    setAviso("");
    setVerPassword(false);
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cargando) return;

    setError("");
    setAviso("");

    // --- Recuperación de contraseña: solo pide correo ---
    if (esRecuperar) {
      if (espera > 0) return;
      if (!email.trim()) {
        setError("Escribe tu correo.");
        return;
      }
      setCargando(true);
      try {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (authError) {
          setError(traducirError(authError.message));
          return;
        }
        setAviso("Te enviamos un enlace a tu correo. Revisa también la carpeta de spam.");
        setEspera(ESPERA_REENVIO);
      } catch {
        setError("Ocurrió un error inesperado. Intenta de nuevo.");
      } finally {
        setCargando(false);
      }
      return;
    }

    // --- Login y registro ---
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
        // Registro nuevo exitoso: evento de conversión de Meta. Solo en signUp,
        // nunca en inicios de sesión ni en recuperación de contraseña: esta rama
        // es exclusiva de registro y se alcanza únicamente si signUp no dio error.
        if (typeof window !== "undefined" && window.fbq) {
          window.fbq("track", "CompleteRegistration");
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

  const titulo = esRecuperar ? "Recuperar contraseña" : esLogin ? "Iniciar sesión" : "Crear cuenta";
  const textoBoton = cargando
    ? "Procesando..."
    : esRecuperar
      ? espera > 0
        ? `Reenviar en ${espera}s`
        : "Enviar enlace"
      : esLogin
        ? "Iniciar sesión"
        : "Crear cuenta";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#EA580C]">ArquiRender</div>
            <h2 className="m-0 mt-1 text-xl font-black text-foreground">{titulo}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full px-2 text-lg font-bold text-muted-foreground transition hover:text-foreground">✕</button>
        </div>

        {esRecuperar && (
          <p className="mb-3 text-xs text-muted-foreground">
            Escribe tu correo y te enviamos un enlace para crear una contraseña nueva.
          </p>
        )}

        <form onSubmit={enviar} className="space-y-3">
          <input type="email" autoComplete="email" placeholder="tu@correo.com" className={claseInput} value={email} onChange={(e) => setEmail(e.target.value)} />

          {!esRecuperar && (
            <div className="relative">
              <input
                type={verPassword ? "text" : "password"}
                autoComplete={esLogin ? "current-password" : "new-password"}
                placeholder="Contraseña"
                className={`${claseInput} pr-12`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-2.5 text-muted-foreground transition hover:text-[#EA580C]"
              >
                {verPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          )}

          {esLogin && (
            <div className="text-right">
              <button type="button" onClick={() => irA("recuperar")} className="text-xs font-bold text-muted-foreground transition hover:text-[#EA580C] hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {error && <p className="text-sm font-bold text-destructive">{error}</p>}
          {aviso && <p className="text-sm font-bold text-[#EA580C]">{aviso}</p>}

          <button type="submit" disabled={cargando || (esRecuperar && espera > 0)} className="w-full rounded-full bg-[#EA580C] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#c2470a] disabled:cursor-not-allowed disabled:opacity-60">
            {textoBoton}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          {esRecuperar ? (
            <button type="button" onClick={() => irA("login")} className="font-extrabold text-[#EA580C] transition hover:underline">
              ← Volver a iniciar sesión
            </button>
          ) : (
            <>
              {esLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button type="button" onClick={() => irA(esLogin ? "registro" : "login")} className="font-extrabold text-[#EA580C] transition hover:underline">
                {esLogin ? "Crear cuenta" : "Iniciar sesión"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
