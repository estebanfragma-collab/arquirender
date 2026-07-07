import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RenderRow {
  id: string;
  imagen_generada_url: string;
  imagen_original_url: string | null;
  prompt: string | null;
  estilo: string | null;
  created_at: string;
}

interface HistorialRendersProps {
  userId: string;
  refreshSignal: number;
}

// Fecha amigable: "hace 2 horas" para lo reciente, "7 jul" para lo antiguo.
const fechaAmigable = (iso: string): string => {
  const fecha = new Date(iso);
  const segs = Math.round((Date.now() - fecha.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  if (segs < 60) return "hace un momento";
  const mins = Math.round(segs / 60);
  if (mins < 60) return rtf.format(-mins, "minute");
  const horas = Math.round(mins / 60);
  if (horas < 24) return rtf.format(-horas, "hour");
  const dias = Math.round(horas / 24);
  if (dias < 7) return rtf.format(-dias, "day");
  return fecha.toLocaleDateString("es", { day: "numeric", month: "short" });
};

// Descarga forzada aunque la imagen esté en otro origen (Storage): fetch → blob.
const descargar = async (url: string, nombre: string) => {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objUrl;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objUrl);
  } catch {
    window.open(url, "_blank");
  }
};

const HistorialRenders = ({ userId, refreshSignal }: HistorialRendersProps) => {
  const [renders, setRenders] = useState<RenderRow[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [verOriginal, setVerOriginal] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      setCargando(true);
      setError("");
      const { data, error: err } = await (supabase as any)
        .from("renders")
        .select("*")
        .order("created_at", { ascending: false });
      if (!activo) return;
      if (err) {
        setError("No se pudo cargar tu historial. Intenta de nuevo.");
        setRenders([]);
      } else {
        setRenders((data ?? []) as RenderRow[]);
      }
      setCargando(false);
    };
    void cargar();
    return () => {
      activo = false;
    };
  }, [userId, refreshSignal]);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#EA580C] border-t-transparent" aria-hidden="true" />
        <span className="text-sm font-bold text-muted-foreground">Cargando tu historial...</span>
      </div>
    );
  }

  if (error) {
    return <p className="py-20 text-center text-sm font-bold text-destructive">{error}</p>;
  }

  if (renders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-border bg-card py-20 text-center">
        <p className="text-lg font-black text-foreground">Aún no has generado renders</p>
        <p className="text-sm text-muted-foreground">¡Crea el primero desde la pestaña Generar!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {renders.map((r) => {
        const mostrandoOriginal = !!verOriginal[r.id] && !!r.imagen_original_url;
        const src = mostrandoOriginal ? r.imagen_original_url! : r.imagen_generada_url;
        return (
          <div
            key={r.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-card"
            onMouseEnter={() => r.imagen_original_url && setVerOriginal((s) => ({ ...s, [r.id]: true }))}
            onMouseLeave={() => setVerOriginal((s) => ({ ...s, [r.id]: false }))}
          >
            <div className="relative aspect-[3/2] overflow-hidden bg-input">
              <img src={src} alt="Render generado" className="h-full w-full object-cover" loading="lazy" />
              {r.imagen_original_url && (
                <button
                  type="button"
                  onClick={() => setVerOriginal((s) => ({ ...s, [r.id]: !s[r.id] }))}
                  className="absolute left-2 top-2 rounded-full bg-black/70 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur transition hover:bg-black/90"
                >
                  {mostrandoOriginal ? "Antes" : "Después"}
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                {r.estilo ? (
                  <span translate="no" className="notranslate rounded-full bg-[#EA580C]/15 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#EA580C]">
                    {r.estilo}
                  </span>
                ) : (
                  <span />
                )}
                <span translate="no" className="notranslate shrink-0 text-[11px] font-semibold text-muted-foreground">
                  {fechaAmigable(r.created_at)}
                </span>
              </div>
              {r.prompt && <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">{r.prompt}</p>}
              <button
                type="button"
                onClick={() => descargar(r.imagen_generada_url, `arquirender-${r.id}.png`)}
                className="mt-1 rounded-full bg-[#EA580C] px-3 py-2 text-xs font-extrabold text-white transition hover:bg-[#c2470a]"
              >
                Descargar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistorialRenders;
