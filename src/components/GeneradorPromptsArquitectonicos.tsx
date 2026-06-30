import { useMemo, useState } from "react";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  caos,
  coloresDominantes,
  descripcionesCamara,
  alturasTecho,
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
const esCampoCamara = (campo: CampoPrompt) => campo.id === "camara" && campo.tipo === "select";

const nombresCamaraSimple: Record<string, string> = {
  "Interior frontal — 24mm f/1.4": "Vista frontal",
  "Perspectiva 3/4 interior — 35mm f/2.8": "Vista en diagonal",
  "Vista de pasillo — 50mm f/2.8": "Vista de pasillo",
  "Fachada exterior — 35mm f/2.8": "Vista de calle / fachada",
  "Vista aérea / axonométrica": "Vista aérea",
  "Detalle de material — 85mm macro": "Detalle de material",
  "Gran angular interior — 16mm f/2.8": "Gran angular",
};

const camposOcultos = ["transformacion", "preservar", "parametros"];

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

const construirPrompt = (tabId: TabId, valores: ValoresFormulario, fuenteImagen = "") => {
  const materialOtro = valorTexto(valores.materialOtro).trim();
  const materiales = [valorLista(valores.materiales, ""), materialOtro].filter(Boolean).join(", ") || "premium ArquiRender retail materials";
  const color = limpiarColor(valores.color) || "warm neutral";
  const notas = valorTexto(valores.notas).trim();

  if (tabId === "sketch") {
    const descripcion = valorTexto(valores.descripcion).trim();
    const origen = fuenteImagen ? `Starting from ${fuenteImagen}. ` : "";
    return `${origen}${valorTexto(valores.transformacion)}.${descripcion ? ` Use this architectural image analysis as reference: ${descripcion}.` : ""} Preserve ${valorLista(valores.preservar, "the exact architectural intent")}. Apply ${materiales} with ${color} tones. Use ${valorTexto(valores.iluminacion)} creating realistic shadows, reflections and depth. ${valorTexto(valores.camara)}. Photorealistic architectural render, high detail, realistic textures, soft global illumination.${notas ? ` ${notas}` : ""} ${parametrosMidjourney(valores, false)}`.replace(/\s+/g, " ").trim();
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

const tiposImagen = [
  { id: "sketch", etiqueta: "Sketch a mano", descriptor: "a hand-drawn architectural sketch" },
  { id: "planta", etiqueta: "Planta arquitectónica", descriptor: "an architectural floor plan" },
  { id: "sketchup", etiqueta: "Captura SketchUp", descriptor: "a SketchUp screenshot" },
  { id: "render", etiqueta: "Render existente", descriptor: "an existing render" },
] as const;

type TipoImagenId = typeof tiposImagen[number]["id"];

const tabsVisibles = tabsPrompt.filter((item) => item.id === "sketch");

const GeneradorPromptsArquitectonicos = () => {
  const [tabActiva, setTabActiva] = useState<TabId>("sketch");
  const [tipoImagen, setTipoImagen] = useState<TipoImagenId>("sketch");
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

  const tab = useMemo(() => tabsPrompt.find((item) => item.id === tabActiva)!, [tabActiva]);
  const valores = valoresPorTab[tabActiva];

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
      void analizarImagen(String(lector.result || ""));
    };
    lector.readAsDataURL(archivo);
  };

  const generarPrompt = () => {
    const faltante = tab.campos.find((campo) => campo.requerido && !valorTexto(valores[campo.id]).trim());
    if (faltante) {
      setError(`Completa el campo: ${faltante.etiqueta}`);
      return;
    }
    setError("");
    const fuente = tiposImagen.find((item) => item.id === tipoImagen)?.descriptor || "";
    setPrompt(construirPrompt(tabActiva, valores, fuente));
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
  };

  const renderPills = (campo: CampoPrompt, opciones = campo.opciones || []) => (
    <div className="flex flex-wrap gap-2">
      {opciones.map((opcion) => {
        const seleccionado = Array.isArray(valores[campo.id]) && valores[campo.id].includes(opcion);
        return (
            <button key={opcion} type="button" className={`rounded-md border px-3 py-2 text-xs font-bold transition ${seleccionado ? "border-[#B8860B] bg-[#B8860B] text-black" : "border-[hsl(var(--pill-border))] bg-card text-[hsl(var(--secondary-foreground))] hover:border-brand-gold"}`} onClick={() => actualizarCampo(campo, opcion)}>
            {opcion}
          </button>
        );
      })}
    </div>
  );

  const renderSelectorCamara = (campo: CampoPrompt) => (
    <div className="grid gap-2">
      {campo.opciones?.map((opcion) => {
        const seleccionado = valorTexto(valores[campo.id]) === opcion;
        return (
          <button key={opcion} type="button" className={`rounded-md border px-3 py-2 text-left transition ${seleccionado ? "border-[#B8860B] bg-[#B8860B] text-black" : "border-[hsl(var(--input-border))] bg-input hover:border-brand-gold"}`} onClick={() => actualizarCampo(campo, opcion)}>
            <span className={`block text-sm font-bold ${seleccionado ? "text-black" : "text-foreground"}`}>{nombresCamaraSimple[opcion] || opcion}</span>
            <span className={`mt-1 block text-[11px] font-semibold leading-snug ${seleccionado ? "text-black/70" : "text-[hsl(var(--brand-muted-gold))]"}`}>{descripcionesCamara[opcion]}</span>
          </button>
        );
      })}
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
            <span className="text-sm font-bold text-foreground">{campo.etiqueta}</span>
            <span className="text-xs text-muted-foreground">Carga local únicamente, sin enviar archivos a ningún servidor</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => actualizarArchivo(campo, e.target.files?.[0])} />
          </label>
          <p className="text-xs font-bold text-muted-foreground">La imagen no se envía a ningún servidor — solo se usa como referencia visual local.</p>
          {nombreArchivo && <p className="text-xs font-bold text-foreground">Archivo seleccionado: {nombreArchivo}</p>}
          {vistaPrevia && (
            <div className="space-y-3">
              <img src={vistaPrevia.url} alt={`Vista previa local de ${vistaPrevia.nombre}`} className="h-auto max-h-none w-full rounded-[8px] border border-brand-gold object-contain" />
              <div className="border-l-4 border-brand-gold bg-brand-gold-surface p-4 text-sm font-bold leading-relaxed text-foreground">
                Tu imagen está lista. La describiremos automáticamente para generar tu render.
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
          )}
        </div>
      );
    }

    if (campo.tipo === "select") {
      if (esCampoCamara(campo)) return renderSelectorCamara(campo);

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
              <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-gold">ArquiRender · Arquitectura</div>
              <h1 className="m-0 text-[clamp(28px,4vw,48px)] font-black leading-tight tracking-normal text-foreground">Generador de Prompts Arquitectónicos</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-md border border-brand-gold bg-transparent px-3 py-2 text-xs font-extrabold text-brand-gold" aria-label="Estado del análisis con IA">
              <Settings className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Análisis IA: Activo ✓</span>
            </div>
          </div>
          <nav className="mt-6 flex gap-6 overflow-x-auto border-b border-brand-border" aria-label="Tipos de prompt">
            {tabsVisibles.map((item) => (
              <button key={item.id} type="button" className={`whitespace-nowrap border-b-[3px] px-0 py-4 text-sm transition ${item.id === tabActiva ? "border-brand-gold font-bold text-foreground" : "border-transparent font-semibold text-muted-foreground hover:text-foreground"}`} onClick={() => { setTabActiva(item.id); setPrompt(""); setError(""); }}>
                {item.etiqueta}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 py-7 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <section className="overflow-hidden rounded-md border border-brand-border bg-card">
          <div className="px-5 py-5 sm:px-6">
            <h2 className="m-0 text-2xl font-black tracking-normal text-foreground">{tab.titulo}</h2>
          </div>

          <div className="border-t border-brand-border px-5 py-5 sm:px-6">
            <label className="mb-3 flex text-sm font-semibold text-brand-gold">
              <span>Tipo de imagen de origen</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {tiposImagen.map((tipo) => {
                const seleccionado = tipoImagen === tipo.id;
                return (
                  <button key={tipo.id} type="button" className={`rounded-md border px-3 py-3 text-sm font-bold transition ${seleccionado ? "border-[#B8860B] bg-[#B8860B] text-black" : "border-[hsl(var(--pill-border))] bg-card text-[hsl(var(--secondary-foreground))] hover:border-brand-gold"}`} onClick={() => setTipoImagen(tipo.id)}>
                    {tipo.etiqueta}
                  </button>
                );
              })}
            </div>
          </div>

          {tab.campos.filter((campo) => !camposOcultos.includes(campo.id)).map((campo, indice) => (
            <div key={`${campo.id}-${indice}`} className="border-t border-brand-border px-5 py-5 sm:px-6">
              {campo.tipo !== "archivo" && campo.tipo !== "archivoAnalisis" && (
                <label className="mb-3 flex justify-between gap-3 text-sm font-semibold text-brand-gold">
                  <span>{campo.etiqueta}</span>
                  {campo.opcional && <span className="font-bold text-muted-foreground">Opcional</span>}
                </label>
              )}
              {renderCampo(campo)}
            </div>
          ))}

          <div className="border-t border-brand-border px-5 py-5 sm:px-6">
            <label className="mb-3 flex justify-between gap-3 text-sm font-semibold text-brand-gold">
              <span>Qué evitar en el render</span>
              <span className="font-bold text-muted-foreground">Opcional</span>
            </label>
            <input className={clasesControl} placeholder="Ej: personas, texto, marcas de agua, desenfoque" value={valorTexto(valores.negativePrompt)} onChange={(e) => actualizarCampo({ id: "negativePrompt", etiqueta: "Qué evitar", tipo: "textarea" }, e.target.value)} />
          </div>

          <div className="px-5 pb-6 sm:px-6">
            {error && <div className="mb-3 text-sm font-bold text-destructive">{error}</div>}
            <button className="w-full rounded-md border-0 bg-foreground px-4 py-4 text-base font-bold text-brand-gold transition hover:bg-[#B8860B] hover:text-black" onClick={generarPrompt}>Generar Render</button>
          </div>
        </section>

        <aside className="sticky top-5 rounded-md border border-brand-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="m-0 text-xl font-black tracking-normal text-foreground">Tu render</h2>
            <span className="text-xs font-bold text-muted-foreground">{prompt.length} caracteres</span>
          </div>
          <div className="min-h-72 overflow-wrap-anywhere whitespace-pre-wrap rounded-md border border-brand-gold bg-input p-4 text-sm leading-relaxed text-foreground">{prompt || "Completa las opciones y genera un prompt optimizado para herramientas de imagen IA."}</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button className="rounded-md border border-brand-gold bg-transparent px-3 py-3 text-sm font-extrabold text-brand-gold transition hover:bg-brand-gold hover:text-brand-gold-foreground" onClick={() => copiarTexto(prompt, "prompt")}>{copiado ? "¡Copiado! ✓" : "Copiar prompt"}</button>
            <button className="rounded-md border border-brand-border bg-input px-3 py-3 text-sm font-extrabold text-foreground transition hover:border-brand-gold hover:text-brand-gold" onClick={nuevoPrompt}>Nuevo prompt</button>
          </div>
        </aside>
      </main>

      <footer className="border-t border-brand-border py-7 text-center text-sm text-muted-foreground">Desarrollado por ArquiRender.lat · arquirender.lat</footer>
    </div>
  );
};

export default GeneradorPromptsArquitectonicos;
