import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Página de callback del flujo de recuperación de contraseña de Supabase Auth.
 *
 * El cliente tiene detectSessionInUrl activo (default), así que al cargar
 * procesa el enlace del correo y emite PASSWORD_RECOVERY con una sesión
 * temporal. Con esa sesión se puede llamar a updateUser({ password }).
 *
 * Estados posibles:
 *  - verificando: aún no sabemos si el enlace es válido
 *  - listo:       hay sesión de recuperación, se puede fijar la contraseña
 *  - invalido:    enlace caducado, ya usado o abierto sin token
 *  - guardado:    contraseña actualizada
 */
type Estado = "verificando" | "listo" | "invalido" | "guardado";

/** Margen para que el cliente procese el token del enlace antes de rendirse. */
const MS_ESPERA_TOKEN = 2500;

const MIN_PASSWORD = 6;

const leerErrorDeUrl = () => {
  if (typeof window === "undefined") return "";
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  return hash.get("error_description") || query.get("error_description") || "";
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>("verificando");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [motivoInvalido, setMotivoInvalido] = useState("");

  useEffect(() => {
    // Enlace caducado o ya usado: Supabase lo devuelve en el hash de la URL.
    const errorUrl = leerErrorDeUrl();
    if (errorUrl) {
      setMotivoInvalido(errorUrl);
      setEstado("invalido");
      return;
    }

    let vivo = true;

    const { data: sub } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (!vivo) return;
      if (evento === "PASSWORD_RECOVERY" || sesion) setEstado("listo");
    });

    // Puede que el hash ya se procesara antes de montar el componente.
    void supabase.auth.getSession().then(({ data }) => {
      if (!vivo) return;
      if (data.session) setEstado("listo");
    });

    // Si pasado el margen seguimos sin sesión, el enlace no sirve.
    const t = setTimeout(() => {
      if (!vivo) return;
      setEstado((actual) => (actual === "verificando" ? "invalido" : actual));
    }, MS_ESPERA_TOKEN);

    return () => {
      vivo = false;
      clearTimeout(t);
      sub.subscription.unsubscribe();
    };
  }, []);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cargando) return;
    setError("");

    if (password.length < MIN_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) {
        const m = authError.message.toLowerCase();
        if (m.includes("session") || m.includes("jwt") || m.includes("expired")) {
          setMotivoInvalido("Tu enlace de recuperación caducó mientras completabas el formulario.");
          setEstado("invalido");
          return;
        }
        setError(authError.message);
        return;
      }
      setEstado("guardado");
    } catch {
      setError("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const claseInput = "w-full rounded-full border border-[hsl(var(--input-border))] bg-input px-4 py-3 text-sm text-foreground outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/30";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-card p-6 shadow-2xl">
        <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#EA580C]">ArquiRender</div>

        {estado === "verificando" && (
          <>
            <h1 className="m-0 mt-1 text-xl font-black text-foreground">Comprobando el enlace…</h1>
            <p className="mt-3 text-sm text-muted-foreground">Un momento, estamos validando tu enlace de recuperación.</p>
          </>
        )}

        {estado === "invalido" && (
          <>
            <h1 className="m-0 mt-1 text-xl font-black text-foreground">Este enlace ya no sirve</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Los enlaces de recuperación caducan y solo se pueden usar una vez.
              {motivoInvalido && (
                <span className="mt-2 block text-xs text-muted-foreground/80">Detalle: {motivoInvalido}</span>
              )}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Pide uno nuevo desde “¿Olvidaste tu contraseña?” en la pantalla de inicio de sesión.
            </p>
            <Link
              to="/app?login=1"
              className="mt-5 block w-full rounded-full bg-[#EA580C] px-4 py-3 text-center text-sm font-extrabold text-white transition hover:bg-[#c2470a]"
            >
              Pedir otro correo
            </Link>
          </>
        )}

        {estado === "listo" && (
          <>
            <h1 className="m-0 mt-1 text-xl font-black text-foreground">Nueva contraseña</h1>
            <p className="mt-2 text-xs text-muted-foreground">Elige una contraseña de al menos {MIN_PASSWORD} caracteres.</p>

            <form onSubmit={guardar} className="mt-4 space-y-3">
              <div className="relative">
                <input
                  type={verPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Nueva contraseña"
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

              <input
                type={verPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                className={claseInput}
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
              />

              {error && <p className="text-sm font-bold text-destructive">{error}</p>}

              <button type="submit" disabled={cargando} className="w-full rounded-full bg-[#EA580C] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#c2470a] disabled:cursor-not-allowed disabled:opacity-60">
                {cargando ? "Guardando..." : "Guardar contraseña"}
              </button>
            </form>
          </>
        )}

        {estado === "guardado" && (
          <>
            <h1 className="m-0 mt-1 text-xl font-black text-foreground">Contraseña actualizada</h1>
            <p className="mt-3 text-sm text-muted-foreground">Ya puedes entrar con tu contraseña nueva.</p>
            <button
              type="button"
              onClick={() => navigate("/app")}
              className="mt-5 w-full rounded-full bg-[#EA580C] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#c2470a]"
            >
              Ir a ArquiRender
            </button>
          </>
        )}
      </div>
    </main>
  );
};

export default ResetPassword;
