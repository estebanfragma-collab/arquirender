import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/AuthModal";
import PlanesModal from "@/components/PlanesModal";
import HistorialRenders from "@/components/HistorialRenders";
import OnboardingModal from "@/components/OnboardingModal";
import { PRESETS, CLAVES_PRESET, type Preset } from "@/lib/presets";
import {
  caos,
  coloresDominantes,
  alturasTecho,
  estilosDiseno,
  estilosMidjourney,
  estilizados,
  materialesPorCategoria,
  nivelesEspacio,
  proporcionesPlanta,
  relacionesAspecto,
  tabsPrompt,
  tamanosEspacio,
  ventanasLuzNatural,
  versiones,
  type CampoPrompt,
  type TabId,
} from "@/data/promptsArquitectonicos";

// TODO: pegar aquí la URL del portal de cliente de Paddle (Customer Portal).
// Mientras esté vacía, la opción "Gestionar suscripción" no se muestra.
const PORTAL_PADDLE_URL: string = "";

interface ValoresFormulario {
  [clave: string]: string | string[];
}

interface VistaPreviaArchivo {
  nombre: string;
  url: string;
}

const clasesControl = "w-full rounded-md border border-[hsl(var(--input-border))] bg-input px-3 py-3 text-sm text-foreground outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20";
const parametrosIds = ["aspectRatio", "stylize", "version", "style", "chaos", "negativePrompt"];

const valorTexto = (valor: string | string[] | undefined, fallback = "") => (Array.isArray(valor) ? valor.join(", ") : valor || fallback);
const valorLista = (valor: string | string[] | undefined, fallback = "") => (Array.isArray(valor) && valor.length ? valor.join(", ") : fallback);
const limpiarColor = (valor: string | string[] | undefined) => valorTexto(valor).replace(/^[^A-Za-zÁÉÍÓÚáéíóúÑñ]+\s*/, "");
const nombreArquitecto = (valor: string) => valor.split(" (")[0];
const mensajeErrorAnalisis = "No se pudo analizar la imagen con IA. Intenta nuevamente o pega una descripción manual.";

const extraerMensajeErrorAnalisis = async (error: unknown) => {
  if (error && typeof error === "object" && "context" in error) {
    const respuesta = (error as { context?: Response }).context;
    if (respuesta instanceof Response) {
      const data = await respuesta.clone().json().catch(() => null) as { error?: string } | null;
      if (data?.error) return data.error;
    }
  }

  if (error && typeof error === "object" && "message" in error) {
    const mensaje = (error as { message?: unknown }).message;
    if (typeof mensaje === "string" && mensaje.trim()) return mensaje;
  }

  return mensajeErrorAnalisis;
};

const mensajeErrorRender = "No se pudo generar la imagen, intenta de nuevo";

// Costo en generaciones de cada acción. 1 crédito = 1 imagen generada.
const COSTO_RENDER = 1;

/**
 * Cuántas generaciones le faltan al usuario para costear una acción.
 * Devuelve 0 si no hay sesión o los créditos aún no cargaron: en ese caso el
 * botón sigue activo y el flujo de login/planes se encarga.
 */
const faltanPara = (costo: number, userId: string | null, creditos: number | null) =>
  userId && typeof creditos === "number" ? Math.max(0, costo - creditos) : 0;

const textoFaltan = (faltan: number) =>
  `Te ${faltan === 1 ? "falta" : "faltan"} ${faltan} ${faltan === 1 ? "generación" : "generaciones"}`;

/**
 * Piezas que se encadenan tras la primera generación de un usuario, cobrando
 * un solo crédito en total. Van en cadena (secuencial), no en paralelo, y todas
 * parten de la imagen de la pieza 1. El slug debe existir en PROMPTS_REPRESENTACION
 * de la Edge Function o esta ignora la representación y genera un render normal.
 */
const PIEZAS_CADENA = [
  { representacion: "fotografia_real", etiqueta: "Fotografía real" },
  { representacion: "nocturno", etiqueta: "Nocturno" },
  { representacion: "moodboard", etiqueta: "Moodboard" },
] as const;

type EstadoPieza = { estado: "cargando" | "ok" | "error"; imagen?: string; error?: string };

/**
 * Presets que se muestran. "plano-render" queda fuera de la UI: su definición
 * sigue en src/lib/presets.ts, solo no se ofrece aquí.
 */
const PRESETS_VISIBLES = PRESETS.filter((preset) => preset.id !== "plano-render");

/** Estilos visibles de entrada en la tarjeta 🎨. El resto llega con "Ver todos". */
const ESTILOS_DESTACADOS = ["Moderno", "Minimalista", "Contemporáneo", "Industrial", "Bauhaus"];

/**
 * Etiqueta corta en español → valor exacto de iluminacionSketch.
 * Lo que se guarda en el estado (y viaja al prompt) es siempre `valor`, en inglés;
 * `etiqueta` es solo lo que lee el usuario. Si cambia un string de iluminacionSketch,
 * hay que actualizarlo aquí o la píldora deja de marcarse.
 */
const LUCES = [
  { etiqueta: "Dorada", valor: "Side golden hour, long shadows, warm atmosphere" },
  { etiqueta: "Nocturna", valor: "Night — warm 2700K pendant lamps, cozy mood" },
  { etiqueta: "Dramática", valor: "Dramatic focal lighting, spots on the hero product" },
  { etiqueta: "Amanecer", valor: "Dawn, soft pink side light" },
];

/** Las dos opciones restantes del array, tras "Ver todos". */
const LUCES_EXTRA = [
  { etiqueta: "Natural", valor: "Soft natural daylight, diffused shadows, global illumination" },
  { etiqueta: "Aro LED", valor: "Circular ring LED, signature retail style" },
];

// Mismo criterio que las píldoras de representación: el naranja solo significa
// "seleccionada". Hover y foco no lo usan, para que no parezcan un estado más.
const clasePildora = (activo: boolean) =>
  `rounded-full border px-3 py-2 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-foreground/30 ${
    activo
      ? "border-[#EA580C] bg-[#EA580C] text-white"
      : "border-[hsl(var(--pill-border))] bg-transparent text-foreground hover:border-foreground/40"
  }`;

const claseVerTodos = "mt-3 text-[11px] font-bold text-muted-foreground underline transition hover:text-[#EA580C]";

/**
 * Fila horizontal de presets de transformación. Scrollea en pantallas estrechas.
 *
 * Estados del card: hover cambia solo el borde; seleccionado cambia borde Y título.
 * El color del título es lo único que los distingue.
 */
const PresetsRow = ({
  activo,
  onSeleccionar,
  transformacion,
  preservar,
  negativePrompt,
  avisarBase,
  onVolverAlOriginal,
  deshabilitado,
}: {
  activo: string | null;
  onSeleccionar: (preset: Preset) => void;
  transformacion: string;
  preservar: string[];
  negativePrompt: string;
  /** El preset activo parte de la foto original pero hay un render encima. */
  avisarBase: boolean;
  onVolverAlOriginal: () => void;
  /** Hay representaciones activas: los presets no tendrían efecto. */
  deshabilitado: boolean;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ izquierda: false, derecha: false });

  // Cada extremo solo se difumina si de ese lado queda contenido cortado.
  const actualizarFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setFade({
      izquierda: scrollLeft > 1,
      derecha: scrollLeft + clientWidth < scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    actualizarFade();
    const el = scrollRef.current;
    if (!el) return;
    // El ancho disponible cambia con el viewport y con el layout del panel.
    const observer = new ResizeObserver(actualizarFade);
    observer.observe(el);
    return () => observer.disconnect();
  }, [actualizarFade]);

  return (
    <div className={`border-t border-brand-border px-5 py-5 sm:px-6 ${deshabilitado ? "pointer-events-none opacity-40" : ""}`} aria-disabled={deshabilitado || undefined}>
      <label className="mb-3 flex justify-between gap-3 text-sm font-semibold text-brand-gold">
        <span>Presets de transformación</span>
        <span className="font-bold text-muted-foreground">Opcional</span>
      </label>

      <div className="relative -mx-1">
        <div ref={scrollRef} onScroll={actualizarFade} className="flex gap-3 overflow-x-auto px-1 pb-2">
          {PRESETS_VISIBLES.map((preset) => {
            const seleccionado = activo === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={deshabilitado}
                onClick={() => onSeleccionar(preset)}
                aria-pressed={seleccionado}
                className={`flex w-[210px] shrink-0 flex-col gap-1 rounded-md border bg-transparent p-3 text-left transition ${
                  seleccionado ? "border-[#EA580C]" : "border-brand-border hover:border-[#EA580C]"
                }`}
              >
                <span className={`text-xs font-extrabold ${seleccionado ? "text-[#EA580C]" : "text-foreground"}`}>
                  {preset.nombre}
                </span>
                <span className="text-[11px] leading-snug text-muted-foreground">{preset.descripcion}</span>
              </button>
            );
          })}
        </div>

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 w-10 transition-opacity duration-200 ${fade.izquierda ? "opacity-100" : "opacity-0"}`}
          style={{ background: "linear-gradient(to right, hsl(var(--card)), transparent)" }}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 w-10 transition-opacity duration-200 ${fade.derecha ? "opacity-100" : "opacity-0"}`}
          style={{ background: "linear-gradient(to left, hsl(var(--card)), transparent)" }}
        />
      </div>

      {/* Qué dejó cargado el preset. Solo lectura: los campos no tienen UI propia. */}
      {activo && (
        <div className="mt-3 space-y-1.5 rounded-md border border-brand-border bg-input/40 p-3 text-[11px] leading-snug text-muted-foreground">
          {transformacion && (
            <p>
              <span className="font-bold">Transformación:</span> {transformacion}
            </p>
          )}
          {preservar.length > 0 && (
            <p>
              <span className="font-bold">Preservar:</span> {preservar.join(" · ")}
            </p>
          )}
          {negativePrompt && (
            <p>
              <span className="font-bold">Evitar:</span> {negativePrompt}
            </p>
          )}
          {avisarBase && (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[#EA580C]">
              <span className="font-bold">Este preset trabaja mejor desde tu foto original.</span>
              <button type="button" onClick={onVolverAlOriginal} className="font-extrabold underline transition hover:opacity-80">
                Volver al original
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const extraerErrorRender = async (error: unknown) => {
  if (error && typeof error === "object" && "context" in error) {
    const respuesta = (error as { context?: Response }).context;
    if (respuesta instanceof Response) {
      const data = await respuesta.clone().json().catch(() => null) as { error?: string } | null;
      if (data?.error) return data.error;
    }
  }
  return mensajeErrorRender;
};

const estadoInicial = (tabId: TabId): ValoresFormulario => {
  const tab = tabsPrompt.find((item) => item.id === tabId)!;
  const base = tab.campos.reduce<ValoresFormulario>((acumulado, campo) => {
    if (campo.tipo === "pills") acumulado[campo.id] = [];
    else if (campo.tipo === "archivo" || campo.tipo === "archivoAnalisis") acumulado[campo.id] = "";
    else if (campo.tipo === "parametrosEspacio") {
      acumulado.tamanoEspacio = tamanosEspacio[0];
      acumulado.proporcionPlanta = proporcionesPlanta[0];
      acumulado.alturaTecho = alturasTecho[1];
      acumulado.niveles = nivelesEspacio[0];
      acumulado.ventanasLuzNatural = ventanasLuzNatural[0];
    }
    else if (campo.tipo === "parametros") {
      acumulado.aspectRatio = "16:9";
      acumulado.stylize = "750";
      acumulado.version = "v6.1";
      acumulado.style = "raw";
      acumulado.chaos = "0";
      acumulado.negativePrompt = "";
    } else acumulado[campo.id] = campo.opciones?.[0] || "";
    return acumulado;
  }, {});

  // El default genérico sería iluminacionSketch[0] ("Soft natural daylight..."),
  // una luz plana que aplana el resultado cuando el usuario no toca el acordeón.
  // La golden hour lateral da sombras y volumen desde la primera generación.
  // Se escribe literal, no por índice, para que reordenar el array no lo rompa;
  // debe coincidir exacto con su entrada en iluminacionSketch.
  if (tab.id === "sketch") {
    base.iluminacion = "Side golden hour, long shadows, warm atmosphere";
  }

  parametrosIds.forEach((id) => {
    if (!(id in base)) {
      const defaults: Record<string, string> = { aspectRatio: "16:9", stylize: "750", version: "v6.1", style: "raw", chaos: "0", negativePrompt: "" };
      base[id] = defaults[id];
    }
  });

  return base;
};

const parametrosMidjourney = (valores: ValoresFormulario, incluirChaos = true) => {
  const partes = [`--ar ${valorTexto(valores.aspectRatio, "16:9")}`, `--style ${valorTexto(valores.style, "raw")}`, `--stylize ${valorTexto(valores.stylize, "750")}`, `--v ${valorTexto(valores.version, "v6.1").replace(/^v/, "")}`];
  const chaos = valorTexto(valores.chaos, "0");
  const no = valorTexto(valores.negativePrompt).trim();
  if (incluirChaos && chaos !== "0") partes.push(`--chaos ${chaos}`);
  if (no) partes.push(`--no ${no}`);
  return partes.join(" ");
};

const parametrosEspaciales = (valores: ValoresFormulario) => {
  const tamano = valorTexto(valores.tamanoEspacio, tamanosEspacio[0]);
  const proporcion = valorTexto(valores.proporcionPlanta, proporcionesPlanta[0]);
  const techo = valorTexto(valores.alturaTecho, alturasTecho[1]);
  const niveles = valorTexto(valores.niveles, nivelesEspacio[0]);
  const ventanas = valorTexto(valores.ventanasLuzNatural, ventanasLuzNatural[0]);
  return `${tamano} ${proporcion} retail space, ${techo} ceiling, ${niveles}, ${ventanas} natural light`;
};

/**
 * Cada estilo, expresado como materiales y acabados concretos.
 * Una etiqueta ("Bauhaus architectural style") le dice poco al modelo de imagen;
 * una lista de superficies y aberturas sí dirige el resultado.
 * Los estilos sin entrada aquí caen al nombre suelto, que es lo que había antes.
 */
const ESTILO_DESCRIPCION: Record<string, string> = {
  Bauhaus: "smooth white rendered surfaces, steel-framed ribbon glazing, flat roof edges, primary-colour accents, zero ornament",
  Industrial: "exposed brick, blackened steel, raw concrete, visible ductwork, factory-style glazing",
  Minimalista: "pure white surfaces, hidden joints, uninterrupted planes, concealed lighting",
  Moderno: "large glazed openings, horizontal lines, steel and glass, flat planes",
  "Contemporáneo": "mixed natural stone and warm wood, deep overhangs, layered volumes",
  Brutalista: "board-marked raw concrete, massive geometric volumes, deep shadow reveals, monolithic surfaces",
  "Art Deco": "geometric relief patterns, polished brass inlays, black marble, symmetrical stepped forms",
  "Orgánico": "curved flowing surfaces, natural timber, stone bedded into the landscape, no hard edges",
  "Paramétrico": "complex curved geometry, repeating modular panels, fluid continuous surfaces",
  "Neoclásico": "white marble, fine mouldings, symmetrical composition, slender columns",
  "Mediterráneo": "white lime-washed walls, terracotta roof tiles, rounded arches, timber shutters",
  "Rústico": "rough sawn timber beams, natural fieldstone, hand-finished plaster, aged textures",
};

const construirPrompt = (tabId: TabId, valores: ValoresFormulario, fuenteImagen = "") => {
  const materialOtro = valorTexto(valores.materialOtro).trim();
  // Solo lo que el usuario eligió. El fallback de marca queda para la rama
  // general: en sketch competía con el estilo en vez de sumar.
  const materialesElegidos = [valorLista(valores.materiales, ""), materialOtro].filter(Boolean).join(", ");
  const materiales = materialesElegidos || "premium ArquiRender retail materials";
  const color = limpiarColor(valores.color) || "warm neutral";
  const notas = valorTexto(valores.notas).trim();

  const estiloDiseno = valorTexto(valores.estiloDiseno).trim();
  const arquitectoRef = valorTexto(valores.arquitectoRef).trim();
  // Materiales y acabados del estilo, no su nombre.
  const estiloFrase = estiloDiseno ? ESTILO_DESCRIPCION[estiloDiseno] || `${estiloDiseno} architectural style` : "";

  if (tabId === "sketch") {
    const descripcion = valorTexto(valores.descripcion).trim();
    const origen = fuenteImagen ? `Starting from ${fuenteImagen}. ` : "";
    const evitar = valorTexto(valores.negativePrompt).trim();
    const luz = valorTexto(valores.iluminacion).trim();
    const cola = `${notas ? ` ${notas}` : ""}${evitar ? ` Avoid: ${evitar}.` : ""}`;

    // CON ESTILO: fórmula heredada del antiguo VariacionesModal, la que sí
    // aplicaba los estilos. El estilo abre el prompt y domina; una sola
    // instrucción de encuadre en vez de cuatro de preservación, que lo ahogaban.
    if (estiloDiseno) {
      return `${origen}${estiloFrase ? `${estiloFrase}. ` : ""}Reinterpret this space entirely in the ${estiloDiseno} style. Keep only the general spatial composition and camera framing of the reference image so it reads as the same space, but let the ${estiloDiseno} style fully redefine the materials, textures, finishes, colors and architectural details.${descripcion ? ` Use this architectural image analysis as reference: ${descripcion}.` : ""}${materialesElegidos ? ` Apply ${materialesElegidos}.` : ""}${luz ? ` Use ${luz} creating realistic shadows, reflections and depth.` : ""} Photorealistic architectural render, high detail, realistic textures.${cola}`.replace(/\s+/g, " ").trim();
    }

    // SIN ESTILO: transformación fiel. Aquí las preservaciones sí ayudan,
    // porque no hay estilo con el que competir.
    // Preservación y materiales solo aparecen si el usuario los eligió; sus
    // antiguos fallbacks repetían transformaciones[0] o competían con el estilo.
    const preservarElegido = valorLista(valores.preservar, "");
    return `${origen}${valorTexto(valores.transformacion)}.${descripcion ? ` Use this architectural image analysis as reference: ${descripcion}.` : ""}${estiloFrase ? ` Render it with ${estiloFrase}.` : ""}${preservarElegido ? ` Preserve ${preservarElegido}.` : ""} Preserve the exact camera angle, framing and composition of the reference image. Do not change the viewpoint.${materialesElegidos ? ` Apply ${materialesElegidos}.` : ""}${arquitectoRef ? ` Inspired by the work of ${arquitectoRef}.` : ""}${luz ? ` Use ${luz} creating realistic shadows, reflections and depth.` : ""} Photorealistic architectural render, high detail, realistic textures.${cola}`.replace(/\s+/g, " ").trim();
  }

  const tipoEspacio = tabId === "nueva" ? `${valorTexto(valores.tipoEspacio)}, ${parametrosEspaciales(valores)}` : tabId === "remodelacion" ? `${valorTexto(valores.tipoEspacio)}, ${parametrosEspaciales(valores)}, ${valorTexto(valores.descripcion, "existing ArquiRender retail space")}, ${valorTexto(valores.cambio)}` : `${valorTexto(valores.tipoEspacio)}, ${parametrosEspaciales(valores)}, ${valorTexto(valores.visualizacion)}, ${valorTexto(valores.descripcion, "architectural plan translated into retail space")}`;
  const foco = tabId === "nueva" ? valorTexto(valores.zona) : tabId === "remodelacion" ? `preserve: ${valorLista(valores.conservar, "selected existing elements")}` : valorTexto(valores.software);
  const hora = tabId === "nueva" ? valorTexto(valores.hora) : "time of day coherent with the selected lighting";
  const camaraReferencia = tabId === "nueva" ? `${valorTexto(valores.camaraReferencia)} ` : "";
  const biofilia = tabId === "nueva" ? valorLista(valores.biofilicos, "subtle biophilic integration") : "spatially coherent biophilic integration";
  const calidad = tabId === "nueva" ? valorTexto(valores.calidad) : "8K fotorrealista · archdaily style";
  const arquitecto = valorTexto(valores.arquitecto);
  const referencia = arquitecto && arquitecto !== "Sin referencia" ? `, inspired by the work of ${nombreArquitecto(arquitecto)}` : "";

  return `Photorealistic architectural visualization, ${tipoEspacio}, ArquiRender Ecuador retail brand,${valorTexto(valores.estilo)} style, ${materiales} with ${color} color palette, ${foco}, ${valorTexto(valores.iluminacion)}, ${hora}, ${camaraReferencia}${valorTexto(valores.camara)}, ${biofilia}, ${calidad}, realistic shadows and reflections, soft global illumination${referencia}${notas ? `, ${notas}` : ""} ${parametrosMidjourney(valores)}`.replace(/\s+/g, " ").trim();
};

/**
 * Origen de la imagen. Ya no lo elige el usuario: lo clasifica el análisis que
 * corre al subir la imagen ("analyze-architectural-image").
 */
type TipoOrigen = "sketch" | "sketchup" | "render" | "otro";

/**
 * Descriptor que construirPrompt envuelve como `Starting from ${...}. `.
 * "otro" queda vacío a propósito: sin clasificación fiable, sin prefijo.
 */
const DESCRIPTORES_ORIGEN: Record<TipoOrigen, string> = {
  sketch: "a hand-drawn architectural sketch",
  sketchup: "a SketchUp screenshot",
  render: "an existing render",
  otro: "",
};

/**
 * Atajos de "¿Y ahora qué?": parten de la imagen del visor, no de la original.
 * El slug debe existir en PROMPTS_REPRESENTACION de la Edge Function.
 */
const SEGUIMIENTOS = [
  { etiqueta: "Vista aérea", representacion: "vista_aerea_dron" },
  { etiqueta: "Close up del detalle", representacion: "close_up" },
  { etiqueta: "Día lluvioso", representacion: "dia_lluvioso" },
  { etiqueta: "Maqueta física", representacion: "maqueta" },
] as const;

/** Ejemplos que rotan en el campo libre hasta que el usuario escribe. */
const PLACEHOLDERS_LIBRE = [
  "Añade una familia caminando hacia la entrada",
  "Añade clientes dentro del local",
  "Añade vegetación madura alrededor",
  "Añade productos en las estanterías",
  "Cambia el piso a madera clara",
  "Quita los autos del frente",
  "Añade una piscina en el jardín",
  "Pon el cielo nublado",
];

const MS_ROTACION_PLACEHOLDER = 4000;

/** Tope de representaciones simultáneas. Cada una cuesta un crédito. */
const MAX_REPRESENTACIONES = 4;

/** Solo se acepta una de las tres clasificaciones conocidas; el resto cae a "otro". */
const normalizarOrigen = (valor: unknown): TipoOrigen =>
  valor === "sketch" || valor === "sketchup" || valor === "render" ? valor : "otro";

// Modo "Tipo de Representación": 7 categorías con sus variantes.
const categoriasRepresentacion = [
  { categoria: "Atmósfera", icono: "🌙", opciones: ["Nocturno", "Día lluvioso"] },
  { categoria: "Cámara", icono: "📷", opciones: ["Vista lateral", "Vista aérea de dron"] },
  { categoria: "Detalles", icono: "🔍", opciones: ["Close up", "Macro close up", "Actividad close up"] },
  { categoria: "Documentación", icono: "📐", opciones: ["Axonométrico"] },
  { categoria: "Portfolio", icono: "🗂️", opciones: ["Lámina de presentación"] },
  { categoria: "Materiales", icono: "🪨", opciones: ["Moodboard", "Maqueta"] },
  { categoria: "Transformaciones", icono: "⚡", opciones: ["Lugar abandonado", "Remodelación"] },
  { categoria: "Realismo", icono: "📸", opciones: ["Fotografía real"] },
] as const;

// Normaliza la etiqueta a clave (minúsculas, sin tildes, sin conectores, underscore).
// Espeja slugRepresentacion de la Edge Function para que todas las opciones —no solo
// las nuevas— viajen ya como clave: "Corte arquitectónico" → "corte_arquitectonico".
const STOPWORDS_REPRESENTACION = new Set(["de", "del", "la", "el", "los", "las", "y"]);
const slugRepresentacion = (valor: string): string =>
  valor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !STOPWORDS_REPRESENTACION.has(token))
    .join("_");

// Convierte una URL de Storage a data-URL (fetch → blob → base64). El generador
// trabaja siempre con data-URLs porque la Edge Function espera base64, no una URL.
// Lanza si el fetch o la lectura fallan, para que el llamador muestre el error.
const urlADataUrl = async (url: string): Promise<string> => {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`fetch ${resp.status}`);
  const blob = await resp.blob();
  return await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = () => reject(new Error("readAsDataURL falló"));
    fr.readAsDataURL(blob);
  });
};

const GeneradorPromptsArquitectonicos = () => {
  const [tabActiva, setTabActiva] = useState<TabId>("sketch");
  // Arranca en "otro" (sin prefijo). Solo el análisis puede moverlo de ahí.
  const [tipoOrigen, setTipoOrigen] = useState<TipoOrigen>("otro");
  const [valoresPorTab, setValoresPorTab] = useState<Record<TabId, ValoresFormulario>>({
    nueva: estadoInicial("nueva"),
    remodelacion: estadoInicial("remodelacion"),
    planta: estadoInicial("planta"),
    sketch: estadoInicial("sketch"),
  });
  const [prompt, setPrompt] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [copiadoAnalisis, setCopiadoAnalisis] = useState("");
  const [error, setError] = useState("");
  const [vistasPrevias, setVistasPrevias] = useState<Record<TabId, Record<string, VistaPreviaArchivo>>>({ nueva: {}, remodelacion: {}, planta: {}, sketch: {} });
  const [analizando, setAnalizando] = useState<Record<TabId, boolean>>({ nueva: false, remodelacion: false, planta: false, sketch: false });
  const [descripcionIA, setDescripcionIA] = useState<Record<TabId, boolean>>({ nueva: false, remodelacion: false, planta: false, sketch: false });
  const [errorAnalisis, setErrorAnalisis] = useState("");
  const [acordeones, setAcordeones] = useState<Record<string, boolean>>({ materiales: false, estilo: false, iluminacion: false });
  const [generando, setGenerando] = useState(false);
  const [imagenRenders, setImagenRenders] = useState<Record<TabId, string>>({ nueva: "", remodelacion: "", planta: "", sketch: "" });
  const [errorRender, setErrorRender] = useState("");
  const [comparacion, setComparacion] = useState<"antes" | "despues">("despues");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [menuUsuario, setMenuUsuario] = useState(false);
  const [creditos, setCreditos] = useState<number | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [generarTrasLogin, setGenerarTrasLogin] = useState(false);
  const [sinCreditos, setSinCreditos] = useState(false);
  const [mostrarPlanes, setMostrarPlanes] = useState(false);
  const [vista, setVista] = useState<"generar" | "historial">("generar");
  const [refrescarHistorial, setRefrescarHistorial] = useState(0);
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false);
  const [selectedRepresentaciones, setSelectedRepresentaciones] = useState<string[]>([]);
  // Qué se está pintando en el grid: la cadena de la primera generación o una
  // tanda de representaciones. Cambia el título y las celdas.
  const [modoGrid, setModoGrid] = useState<"cadena" | "tanda" | null>(null);
  // Pieza que ocupa el visor grande. Ninguna es "la principal": la primera que
  // termina lo toma, y el usuario cambia clicando otra miniatura.
  const [piezaVisor, setPiezaVisor] = useState<{ etiqueta: string; imagen: string } | null>(null);
  const [mostrarLibre, setMostrarLibre] = useState(false);
  const [textoLibre, setTextoLibre] = useState("");
  const [indicePlaceholder, setIndicePlaceholder] = useState(0);
  const [presetActivo, setPresetActivo] = useState<string | null>(null);
  const [piezas, setPiezas] = useState<Record<string, EstadoPieza>>({});
  const [cadenaActiva, setCadenaActiva] = useState(false);
  const [verTodosEstilos, setVerTodosEstilos] = useState(false);
  const [verTodasLuces, setVerTodasLuces] = useState(false);

  const tab = useMemo(() => tabsPrompt.find((item) => item.id === tabActiva)!, [tabActiva]);
  const valores = valoresPorTab[tabActiva];

  // Fuente de verdad única de la imagen base activa (por pestaña):
  //  - imagenRender: último render generado en esta pestaña (la iteración)
  //  - imagenOriginal: la foto realmente subida por el usuario
  //  - imagenBaseActiva: de dónde parte la próxima generación (el render si existe, si no la original)
  const imagenRender = imagenRenders[tabActiva];
  const imagenOriginal = vistasPrevias[tabActiva]?.imagen?.url || "";
  const imagenBaseActiva = imagenRender || imagenOriginal;
  // Lo que se ve en grande. Solo visual: la base de la próxima generación
  // sigue siendo imagenBaseActiva, no cambia al mirar otra pieza.
  const imagenVisor = piezaVisor?.imagen || imagenRender;
  const etiquetaVisor = piezaVisor?.etiqueta || "Generación";
  const campoPorId = (id: string) => tab.campos.find((campo) => campo.id === id);
  const toggleAcordeon = (clave: string) => setAcordeones((actual) => ({ ...actual, [clave]: !actual[clave] }));

  // Descarta el render de esta pestaña para volver a partir de la foto subida.
  const volverAlOriginal = () => setImagenRenders((actual) => ({ ...actual, [tabActiva]: "" }));

  // El placeholder del campo libre rota mientras esté vacío y visible.
  useEffect(() => {
    if (!mostrarLibre || textoLibre) return;
    const t = setInterval(
      () => setIndicePlaceholder((i) => (i + 1) % PLACEHOLDERS_LIBRE.length),
      MS_ROTACION_PLACEHOLDER,
    );
    return () => clearInterval(t);
  }, [mostrarLibre, textoLibre]);

  /** Multi-selección de representaciones, con tope. Un segundo clic quita. */
  const toggleRepresentacion = (opcion: string) => {
    setSelectedRepresentaciones((actual) => {
      if (actual.includes(opcion)) return actual.filter((o) => o !== opcion);
      if (actual.length >= MAX_REPRESENTACIONES) return actual;
      return [...actual, opcion];
    });
  };

  // Sin representaciones se genera una sola pieza; con N, una por representación.
  const costoGeneracion = selectedRepresentaciones.length || COSTO_RENDER;

  // Con representaciones activas la Edge Function reemplaza el prompt entero, así
  // que estilo, luz, materiales, presets y "qué evitar" no tendrían efecto. Se
  // atenúan y bloquean, pero su valor se conserva: al quitar todas vuelven intactos.
  const repsMandan = selectedRepresentaciones.length > 0;
  const claseBloqueo = repsMandan ? "pointer-events-none opacity-40" : "";

  // Valores de los campos del preset tal como estaban antes de aplicar el primero.
  // Permite que cada preset parta del estado limpio y que deseleccionar revierta.
  const valoresPrevios = useRef<ValoresFormulario | null>(null);

  const aplicarPreset = (preset: Preset) => {
    const deseleccionar = presetActivo === preset.id;
    const base = valoresPrevios.current;

    if (deseleccionar) {
      setValoresPorTab((actual) => ({
        ...actual,
        [tabActiva]: { ...actual[tabActiva], ...(base ?? {}) },
      }));
      valoresPrevios.current = null;
      setPresetActivo(null);
      return;
    }

    // Primer preset de la tanda: guarda el estado original de esos campos.
    if (!base) {
      const snapshot: ValoresFormulario = {};
      CLAVES_PRESET.forEach((clave) => { snapshot[clave] = valores[clave] ?? ""; });
      valoresPrevios.current = snapshot;
    }

    setValoresPorTab((actual) => ({
      ...actual,
      [tabActiva]: {
        ...actual[tabActiva],
        // Parte siempre del original, para que cambiar de preset no arrastre
        // la iluminación forzada por el anterior.
        ...(valoresPrevios.current ?? {}),
        transformacion: preset.transformacion,
        preservar: preset.preservar,
        negativePrompt: preset.negativePrompt,
        ...(preset.iluminacion ? { iluminacion: preset.iluminacion } : {}),
      },
    }));
    setPresetActivo(preset.id);
  };

  // Evita que el onboarding se reabra solo cada vez que se recargan créditos.
  const onboardingChequeado = useRef(false);

  const chequearOnboarding = async (uid: string) => {
    if (onboardingChequeado.current) return;
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("onboarding_visto")
      .eq("id", uid)
      .single();
    console.log('[onboarding]', { uid, data, error });
    // Solo consumimos el intento si la query respondió; si falla, se reintenta.
    if (error || !data) return;
    onboardingChequeado.current = true;
    // Las filas anteriores al ALTER TABLE quedaron en NULL, no en false.
    if (data.onboarding_visto !== true) setMostrarOnboarding(true);
  };

  const cerrarOnboarding = async () => {
    setMostrarOnboarding(false);
    if (!userId) return;
    await (supabase as any).from("profiles").update({ onboarding_visto: true }).eq("id", userId);
  };

  const cargarCreditos = async (uid: string): Promise<number | null> => {
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("creditos, plan")
      .eq("id", uid)
      .single();
    const valor = error || !data ? null : (data.creditos ?? null);
    setCreditos(valor);
    setPlan(error || !data ? null : (data.plan ?? null));
    return valor;
  };

  const refrescarSesion = async (): Promise<{ userId: string | null; creditos: number | null }> => {
    const { data } = await supabase.auth.getSession();
    const usuario = data.session?.user ?? null;
    setUserId(usuario?.id ?? null);
    setEmail(usuario?.email ?? null);
    if (!usuario) {
      setCreditos(null);
      setPlan(null);
      return { userId: null, creditos: null };
    }
    const c = await cargarCreditos(usuario.id);
    void chequearOnboarding(usuario.id);
    return { userId: usuario.id, creditos: c };
  };

  const cerrarSesion = async () => {
    setMenuUsuario(false);
    await supabase.auth.signOut();
    // Volver al estado no logueado; la herramienta sigue explorable, pero al
    // generar se pedirá login de nuevo.
    setUserId(null);
    setEmail(null);
    setCreditos(null);
    setPlan(null);
    setVista("generar");
    setRefrescarHistorial(0);
    setSinCreditos(false);
    setMostrarPlanes(false);
    setMostrarOnboarding(false);
    onboardingChequeado.current = false;
  };

  useEffect(() => {
    void refrescarSesion();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const usuario = session?.user ?? null;
      setUserId(usuario?.id ?? null);
      setEmail(usuario?.email ?? null);
      if (usuario) { void cargarCreditos(usuario.id); void chequearOnboarding(usuario.id); }
      else { setCreditos(null); setPlan(null); }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Entrada desde la landing con ?login=1: abre el modal de sesión al llegar.
  // No activa generarTrasLogin — el usuario solo quiere entrar, no generar.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") !== "1") return;
    setGenerarTrasLogin(false);
    setMostrarAuth(true);
    // Limpia el parámetro para que un refresco no reabra el modal.
    params.delete("login");
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, []);

  const actualizarCampo = (campo: CampoPrompt, valor: string) => {
    setValoresPorTab((actual) => {
      const previo = actual[tabActiva][campo.id];
      const siguiente = { ...actual[tabActiva] };
      if (campo.tipo === "pills") {
        const lista = Array.isArray(previo) ? previo : [];
        const existe = lista.includes(valor);
        siguiente[campo.id] = existe ? lista.filter((item) => item !== valor) : campo.max && lista.length >= campo.max ? lista : [...lista, valor];
      } else {
        siguiente[campo.id] = valor;
      }
      return { ...actual, [tabActiva]: siguiente };
    });
  };

  const analizarImagen = async (imageDataUrl: string) => {
    if (!(["remodelacion", "planta", "sketch"] as TabId[]).includes(tabActiva)) return;

    setAnalizando((actual) => ({ ...actual, [tabActiva]: true }));
    setDescripcionIA((actual) => ({ ...actual, [tabActiva]: false }));
    setErrorAnalisis("");
    // Imagen nueva: el origen anterior ya no vale hasta que llegue la clasificación.
    setTipoOrigen("otro");

    try {
      const { data, error: functionError } = await supabase.functions.invoke("analyze-architectural-image", {
        body: { tab: tabActiva, imageDataUrl },
      });

      if (functionError) {
        setErrorAnalisis(await extraerMensajeErrorAnalisis(functionError));
        return;
      }

      if (!data?.descripcion) {
        setErrorAnalisis(mensajeErrorAnalisis);
        return;
      }

      // Clasificación del origen. Si la respuesta no la trae, queda en "otro"
      // y el prompt sale sin prefijo: nunca se asume "sketch".
      setTipoOrigen(normalizarOrigen(data?.tipoImagen));

      actualizarCampo({ id: "descripcion", etiqueta: "Descripción", tipo: "textarea" }, data.descripcion);
      setDescripcionIA((actual) => ({ ...actual, [tabActiva]: true }));
    } catch (error) {
      setErrorAnalisis(await extraerMensajeErrorAnalisis(error));
    } finally {
      setAnalizando((actual) => ({ ...actual, [tabActiva]: false }));
    }
  };

  const actualizarArchivo = (campo: CampoPrompt, archivo?: File) => {
    if (!archivo) return;
    actualizarCampo(campo, archivo.name);

    const lector = new FileReader();
    lector.onload = () => {
      setVistasPrevias((actual) => ({
        ...actual,
        [tabActiva]: {
          ...actual[tabActiva],
          [campo.id]: { nombre: archivo.name, url: String(lector.result || "") },
        },
      }));
      // Subir una imagen base nueva descarta la iteración anterior: la base vuelve
      // a ser la original y el panel de resultados queda vacío.
      if (campo.id === "imagen") {
        setImagenRenders((actual) => ({ ...actual, [tabActiva]: "" }));
        setPiezas({});
        setModoGrid(null);
        setPiezaVisor(null);
        setErrorRender("");
      }
      void analizarImagen(String(lector.result || ""));
    };
    lector.readAsDataURL(archivo);
  };

  /** true si el usuario todavía no tiene ninguna generación guardada. */
  const esPrimeraGeneracion = async (uid: string): Promise<boolean> => {
    const { count, error } = await supabase
      .from("renders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", uid);
    // Ante un fallo de conteo, se asume que NO es la primera: sin cadena y sin regalar piezas.
    if (error) {
      console.warn("[cadena] No se pudo contar renders, se omite la cadena:", error.message);
      return false;
    }
    return (count ?? 0) === 0;
  };

  /**
   * Tras la pieza 1, genera las tres piezas restantes en cadena (secuencial).
   * Cada una viaja con piezaAdicional: true; la Edge Function revalida contra la
   * base antes de saltarse el cobro, así que el flag por sí solo no regala nada.
   * Un fallo se muestra en su celda y no corta las siguientes.
   */
  /**
   * Genera una pieza por representación seleccionada, en secuencia.
   * A diferencia de la cadena de la primera generación, aquí NO va
   * piezaAdicional: cada pieza cobra su crédito.
   * Un fallo se muestra en su celda y no corta las siguientes.
   */
  const ejecutarTanda = async (promptFinal: string, uidActivo: string | null) => {
    setModoGrid("tanda");
    setCadenaActiva(true);
    setPiezas(Object.fromEntries(selectedRepresentaciones.map((r) => [r, { estado: "cargando" } as EstadoPieza])));

    for (const representacion of selectedRepresentaciones) {
      try {
        const { data, error: functionError } = await supabase.functions.invoke("generate-render", {
          body: {
            prompt: promptFinal,
            imageBase64: imagenBaseActiva,
            originalBase64: imagenOriginal || undefined,
            estilo: valorTexto(valores.estiloDiseno).trim() || undefined,
            representacion: slugRepresentacion(representacion),
            notas: valorTexto(valores.notas).trim() || undefined,
          },
        });

        if (functionError) {
          const status = (functionError as any)?.context?.status;
          setPiezas((actual) => ({
            ...actual,
            [representacion]: { estado: "error", error: status === 402 ? "Sin créditos" : "No se pudo generar" },
          }));
          continue;
        }
        if (!data?.success || !data?.imageBase64) {
          setPiezas((actual) => ({
            ...actual,
            [representacion]: { estado: "error", error: data?.error || "No se pudo generar" },
          }));
          continue;
        }
        const imagen = `data:image/png;base64,${data.imageBase64}`;
        setPiezas((actual) => ({ ...actual, [representacion]: { estado: "ok", imagen } }));
        // La primera que termina ocupa el visor; las siguientes no lo roban.
        setPiezaVisor((actual) => actual ?? { etiqueta: representacion, imagen });
      } catch {
        setPiezas((actual) => ({ ...actual, [representacion]: { estado: "error", error: "Error inesperado" } }));
      }
      // Cada pieza cobró: el contador se refresca sobre la marcha.
      if (uidActivo) await cargarCreditos(uidActivo);
    }

    setCadenaActiva(false);
    setRefrescarHistorial((n) => n + 1);
  };

  /**
   * "¿Y ahora qué?": una pieza más a partir de la imagen del visor, no de la
   * original. Cuesta 1 crédito y se suma al grid con su etiqueta.
   * Con `representacion` la Edge Function usa su prompt fijo; con texto libre
   * se manda el prompt de estilo con la petición concatenada.
   */
  const generarSeguimiento = async (etiqueta: string, opciones: { representacion?: string; peticion?: string }) => {
    if (!imagenVisor || cadenaActiva || generando) return;

    // Lo ya generado pasa al mapa de piezas para que el grid no lo pierda al
    // cambiar de modo (la vista "cadena" arma sus celdas de forma fija).
    if (modoGrid !== "tanda" && imagenRender) {
      setPiezas((actual) => ({ Render: { estado: "ok", imagen: imagenRender }, ...actual }));
    }
    setModoGrid("tanda");
    setPiezas((actual) => ({ ...actual, [etiqueta]: { estado: "cargando" } }));
    setCadenaActiva(true);

    // Sin representación, la Edge Function no lee `notas`: la petición tiene que
    // viajar dentro del propio prompt para que llegue al modelo.
    const base = prompt || construirPrompt(tabActiva, valores, DESCRIPTORES_ORIGEN[tipoOrigen]);
    const promptFinal = opciones.peticion ? `${base} ${opciones.peticion}` : base;

    try {
      const { data, error: functionError } = await supabase.functions.invoke("generate-render", {
        body: {
          prompt: promptFinal,
          imageBase64: imagenVisor,
          originalBase64: imagenOriginal || undefined,
          estilo: valorTexto(valores.estiloDiseno).trim() || undefined,
          representacion: opciones.representacion,
          notas: opciones.peticion || valorTexto(valores.notas).trim() || undefined,
        },
      });

      if (functionError) {
        const status = (functionError as any)?.context?.status;
        setPiezas((actual) => ({
          ...actual,
          [etiqueta]: { estado: "error", error: status === 402 ? "Sin créditos" : "No se pudo generar" },
        }));
      } else if (!data?.success || !data?.imageBase64) {
        setPiezas((actual) => ({ ...actual, [etiqueta]: { estado: "error", error: data?.error || "No se pudo generar" } }));
      } else {
        const imagen = `data:image/png;base64,${data.imageBase64}`;
        setPiezas((actual) => ({ ...actual, [etiqueta]: { estado: "ok", imagen } }));
        // La pieza recién pedida pasa al visor: es lo que el usuario quiso ver.
        setPiezaVisor({ etiqueta, imagen });
      }
    } catch {
      setPiezas((actual) => ({ ...actual, [etiqueta]: { estado: "error", error: "Error inesperado" } }));
    }

    setCadenaActiva(false);
    if (userId) await cargarCreditos(userId);
    setRefrescarHistorial((n) => n + 1);
  };

  const ejecutarCadena = async (promptFinal: string, imagenPieza1: string, original: string, uidActivo: string | null) => {
    setModoGrid("cadena");
    // La pieza 1 abre el visor; las tres siguientes solo entran al grid.
    setPiezaVisor({ etiqueta: "Render", imagen: imagenPieza1 });
    setCadenaActiva(true);
    setPiezas(Object.fromEntries(PIEZAS_CADENA.map((p) => [p.etiqueta, { estado: "cargando" } as EstadoPieza])));

    for (const pieza of PIEZAS_CADENA) {
      try {
        const { data, error: functionError } = await supabase.functions.invoke("generate-render", {
          body: {
            prompt: promptFinal,
            imageBase64: imagenPieza1,
            originalBase64: original || undefined,
            representacion: pieza.representacion,
            piezaAdicional: true,
          },
        });

        if (functionError) {
          const status = (functionError as any)?.context?.status;
          setPiezas((actual) => ({
            ...actual,
            [pieza.etiqueta]: { estado: "error", error: status === 402 ? "Sin créditos" : "No se pudo generar" },
          }));
          continue;
        }
        if (!data?.success || !data?.imageBase64) {
          setPiezas((actual) => ({
            ...actual,
            [pieza.etiqueta]: { estado: "error", error: data?.error || "No se pudo generar" },
          }));
          continue;
        }
        setPiezas((actual) => ({
          ...actual,
          [pieza.etiqueta]: { estado: "ok", imagen: `data:image/png;base64,${data.imageBase64}` },
        }));
      } catch {
        setPiezas((actual) => ({ ...actual, [pieza.etiqueta]: { estado: "error", error: "Error inesperado" } }));
      }
    }

    setCadenaActiva(false);
    if (uidActivo) await cargarCreditos(uidActivo);
    setRefrescarHistorial((n) => n + 1);
  };

  const ejecutarGeneracion = async (uidActivo: string | null) => {
    const fuente = DESCRIPTORES_ORIGEN[tipoOrigen];
    const promptFinal = construirPrompt(tabActiva, valores, fuente);
    setPrompt(promptFinal);

    setErrorRender("");
    setImagenRenders((actual) => ({ ...actual, [tabActiva]: "" }));
    setPiezas({});
    setModoGrid(null);
    setPiezaVisor(null);
    setGenerando(true);

    // Se consulta ANTES de generar: después de la pieza 1 el conteo ya sería 1.
    const primera = uidActivo ? await esPrimeraGeneracion(uidActivo) : false;

    // La primera generación manda: corre su cadena de 4 piezas por 1 crédito e
    // ignora las representaciones seleccionadas. Los dos modos no se mezclan.
    if (!primera && selectedRepresentaciones.length > 0) {
      setGenerando(false);
      await ejecutarTanda(promptFinal, uidActivo);
      return;
    }

    try {
      // Fuente de verdad: se itera desde la base activa (último render u original),
      // pero el original real siempre viaja aparte para el historial (antes/después).
      const imageBase64 = imagenBaseActiva;
      // Esta rama solo corre en la primera generación o sin representaciones
      // seleccionadas; en ambos casos va el prompt de estilo, sin representación.
      const representacion = undefined;
      console.log("representacion enviada:", representacion);
      const { data, error: functionError } = await supabase.functions.invoke("generate-render", {
        body: {
          prompt: promptFinal,
          imageBase64,
          originalBase64: imagenOriginal || undefined,
          estilo: valorTexto(valores.estiloDiseno).trim() || undefined,
          representacion,
          // En modo estilo las notas ya vienen dentro de promptFinal; se mandan
          // aparte para que la Edge Function las concatene al prompt fijo de representación.
          notas: valorTexto(valores.notas).trim() || undefined,
        },
      });

      if (functionError) {
        const status = (functionError as any)?.context?.status;
        // 401: sesión inválida/ausente → abrir login y reintentar tras autenticarse
        if (status === 401) {
          setGenerarTrasLogin(true);
          setMostrarAuth(true);
          return;
        }
        // 402: sin créditos → mostrar planes y refrescar contador
        if (status === 402) {
          setSinCreditos(true);
          setMostrarPlanes(true);
          if (uidActivo) await cargarCreditos(uidActivo);
          return;
        }
        setErrorRender(await extraerErrorRender(functionError));
        return;
      }

      if (!data?.success || !data?.imageBase64) {
        setErrorRender(data?.error || mensajeErrorRender);
        return;
      }

      const imagenPieza1 = `data:image/png;base64,${data.imageBase64}`;
      setComparacion("despues");
      setImagenRenders((actual) => ({ ...actual, [tabActiva]: imagenPieza1 }));

      // El crédito ya lo descontó la Edge Function; recargamos el valor real desde profiles
      if (uidActivo) await cargarCreditos(uidActivo);

      // Refrescar el historial para que aparezca el render recién generado
      setRefrescarHistorial((n) => n + 1);

      // Primera generación: tres piezas más en cadena, sin cobro adicional.
      // Sin await, para que la pieza 1 se vea ya y las demás lleguen progresivamente.
      if (primera) {
        void ejecutarCadena(promptFinal, imagenPieza1, imagenOriginal, uidActivo);
      }
    } catch (error) {
      console.error("generarRender error", error);
      setErrorRender(mensajeErrorRender);
    } finally {
      setGenerando(false);
    }
  };

  const generarRender = async () => {
    if (generando) return;

    const faltante = tab.campos.find((campo) => campo.requerido && !valorTexto(valores[campo.id]).trim());
    if (faltante) {
      setError(`Completa el campo: ${faltante.etiqueta}`);
      return;
    }
    setError("");
    setSinCreditos(false);

    // Sin sesión → abrir modal y continuar tras autenticarse
    if (!userId) {
      setGenerarTrasLogin(true);
      setMostrarAuth(true);
      return;
    }

    // Con sesión pero sin créditos → mostrar planes
    if (typeof creditos === "number" && creditos <= 0) {
      setSinCreditos(true);
      setMostrarPlanes(true);
      return;
    }

    await ejecutarGeneracion(userId);
  };

  const handleAuthSuccess = async () => {
    setMostrarAuth(false);
    const { userId: uid, creditos: c } = await refrescarSesion();

    if (!generarTrasLogin) return;
    setGenerarTrasLogin(false);

    if (!uid) return;
    if (typeof c === "number" && c <= 0) {
      setSinCreditos(true);
      setMostrarPlanes(true);
      return;
    }
    await ejecutarGeneracion(uid);
  };

  const copiarTexto = async (texto: string, tipo: "prompt" | string) => {
    if (!texto) return;
    await navigator.clipboard.writeText(texto);
    if (tipo === "prompt") {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } else {
      setCopiadoAnalisis(tipo);
      setTimeout(() => setCopiadoAnalisis(""), 1800);
    }
  };

  const nuevoPrompt = () => {
    setValoresPorTab({ nueva: estadoInicial("nueva"), remodelacion: estadoInicial("remodelacion"), planta: estadoInicial("planta"), sketch: estadoInicial("sketch") });
    setVistasPrevias({ nueva: {}, remodelacion: {}, planta: {}, sketch: {} });
    setAnalizando({ nueva: false, remodelacion: false, planta: false, sketch: false });
    setDescripcionIA({ nueva: false, remodelacion: false, planta: false, sketch: false });
    setPrompt("");
    setError("");
    setErrorAnalisis("");
    setCopiado(false);
    setImagenRenders({ nueva: "", remodelacion: "", planta: "", sketch: "" });
    setErrorRender("");
    setGenerando(false);
    setComparacion("despues");
    // Resultados: sin esto el visor seguía mostrando la generación anterior,
    // porque imagenVisor cae en piezaVisor antes que en imagenRenders.
    setPiezas({});
    setModoGrid(null);
    setPiezaVisor(null);
    setCadenaActiva(false);
    // Selecciones del formulario, para dejarlo como al entrar por primera vez.
    setSelectedRepresentaciones([]);
    setPresetActivo(null);
    valoresPrevios.current = null;
    setTipoOrigen("otro");
    setVerTodosEstilos(false);
    setVerTodasLuces(false);
  };

  // "Continuar desde aquí" (desde el historial): carga el render como base activa y
  // la foto original como original, en la pestaña activa, y va a la vista Generar.
  // Convierte ambas URLs a data-URL ANTES de tocar el estado; si alguna falla, lanza
  // (sin cambios parciales) para que el historial muestre el error.
  const continuarDesde = async (r: { imagen_generada_url: string; imagen_original_url: string | null }) => {
    const generadaData = await urlADataUrl(r.imagen_generada_url);
    const originalData = r.imagen_original_url ? await urlADataUrl(r.imagen_original_url) : generadaData;
    setImagenRenders((actual) => ({ ...actual, [tabActiva]: generadaData }));
    setVistasPrevias((actual) => ({
      ...actual,
      [tabActiva]: {
        ...actual[tabActiva],
        imagen: { nombre: "Desde historial", url: originalData },
      },
    }));
    setComparacion("despues");
    setVista("generar");
  };

  const renderPills = (campo: CampoPrompt, opciones = campo.opciones || []) => (
    <div className="flex flex-wrap gap-2">
      {opciones.map((opcion) => {
        const seleccionado = Array.isArray(valores[campo.id]) && valores[campo.id].includes(opcion);
        return (
            <button key={opcion} type="button" className={`rounded-full border px-4 py-2 text-xs font-bold transition ${seleccionado ? "border-[#EA580C] bg-[#EA580C] text-black" : "border-[hsl(var(--pill-border))] bg-transparent text-foreground hover:border-brand-gold"}`} onClick={() => actualizarCampo(campo, opcion)}>
            {opcion}
          </button>
        );
      })}
    </div>
  );

  const renderAcordeon = (clave: string, titulo: string, contenido: ReactNode, deshabilitado = false) => (
    <div className={`border-t border-brand-border ${deshabilitado ? "pointer-events-none opacity-40" : ""}`} aria-disabled={deshabilitado || undefined}>
      <button type="button" disabled={deshabilitado} onClick={() => toggleAcordeon(clave)} className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left text-sm font-semibold text-brand-gold sm:px-6">
        <span>{titulo}</span>
        <span className="text-base" aria-hidden="true">{acordeones[clave] ? "▾" : "▸"}</span>
      </button>
      {acordeones[clave] && <div className="px-5 pb-5 sm:px-6">{contenido}</div>}
    </div>
  );

  const renderCampo = (campo: CampoPrompt) => {
    if (campo.tipo === "parametrosEspacio") {
      const controles = [
        ["tamanoEspacio", "Tamaño del espacio", tamanosEspacio],
        ["proporcionPlanta", "Proporción de planta", proporcionesPlanta],
        ["alturaTecho", "Altura de techo", alturasTecho],
        ["niveles", "Niveles", nivelesEspacio],
        ["ventanasLuzNatural", "Ventanas y luz natural", ventanasLuzNatural],
      ] as const;

      return (
        <div className="grid gap-4 md:grid-cols-2">
          {controles.map(([id, etiqueta, opciones]) => (
            <label key={id} className="grid gap-2 text-sm font-bold text-brand-gold">
              <span>{etiqueta}</span>
              <select className={clasesControl} value={valorTexto(valores[id])} onChange={(e) => actualizarCampo({ ...campo, id, tipo: "select" }, e.target.value)}>
                {opciones.map((opcion) => <option key={opcion}>{opcion}</option>)}
              </select>
            </label>
          ))}
        </div>
      );
    }

    if (campo.tipo === "parametros") {
      return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ["aspectRatio", "Aspect ratio", relacionesAspecto],
            ["stylize", "Stylize", estilizados],
            ["version", "Version", versiones],
            ["style", "Style", estilosMidjourney],
            ["chaos", "Chaos", caos],
          ].map(([id, etiqueta, opciones]) => (
            <label key={id as string} className="grid grid-cols-[90px_1fr] items-center gap-2 text-xs font-bold text-muted-foreground">
              <span>{etiqueta as string}</span>
              <select className="rounded-md border border-[hsl(var(--input-border))] bg-input px-2 py-2 text-sm text-foreground outline-none focus:border-brand-gold" value={valorTexto(valores[id as string])} onChange={(e) => actualizarCampo({ ...campo, id: id as string, tipo: "select" }, e.target.value)}>
                {(opciones as string[]).map((opcion) => <option key={opcion}>{opcion}</option>)}
              </select>
            </label>
          ))}
          <label className="grid gap-2 text-xs font-bold text-muted-foreground sm:col-span-2 xl:col-span-3">
            <span>Negative prompt (--no)</span>
            <input className={clasesControl} placeholder="Ej: people, text, watermark, blur" value={valorTexto(valores.negativePrompt)} onChange={(e) => actualizarCampo({ ...campo, id: "negativePrompt", tipo: "select" }, e.target.value)} />
          </label>
        </div>
      );
    }

    if (campo.tipo === "archivo" || campo.tipo === "archivoAnalisis") {
      const nombreArchivo = valorTexto(valores[campo.id]);
      const vistaPrevia = vistasPrevias[tabActiva][campo.id];
      return (
        <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-brand-gold bg-background px-4 py-6 text-center transition hover:bg-brand-gold-surface">
            <span className="text-2xl" aria-hidden="true">↑</span>
            <span className="text-sm font-bold text-foreground">Sube tu imagen</span>
            <span className="text-xs text-muted-foreground">Boceto, captura de SketchUp o render existente</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => actualizarArchivo(campo, e.target.files?.[0])} />
          </label>
          <p className="text-xs font-bold text-muted-foreground">La imagen no se envía a ningún servidor — solo se usa como referencia visual local.</p>
          {nombreArchivo && <p className="text-xs font-bold text-foreground">Archivo seleccionado: {nombreArchivo}</p>}
          {vistaPrevia && (imagenVisor && campo.id === "imagen" ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                {(["antes", "despues"] as const).map((modo) => {
                  const activo = comparacion === modo;
                  return (
                    <button key={modo} type="button" onClick={() => setComparacion(modo)} className={`rounded-full border px-4 py-2 text-xs font-bold transition ${activo ? "border-[#EA580C] bg-[#EA580C] text-white" : "border-[hsl(var(--pill-border))] bg-transparent text-foreground hover:border-brand-gold"}`}>
                      {modo === "antes" ? "Antes" : "Después"}
                    </button>
                  );
                })}
              </div>
              <div className="relative">
                <img src={comparacion === "antes" ? vistaPrevia.url : imagenVisor} alt={comparacion === "antes" ? "Imagen original" : etiquetaVisor} className="h-auto max-h-none w-full rounded-[8px] border border-brand-gold object-contain" />
                <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[11px] font-bold text-white">{comparacion === "antes" ? "Original" : etiquetaVisor}</span>
              </div>
              <button type="button" onClick={() => setComparacion(comparacion === "antes" ? "despues" : "antes")} className="flex w-full items-center gap-3 rounded-md border border-brand-border p-2 text-left transition hover:border-brand-gold">
                <img src={comparacion === "antes" ? imagenVisor : vistaPrevia.url} alt="Miniatura" className="h-14 w-14 shrink-0 rounded border border-brand-border object-cover" />
                <span className="text-xs font-bold text-muted-foreground">{comparacion === "antes" ? "Generación" : "Original"}</span>
              </button>
              <a href={imagenVisor} download={`arquirender-${etiquetaVisor.toLowerCase().replace(/\s+/g, "-")}.png`} className="block rounded-md bg-[#EA580C] px-4 py-3 text-center text-sm font-extrabold text-white transition hover:bg-[#c2470a]">Descargar</a>
              <button type="button" onClick={volverAlOriginal} className="block w-full rounded-md border border-brand-border bg-transparent px-4 py-2 text-center text-sm font-bold text-muted-foreground transition hover:border-[#EA580C] hover:text-[#EA580C]">↩ Volver al original</button>
            </div>
          ) : (
            <div className="space-y-3">
              <img src={vistaPrevia.url} alt={`Vista previa local de ${vistaPrevia.nombre}`} className="h-auto max-h-none w-full rounded-[8px] border border-brand-gold object-contain" />
              <div className="border-l-4 border-brand-gold bg-brand-gold-surface p-4 text-sm font-bold leading-relaxed text-foreground">
                Tu imagen está lista. La describiremos automáticamente para generar tu imagen.
              </div>
              {analizando[tabActiva] && (
                <div className="flex items-center gap-3 rounded-md border border-brand-gold/50 bg-brand-gold-surface p-3 text-sm font-bold text-foreground">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-brand-gold" aria-hidden="true" />
                  Analizando imagen con IA...
                </div>
              )}
              {descripcionIA[tabActiva] && <p className="text-xs font-bold text-brand-gold">Descripción generada por IA — puedes editarla</p>}
              {errorAnalisis && <p className="text-xs font-bold text-destructive">{errorAnalisis}</p>}
            </div>
          ))}
        </div>
      );
    }

    if (campo.tipo === "select") {
      return (
        <select className={clasesControl} value={valorTexto(valores[campo.id])} onChange={(e) => actualizarCampo(campo, e.target.value)}>
          {campo.opciones?.map((opcion) => <option key={opcion}>{opcion}</option>)}
        </select>
      );
    }

    if (campo.tipo === "textarea") {
      return <textarea className={`${clasesControl} min-h-32 resize-y leading-relaxed`} placeholder={campo.placeholder || "Añade detalles específicos del proyecto..."} value={valorTexto(valores[campo.id])} onChange={(e) => actualizarCampo(campo, e.target.value)} />;
    }

    if (campo.tipo === "color") return renderPills(campo, coloresDominantes);

    return (
      <div className="space-y-4">
        {campo.id === "materiales" ? (
          <>
            {materialesPorCategoria.map((grupo) => (
              <div key={grupo.categoria}>
                <div className="mb-2 text-xs font-extrabold uppercase tracking-normal text-muted-foreground">{grupo.categoria}</div>
                {renderPills(campo, grupo.opciones)}
              </div>
            ))}
            <input className={clasesControl} placeholder="Otro material (especifica)..." value={valorTexto(valores.materialOtro)} onChange={(e) => actualizarCampo({ id: "materialOtro", etiqueta: "Otro material", tipo: "textarea" }, e.target.value)} />
          </>
        ) : renderPills(campo)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-brand-border bg-card">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))] py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-gold">Generaciones arquitectónicas con IA</div>
              <h1 className="m-0 text-[clamp(28px,4vw,48px)] font-black leading-tight tracking-normal text-foreground">ArquiRender</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {!userId && (
                <button
                  type="button"
                  onClick={() => { setGenerarTrasLogin(false); setMostrarAuth(true); }}
                  className="rounded-md border border-[#EA580C] bg-transparent px-4 py-2 text-xs font-extrabold text-[#EA580C] transition hover:bg-[#EA580C] hover:text-white"
                >
                  Iniciar sesión
                </button>
              )}
              {userId && (
                <div className="inline-flex gap-1 rounded-md border border-brand-border bg-input p-1">
                  <button type="button" onClick={() => setVista("generar")} className={`rounded px-3 py-1.5 text-xs font-bold transition ${vista === "generar" ? "bg-[#EA580C] text-white" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>Generar</button>
                  <button type="button" onClick={() => setVista("historial")} className={`rounded px-3 py-1.5 text-xs font-bold transition ${vista === "historial" ? "bg-[#EA580C] text-white" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>Mi historial</button>
                </div>
              )}
              {userId && creditos !== null && (
                <span className="rounded-md border border-[#EA580C] bg-[#EA580C]/10 px-3 py-2 text-xs font-extrabold text-[#EA580C]">
                  {creditos} {creditos === 1 ? "generación disponible" : "generaciones disponibles"}
                </span>
              )}
              {userId && (
                <div className="relative">
                  <button type="button" onClick={() => setMenuUsuario((v) => !v)} className="flex items-center gap-2 rounded-md border border-[#EA580C]/40 bg-transparent px-3 py-2 text-xs font-bold text-foreground transition hover:border-[#EA580C]" aria-haspopup="menu" aria-expanded={menuUsuario} aria-label="Menú de usuario">
                    <User className="h-4 w-4 text-[#EA580C]" aria-hidden="true" />
                    <span translate="no" className="notranslate hidden max-w-[160px] truncate sm:inline">{email ?? "Mi cuenta"}</span>
                  </button>
                  {menuUsuario && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuUsuario(false)} aria-hidden="true" />
                      <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-md border border-brand-border bg-card shadow-xl" role="menu">
                        <div className="border-b border-brand-border px-4 py-3">
                          <div translate="no" className="notranslate truncate text-xs font-bold text-foreground">{email ?? "Mi cuenta"}</div>
                          <div translate="no" className="notranslate mt-1 text-[11px] font-extrabold uppercase tracking-wide text-[#EA580C]">Plan {plan ?? "free"}</div>
                        </div>
                        {PORTAL_PADDLE_URL && (
                          <a href={PORTAL_PADDLE_URL} target="_blank" rel="noopener noreferrer" onClick={() => setMenuUsuario(false)} className="block w-full px-4 py-3 text-left text-xs font-bold text-foreground transition hover:bg-[#EA580C] hover:text-white" role="menuitem">Gestionar suscripción</a>
                        )}
                        <button type="button" onClick={() => { setMenuUsuario(false); setMostrarOnboarding(true); }} className="block w-full px-4 py-3 text-left text-xs font-bold text-foreground transition hover:bg-[#EA580C] hover:text-white" role="menuitem">Cómo usar tus generaciones</button>
                        <button type="button" onClick={() => { setMenuUsuario(false); setMostrarPlanes(true); }} className="block w-full px-4 py-3 text-left text-xs font-bold text-foreground transition hover:bg-[#EA580C] hover:text-white" role="menuitem">Ver planes</button>
                        <a href="mailto:soporte@arquirender.lat" onClick={() => setMenuUsuario(false)} className="block w-full px-4 py-3 text-left text-xs font-bold text-foreground transition hover:bg-[#EA580C] hover:text-white" role="menuitem">Soporte</a>
                        <button type="button" onClick={cerrarSesion} className="block w-full border-t border-brand-border px-4 py-3 text-left text-xs font-bold text-foreground transition hover:bg-[#EA580C] hover:text-white" role="menuitem">Cerrar sesión</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {vista === "historial" && userId ? (
        <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-7">
          <HistorialRenders userId={userId} refreshSignal={refrescarHistorial} onContinuar={continuarDesde} />
        </main>
      ) : (
      <main className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 py-7 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <section className="overflow-hidden rounded-md border border-brand-border bg-card">
          <div className="px-5 py-5 sm:px-6">
            <h2 className="m-0 text-2xl font-black tracking-normal text-foreground">{tab.titulo}</h2>
          </div>

          {campoPorId("imagen") && (
            <div className="border-t border-brand-border px-5 py-5 sm:px-6">
              {renderCampo(campoPorId("imagen")!)}
            </div>
          )}

          {campoPorId("descripcion") && (
            <div className="border-t border-brand-border px-5 py-5 sm:px-6">
              <label className="mb-3 flex justify-between gap-3 text-sm font-semibold text-brand-gold">
                <span>{campoPorId("descripcion")!.etiqueta}</span>
              </label>
              {renderCampo(campoPorId("descripcion")!)}
            </div>
          )}

          {/* Notas adicionales, justo debajo de la descripción */}
          {campoPorId("notas") && (
            <div className="border-t border-brand-border px-5 py-5 sm:px-6">
              <label className="mb-3 flex justify-between gap-3 text-sm font-semibold text-brand-gold">
                <span>{campoPorId("notas")!.etiqueta}</span>
                <span className="font-bold text-muted-foreground">Opcional</span>
              </label>
              {renderCampo(campoPorId("notas")!)}
            </div>
          )}

          <PresetsRow
            activo={presetActivo}
            onSeleccionar={aplicarPreset}
            transformacion={valorTexto(valores.transformacion)}
            preservar={Array.isArray(valores.preservar) ? valores.preservar : []}
            negativePrompt={valorTexto(valores.negativePrompt)}
            avisarBase={PRESETS.find((p) => p.id === presetActivo)?.base === "original" && !!imagenRender}
            onVolverAlOriginal={volverAlOriginal}
            deshabilitado={repsMandan}
          />

          {/* Estilo y Luz: tarjetas con el mismo formato que las de Láminas. */}
          <div className={`border-t border-brand-border px-5 py-5 sm:px-6 ${claseBloqueo}`} aria-disabled={repsMandan || undefined}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-brand-border bg-input p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-foreground">
                  <span aria-hidden="true">🎨</span>
                  <span>Estilo</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(verTodosEstilos ? estilosDiseno : ESTILOS_DESTACADOS).map((opcion) => {
                    const activo = valorTexto(valores.estiloDiseno) === opcion;
                    return (
                      <button
                        key={opcion}
                        type="button"
                        className={clasePildora(activo)}
                        onClick={() => actualizarCampo({ id: "estiloDiseno", etiqueta: "Estilo", tipo: "select" }, activo ? "" : opcion)}
                      >
                        {opcion}
                      </button>
                    );
                  })}
                </div>
                {!verTodosEstilos && (
                  <button type="button" onClick={() => setVerTodosEstilos(true)} className={claseVerTodos}>
                    Ver todos
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-brand-border bg-input p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-foreground">
                  <span aria-hidden="true">💡</span>
                  <span>Luz</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(verTodasLuces ? [...LUCES, ...LUCES_EXTRA] : LUCES).map((luz) => {
                    const activo = valorTexto(valores.iluminacion) === luz.valor;
                    return (
                      <button
                        key={luz.valor}
                        type="button"
                        // Un segundo clic la apaga: sin luz elegida, el prompt
                        // omite por completo la instrucción de iluminación.
                        className={clasePildora(activo)}
                        onClick={() => actualizarCampo({ id: "iluminacion", etiqueta: "Luz", tipo: "select" }, activo ? "" : luz.valor)}
                      >
                        {luz.etiqueta}
                      </button>
                    );
                  })}
                </div>
                {!verTodasLuces && (
                  <button type="button" onClick={() => setVerTodasLuces(true)} className={claseVerTodos}>
                    Ver todos
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Representaciones: multi-selección con tope. Cada una genera una
              pieza y cuesta un crédito; su prompt fijo reemplaza al de estilo. */}
          <div className="border-t border-brand-border px-5 py-5 sm:px-6">
            <label className="mb-3 flex justify-between gap-3 text-sm font-semibold text-brand-gold">
              <span>Representaciones</span>
              <span className="font-bold text-muted-foreground">
                {repsMandan ? `${selectedRepresentaciones.length} de ${MAX_REPRESENTACIONES}` : "Opcional"}
              </span>
            </label>
            {repsMandan && (
              <p className="-mt-1 mb-3 text-xs text-muted-foreground">
                Las representaciones usan su propia configuración.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {categoriasRepresentacion.map((cat) => (
                <div key={cat.categoria} className="rounded-xl border border-brand-border bg-input p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-foreground">
                    <span aria-hidden="true">{cat.icono}</span>
                    <span>{cat.categoria}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.opciones.map((op) => {
                      const activo = selectedRepresentaciones.includes(op);
                      // Con el tope alcanzado solo se pueden quitar, no añadir.
                      const bloqueado = !activo && selectedRepresentaciones.length >= MAX_REPRESENTACIONES;
                      return (
                        <button
                          key={op}
                          type="button"
                          disabled={bloqueado}
                          aria-pressed={activo}
                          onClick={() => toggleRepresentacion(op)}
                          // El naranja queda reservado a "seleccionada": hover y foco
                          // usan tonos neutros para no simular un tercer estado.
                          className={`rounded-full border px-3 py-2 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-foreground/30 ${activo ? "border-[#EA580C] bg-[#EA580C] text-white" : "border-[hsl(var(--pill-border))] bg-transparent text-foreground hover:border-foreground/40"} ${bloqueado ? "cursor-not-allowed opacity-40 hover:border-[hsl(var(--pill-border))]" : ""}`}
                        >
                          {op}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {renderAcordeon("materiales", "Materiales a aplicar", (
            <div className="space-y-5">
              {campoPorId("materiales") && renderCampo(campoPorId("materiales")!)}
            </div>
          ), repsMandan)}

          <div className={`border-t border-brand-border px-5 py-5 sm:px-6 ${claseBloqueo}`} aria-disabled={repsMandan || undefined}>
            <label className="mb-3 flex justify-between gap-3 text-sm font-semibold text-brand-gold">
              <span>Qué evitar en la generación</span>
              <span className="font-bold text-muted-foreground">Opcional</span>
            </label>
            <input disabled={repsMandan} className={clasesControl} placeholder="Ej: personas, texto, marcas de agua, desenfoque" value={valorTexto(valores.negativePrompt)} onChange={(e) => actualizarCampo({ id: "negativePrompt", etiqueta: "Qué evitar", tipo: "textarea" }, e.target.value)} />
          </div>

          <div className="px-5 pb-6 sm:px-6">
            {error && <div className="mb-3 text-sm font-bold text-destructive">{error}</div>}
            {sinCreditos && (
              <div className="mb-3 rounded-md border border-[#EA580C] bg-[#EA580C]/10 p-4 text-sm">
                <p className="font-bold text-foreground">Ya usaste tus 4 generaciones gratis.</p>
                <button type="button" className="mt-3 rounded-full bg-[#EA580C] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#c2470a]" onClick={() => setMostrarPlanes(true)}>Ver planes</button>
              </div>
            )}
            {(() => {
              const faltan = faltanPara(costoGeneracion, userId, creditos);
              return (
                <button disabled={generando || cadenaActiva || faltan > 0} className="w-full rounded-md border-0 bg-[#EA580C] px-4 py-4 text-base font-bold text-white transition hover:bg-[#c2470a] disabled:cursor-not-allowed disabled:opacity-60" onClick={generarRender}>
                  {generando ? "Generando..." : cadenaActiva ? "Generando piezas…" : faltan > 0 ? textoFaltan(faltan) : `Generar · ${costoGeneracion} ${costoGeneracion === 1 ? "generación" : "generaciones"}`}
                </button>
              );
            })()}
          </div>
        </section>

        <aside className="sticky top-5 rounded-md border border-brand-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="m-0 text-xl font-black tracking-normal text-foreground">Tu generación</h2>
            <span className="text-xs font-bold text-muted-foreground">{prompt.length} caracteres</span>
          </div>
          <button type="button" onClick={nuevoPrompt} className="mb-3 w-full rounded-md bg-[#EA580C] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#c2470a]">+ Nueva generación</button>
          {/* Estado y visor. El prompt ya no vive aquí: va más abajo, tras el
              grid, para que "¿Y ahora qué?" siga al botón Descargar. */}
          {(generando || errorRender || (imagenVisor && !vistasPrevias[tabActiva]?.imagen) || !prompt) && (
            <div className="flex min-h-72 flex-col overflow-wrap-anywhere rounded-md border border-brand-gold bg-input p-4 text-sm leading-relaxed text-foreground">
              {generando ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" aria-hidden="true" />
                  <span className="font-bold text-brand-gold">Generando...</span>
                </div>
              ) : errorRender ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                  <p className="font-bold text-destructive">{errorRender}</p>
                  <button className="rounded-md border border-brand-gold bg-transparent px-4 py-2 text-sm font-extrabold text-brand-gold transition hover:bg-brand-gold hover:text-brand-gold-foreground" onClick={generarRender}>Reintentar</button>
                </div>
              ) : imagenVisor && !vistasPrevias[tabActiva]?.imagen ? (
                <div className="flex flex-1 flex-col gap-3">
                  <img src={imagenVisor} alt={etiquetaVisor} className="h-auto w-full rounded-md border border-brand-gold object-contain" />
                  <a href={imagenVisor} download={`arquirender-${etiquetaVisor.toLowerCase().replace(/\s+/g, "-")}.png`} className="rounded-md bg-[#EA580C] px-4 py-3 text-center text-sm font-extrabold text-white transition hover:bg-[#c2470a]">Descargar</a>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">Completa las opciones y genera tu generación con IA.</div>
              )}
            </div>
          )}
          {/* Siguientes pasos sobre la pieza que está en el visor. */}
          {imagenVisor && (() => {
            const faltan = faltanPara(COSTO_RENDER, userId, creditos);
            const sinSaldo = faltan > 0;
            const ocupado = cadenaActiva || generando;
            const inactivo = sinSaldo || ocupado;
            return (
              <div className="mt-4 rounded-md border border-brand-border p-4">
                <div className="mb-3 text-xs font-extrabold uppercase tracking-wide text-brand-gold">¿Y ahora qué?</div>

                <div className="grid grid-cols-2 gap-2">
                  {SEGUIMIENTOS.map((s) => (
                    <button
                      key={s.representacion}
                      type="button"
                      disabled={inactivo}
                      onClick={() => void generarSeguimiento(s.etiqueta, { representacion: s.representacion })}
                      className="rounded-md border border-brand-border bg-transparent px-3 py-2.5 text-xs font-bold text-foreground transition hover:border-[#EA580C] hover:text-[#EA580C] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-brand-border disabled:hover:text-foreground"
                    >
                      {s.etiqueta}
                    </button>
                  ))}
                </div>

                {sinSaldo && <p className="mt-3 text-[11px] font-bold text-destructive">{textoFaltan(faltan)}</p>}

                {!mostrarLibre ? (
                  <button
                    type="button"
                    onClick={() => setMostrarLibre(true)}
                    className="mt-3 text-[11px] font-bold text-muted-foreground underline transition hover:text-[#EA580C]"
                  >
                    O pídeme otra cosa ▸
                  </button>
                ) : (
                  <div className="mt-3 space-y-2">
                    <input
                      value={textoLibre}
                      onChange={(e) => setTextoLibre(e.target.value)}
                      disabled={inactivo}
                      placeholder={PLACEHOLDERS_LIBRE[indicePlaceholder]}
                      className={`${clasesControl} placeholder:text-muted-foreground/60`}
                    />
                    <button
                      type="button"
                      disabled={inactivo || !textoLibre.trim()}
                      onClick={() => {
                        const peticion = textoLibre.trim();
                        if (!peticion) return;
                        setTextoLibre("");
                        void generarSeguimiento(peticion.slice(0, 40), { peticion });
                      }}
                      className="w-full rounded-md bg-[#EA580C] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#c2470a] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {sinSaldo ? textoFaltan(faltan) : `Generar · ${COSTO_RENDER} generación`}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Grid de piezas. En "cadena" abre con el render base; en "tanda"
              muestra una celda por representación seleccionada. */}
          {modoGrid && Object.keys(piezas).length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-brand-gold">
                  {modoGrid === "cadena"
                    ? "Tu primera generación · 4 piezas"
                    : `${Object.keys(piezas).length} ${Object.keys(piezas).length === 1 ? "pieza" : "piezas"}`}
                </span>
                {cadenaActiva && <span className="text-[11px] font-bold text-muted-foreground">Generando…</span>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(modoGrid === "cadena"
                  ? [{ etiqueta: "Render", estado: { estado: "ok", imagen: imagenRender } as EstadoPieza }, ...PIEZAS_CADENA.map((p) => ({ etiqueta: p.etiqueta, estado: piezas[p.etiqueta] }))]
                  : Object.entries(piezas).map(([etiqueta, estado]) => ({ etiqueta, estado }))
                ).map(({ etiqueta, estado }) => {
                  const listo = estado?.estado === "ok" && !!estado.imagen;
                  const enVisor = listo && piezaVisor?.etiqueta === etiqueta;
                  return (
                  <div
                    key={etiqueta}
                    role={listo ? "button" : undefined}
                    tabIndex={listo ? 0 : undefined}
                    aria-pressed={listo ? enVisor : undefined}
                    onClick={listo ? () => setPiezaVisor({ etiqueta, imagen: estado.imagen! }) : undefined}
                    onKeyDown={listo ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPiezaVisor({ etiqueta, imagen: estado.imagen! }); } } : undefined}
                    className={`relative aspect-square overflow-hidden rounded-md border bg-input transition ${enVisor ? "border-[#EA580C] ring-2 ring-[#EA580C]/40" : "border-brand-border"} ${listo ? "cursor-pointer hover:border-[#EA580C]" : ""}`}
                  >
                    {estado?.estado === "ok" && estado.imagen ? (
                      <img src={estado.imagen} alt={etiqueta} className="h-full w-full object-cover" />
                    ) : estado?.estado === "error" ? (
                      <div className="flex h-full items-center justify-center p-2 text-center text-[11px] font-bold text-destructive">{estado.error}</div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" aria-hidden="true" />
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">{etiqueta}</span>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prompt generado, separado del visor para respetar el orden del panel. */}
          {prompt && (
            <div className="mt-3 overflow-wrap-anywhere whitespace-pre-wrap rounded-md border border-brand-gold bg-input p-4 text-sm leading-relaxed text-foreground">
              {prompt}
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button className="rounded-md border border-brand-gold bg-transparent px-3 py-3 text-sm font-extrabold text-brand-gold transition hover:bg-brand-gold hover:text-brand-gold-foreground" onClick={() => copiarTexto(prompt, "prompt")}>{copiado ? "¡Copiado! ✓" : "Copiar prompt"}</button>
            <button className="rounded-md border border-brand-border bg-input px-3 py-3 text-sm font-extrabold text-foreground transition hover:border-brand-gold hover:text-brand-gold" onClick={nuevoPrompt}>Nuevo prompt</button>
          </div>
        </aside>
      </main>
      )}

      <footer className="border-t border-brand-border py-7 text-center text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <a href="mailto:ayalgoritmo@gmail.com" className="transition hover:text-[#EA580C]">ayalgoritmo@gmail.com</a>
          <span aria-hidden="true">·</span>
          <a href="https://instagram.com/ayalgoritmo" target="_blank" rel="noopener noreferrer" className="transition hover:text-[#EA580C]" translate="no">@ayalgoritmo</a>
        </div>
        <div className="mt-2">© 2026 ArquiRender</div>
      </footer>

      {mostrarAuth && (
        <AuthModal
          onClose={() => { setMostrarAuth(false); setGenerarTrasLogin(false); }}
          onSuccess={handleAuthSuccess}
        />
      )}

      {mostrarPlanes && userId && (
        <PlanesModal userId={userId} onClose={() => setMostrarPlanes(false)} />
      )}

      <OnboardingModal open={mostrarOnboarding} onClose={() => { void cerrarOnboarding(); }} />
    </div>
  );
};

export default GeneradorPromptsArquitectonicos;
