import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VariacionesModalProps {
  estilos: string[];
  creditosDisponibles: number;
  imageBase64: string;
  /** Notas libres del usuario (campo "Notas adicionales"). Único dato del input que se conserva. */
  notas?: string;
  /** @deprecated Ya no se usa: el prompt de variación se arma con construirPromptVariacion. */
  construirPrompt?: (estilo: string) => string;
  onVerPlanes: () => void;
  onCreditosActualizados: () => void | Promise<void>;
  onClose: () => void;
}

type EstadoVariacion = { estado: "cargando" | "ok" | "error"; imagen?: string; error?: string };

const MIN = 2;
const MAX = 4;

// Descripciones ricas por estilo (keywords arquitectónicas fuertes en inglés).
// El estilo abre el prompt y domina; nada de preservación exacta ni materiales fijos.
const ESTILOS_DESC: Record<string, string> = {
  "Moderno": "MODERN architecture — clean horizontal lines, open flowing plan, large floor-to-ceiling glass, steel and glass, flat roofs, uncluttered functional design",
  "Minimalista": "MINIMALIST architecture — clean uncluttered lines, pure white surfaces, hidden storage, essential forms only, serene emptiness, restrained monochrome palette",
  "Industrial": "INDUSTRIAL architecture — exposed steel beams, raw brick walls, visible ductwork and piping, polished concrete floors, metal and concrete, warehouse aesthetic",
  "Contemporáneo": "CONTEMPORARY architecture — sleek mixed materials, bold asymmetric forms, expansive glazing, sustainable details, refined neutral tones, cutting-edge current design",
  "Brutalista": "BRUTALIST architecture — bold exposed raw concrete, massive monolithic forms, heavy geometric volumes, board-formed concrete textures, dramatic deep shadows",
  "Bauhaus": "BAUHAUS architecture — functional geometric forms, primary color accents, balanced asymmetry, tubular steel, form-follows-function, clean rational composition",
  "Art Deco": "ART DECO architecture — bold geometric ornament, symmetrical stepped forms, rich luxurious materials, brass, marble and lacquer, glamorous vertical emphasis",
  "Orgánico": "ORGANIC architecture — flowing natural curves, seamless integration with nature, natural wood and stone, biomorphic sculptural forms, indoor-outdoor continuity",
  "Paramétrico": "PARAMETRIC architecture — fluid organic curves, complex geometric patterns, flowing continuous surfaces, computational design, dynamic sculptural shapes",
  "Neoclásico": "NEOCLASSICAL architecture — grand symmetrical columns, ornate cornices and moldings, marble surfaces, classical proportions, elegant timeless formal grandeur",
  "Mediterráneo": "MEDITERRANEAN architecture — warm stucco walls, terracotta roof tiles, arched openings, natural stone, wrought iron details, earthy sun-washed tones",
  "Rústico": "RUSTIC architecture — weathered natural wood, exposed stone walls, rough textured finishes, handcrafted details, warm earthy materials, cozy countryside charm",
};

// Prompt de variación: estilo dominante al inicio + libertad para redefinir materiales/detalles.
// La imagen de referencia (imageBase64) ancla el encuadre/espacio; el estilo lo reinterpreta todo.
const construirPromptVariacion = (estilo: string, notas: string): string => {
  const desc = ESTILOS_DESC[estilo] ?? `${estilo.toUpperCase()} architectural style`;
  const partes = [
    `${desc}.`,
    `Reinterpret this space entirely in the ${estilo} style.`,
    `Keep only the general spatial composition and camera framing of the reference image so it reads as the same space, but let the ${estilo} style fully redefine the materials, textures, finishes, colors and architectural details.`,
    `Photorealistic architectural render, high detail, realistic textures.`,
  ];
  const extra = notas.trim();
  if (extra) partes.push(`Additional context: ${extra}`);
  return partes.join(" ");
};

const VariacionesModal = ({
  estilos,
  creditosDisponibles,
  imageBase64,
  notas = "",
  onVerPlanes,
  onCreditosActualizados,
  onClose,
}: VariacionesModalProps) => {
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [iniciado, setIniciado] = useState(false);
  const [resultados, setResultados] = useState<Record<string, EstadoVariacion>>({});

  const costo = seleccion.length;
  const suficientes = costo <= creditosDisponibles;
  const puedeGenerar = costo >= MIN && costo <= MAX && suficientes;

  const toggleEstilo = (estilo: string) => {
    setSeleccion((actual) => {
      if (actual.includes(estilo)) return actual.filter((e) => e !== estilo);
      if (actual.length >= MAX) return actual; // tope de 4
      return [...actual, estilo];
    });
  };

  const generarUna = async (estilo: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-render", {
        body: { prompt: construirPromptVariacion(estilo, notas), imageBase64, estilo },
      });
      if (error) {
        const status = (error as any)?.context?.status;
        const msg = status === 402 ? "Sin créditos" : "No se pudo generar";
        setResultados((r) => ({ ...r, [estilo]: { estado: "error", error: msg } }));
        return;
      }
      if (!data?.success || !data?.imageBase64) {
        setResultados((r) => ({ ...r, [estilo]: { estado: "error", error: data?.error || "No se pudo generar" } }));
        return;
      }
      setResultados((r) => ({ ...r, [estilo]: { estado: "ok", imagen: `data:image/png;base64,${data.imageBase64}` } }));
    } catch {
      setResultados((r) => ({ ...r, [estilo]: { estado: "error", error: "Error inesperado" } }));
    }
  };

  const generarVariaciones = async () => {
    if (!puedeGenerar || iniciado) return;
    setIniciado(true);
    const inicial: Record<string, EstadoVariacion> = {};
    seleccion.forEach((e) => (inicial[e] = { estado: "cargando" }));
    setResultados(inicial);

    // Todas en paralelo; cada tarjeta se actualiza cuando llega su resultado.
    await Promise.allSettled(seleccion.map((e) => generarUna(e)));
    await onCreditosActualizados();
  };

  const generando = useMemo(
    () => Object.values(resultados).some((r) => r.estado === "cargando"),
    [resultados],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4" onClick={onClose}>
      <div translate="no" className="notranslate w-full max-w-3xl rounded-2xl border border-brand-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#EA580C]">ArquiRender</div>
            <h2 className="m-0 mt-1 text-2xl font-black text-foreground">Variaciones de estilo</h2>
            <p className="mt-1 text-sm text-muted-foreground">Genera el mismo espacio en varios estilos a la vez.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full px-2 text-lg font-bold text-muted-foreground transition hover:text-foreground">✕</button>
        </div>

        {!iniciado ? (
          <>
            {/* Selección de estilos */}
            <div className="mb-4 flex flex-wrap gap-2">
              {estilos.map((estilo) => {
                const activo = seleccion.includes(estilo);
                const bloqueado = !activo && seleccion.length >= MAX;
                return (
                  <button
                    key={estilo}
                    type="button"
                    translate="no"
                    onClick={() => toggleEstilo(estilo)}
                    disabled={bloqueado}
                    className={`notranslate rounded-full border px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      activo
                        ? "border-[#EA580C] bg-[#EA580C] text-white"
                        : "border-[hsl(var(--pill-border))] bg-transparent text-foreground hover:border-[#EA580C]"
                    }`}
                  >
                    {estilo}
                  </button>
                );
              })}
            </div>

            {/* Costo / créditos */}
            <div className="mb-5 rounded-xl border border-brand-border bg-input p-4 text-sm">
              {costo < MIN ? (
                <p className="font-semibold text-muted-foreground">Selecciona entre {MIN} y {MAX} estilos.</p>
              ) : !suficientes ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-bold text-destructive">
                    Necesitas <span translate="no" className="notranslate">{costo}</span> créditos, tienes{" "}
                    <span translate="no" className="notranslate">{creditosDisponibles}</span>.
                  </p>
                  <button type="button" onClick={onVerPlanes} className="shrink-0 rounded-full bg-[#EA580C] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#c2470a]">Ver planes</button>
                </div>
              ) : (
                <p className="font-semibold text-foreground">
                  Esto usará <span translate="no" className="notranslate font-black text-[#EA580C]">{costo}</span>{" "}
                  {costo === 1 ? "crédito" : "créditos"} (tienes{" "}
                  <span translate="no" className="notranslate">{creditosDisponibles}</span> disponibles).
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={generarVariaciones}
              disabled={!puedeGenerar}
              className="w-full rounded-full bg-[#EA580C] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#c2470a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generar variaciones
            </button>
          </>
        ) : (
          <>
            {/* Grilla de resultados 2x2 */}
            <div className="grid gap-4 sm:grid-cols-2">
              {seleccion.map((estilo) => {
                const r = resultados[estilo];
                return (
                  <div key={estilo} className="flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-input">
                    <div className="flex items-center justify-between gap-2 border-b border-brand-border px-3 py-2">
                      <span translate="no" className="notranslate text-xs font-extrabold uppercase tracking-wide text-[#EA580C]">{estilo}</span>
                    </div>
                    <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden bg-black/30">
                      {r?.estado === "cargando" && (
                        <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#EA580C] border-t-transparent" aria-hidden="true" />
                      )}
                      {r?.estado === "ok" && r.imagen && (
                        <img src={r.imagen} alt={`Variación ${estilo}`} className="h-full w-full object-cover" />
                      )}
                      {r?.estado === "error" && (
                        <p className="px-3 text-center text-xs font-bold text-destructive">{r.error}</p>
                      )}
                    </div>
                    {r?.estado === "ok" && r.imagen && (
                      <a href={r.imagen} download={`arquirender-${estilo}.png`} className="m-3 rounded-full bg-[#EA580C] px-3 py-2 text-center text-xs font-extrabold text-white transition hover:bg-[#c2470a]">Descargar</a>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={generando}
              className="mt-5 w-full rounded-full border border-brand-border bg-transparent px-4 py-3 text-sm font-extrabold text-foreground transition hover:border-[#EA580C] hover:text-[#EA580C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generando ? "Generando..." : "Cerrar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VariacionesModal;
