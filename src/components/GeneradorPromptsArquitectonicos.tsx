import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Settings, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/AuthModal";
import PlanesModal from "@/components/PlanesModal";
import HistorialRenders from "@/components/HistorialRenders";
import VariacionesModal from "@/components/VariacionesModal";
import {
  caos,
  coloresDominantes,
  alturasTecho,
  arquitectosReferencia,
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

const mensajeErrorRender = "No se pudo generar el render, intenta de nuevo";

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

  const estiloDiseno = valorTexto(valores.estiloDiseno).trim();
  const arquitectoRef = valorTexto(valores.arquitectoRef).trim();
  const estiloContexto = [estiloDiseno ? `${estiloDiseno} architectural style` : "", arquitectoRef ? `inspired by the work of ${arquitectoRef}` : ""].filter(Boolean).join(", ");

  if (tabId === "sketch") {
    const descripcion = valorTexto(valores.descripcion).trim();
    const origen = fuenteImagen ? `Starting from ${fuenteImagen}. ` : "";
    const evitar = valorTexto(valores.negativePrompt).trim();
    return `${origen}${valorTexto(valores.transformacion)}.${descripcion ? ` Use this architectural image analysis as reference: ${descripcion}.` : ""} Preserve ${valorLista(valores.preservar, "the exact architectural intent")}. Preserve the exact camera angle, framing and composition of the reference image. Do not change the viewpoint. Apply ${materiales}.${estiloContexto ? ` ${estiloContexto}.` : ""} Use ${valorTexto(valores.iluminacion)} creating realistic shadows, reflections and depth. Photorealistic architectural render, high detail, realistic textures, soft global illumination.${notas ? ` ${notas}` : ""}${evitar ? ` Avoid: ${evitar}.` : ""}`.replace(/\s+/g, " ").trim();
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
  const [acordeones, setAcordeones] = useState<Record<string, boolean>>({ materiales: false, estilo: false, iluminacion: false });
  const [generando, setGenerando] = useState(false);
  const [imagenRender, setImagenRender] = useState("");
  const [errorRender, setErrorRender] = useState("");
  const [comparacion, setComparacion] = useState<"antes" | "despues">("despues");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [menuUsuario, setMenuUsuario] = useState(false);
  const [creditos, setCreditos] = useState<number | null>(null);
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [generarTrasLogin, setGenerarTrasLogin] = useState(false);
  const [sinCreditos, setSinCreditos] = useState(false);
  const [mostrarPlanes, setMostrarPlanes] = useState(false);
  const [vista, setVista] = useState<"generar" | "historial">("generar");
  const [refrescarHistorial, setRefrescarHistorial] = useState(0);
  const [mostrarVariaciones, setMostrarVariaciones] = useState(false);
  const [modoRender, setModoRender] = useState<"estilo" | "representacion">("estilo");
  const [selectedRepresentacion, setSelectedRepresentacion] = useState("");

  const tab = useMemo(() => tabsPrompt.find((item) => item.id === tabActiva)!, [tabActiva]);
  const valores = valoresPorTab[tabActiva];
  const campoPorId = (id: string) => tab.campos.find((campo) => campo.id === id);
  const toggleAcordeon = (clave: string) => setAcordeones((actual) => ({ ...actual, [clave]: !actual[clave] }));

  const cargarCreditos = async (uid: string): Promise<number | null> => {
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("creditos")
      .eq("id", uid)
      .single();
    const valor = error || !data ? null : (data.creditos ?? null);
    setCreditos(valor);
    return valor;
  };

  const refrescarSesion = async (): Promise<{ userId: string | null; creditos: number | null }> => {
    const { data } = await supabase.auth.getSession();
    const usuario = data.session?.user ?? null;
    setUserId(usuario?.id ?? null);
    setEmail(usuario?.email ?? null);
    if (!usuario) {
      setCreditos(null);
      return { userId: null, creditos: null };
    }
    const c = await cargarCreditos(usuario.id);
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
    setVista("generar");
    setRefrescarHistorial(0);
    setSinCreditos(false);
    setMostrarPlanes(false);
  };

  useEffect(() => {
    void refrescarSesion();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const usuario = session?.user ?? null;
      setUserId(usuario?.id ?? null);
      setEmail(usuario?.email ?? null);
      if (usuario) void cargarCreditos(usuario.id);
      else setCreditos(null);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const ejecutarGeneracion = async (uidActivo: string | null) => {
    const fuente = tiposImagen.find((item) => item.id === tipoImagen)?.descriptor || "";
    const promptFinal = construirPrompt(tabActiva, valores, fuente);
    setPrompt(promptFinal);

    setErrorRender("");
    setImagenRender("");
    setGenerando(true);

    try {
      const imageBase64 = vistasPrevias[tabActiva]?.imagen?.url;
      const representacion = modoRender === "representacion" && selectedRepresentacion ? slugRepresentacion(selectedRepresentacion) : undefined;
      console.log("representacion enviada:", representacion);
      const { data, error: functionError } = await supabase.functions.invoke("generate-render", {
        body: {
          prompt: promptFinal,
          imageBase64,
          estilo: valorTexto(valores.estiloDiseno).trim() || undefined,
          representacion,
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

      setComparacion("despues");
      setImagenRender(`data:image/png;base64,${data.imageBase64}`);

      // El crédito ya lo descontó la Edge Function; recargamos el valor real desde profiles
      if (uidActivo) await cargarCreditos(uidActivo);

      // Refrescar el historial para que aparezca el render recién generado
      setRefrescarHistorial((n) => n + 1);
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
    setImagenRender("");
    setErrorRender("");
    setGenerando(false);
    setComparacion("despues");
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

  const renderChipsSimple = (campoId: string, opciones: string[]) => (
    <div className="flex flex-wrap gap-2">
      {opciones.map((opcion) => {
        const seleccionado = valorTexto(valores[campoId]) === opcion;
        return (
          <button key={opcion} type="button" className={`rounded-full border px-4 py-2 text-xs font-bold transition ${seleccionado ? "border-[#EA580C] bg-[#EA580C] text-black" : "border-[hsl(var(--pill-border))] bg-transparent text-foreground hover:border-brand-gold"}`} onClick={() => actualizarCampo({ id: campoId, etiqueta: campoId, tipo: "select" }, seleccionado ? "" : opcion)}>
            {opcion}
          </button>
        );
      })}
    </div>
  );

  const renderAcordeon = (clave: string, titulo: string, contenido: ReactNode) => (
    <div className="border-t border-brand-border">
      <button type="button" onClick={() => toggleAcordeon(clave)} className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left text-sm font-semibold text-brand-gold sm:px-6">
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
            <span className="text-sm font-bold text-foreground">{campo.etiqueta}</span>
            <span className="text-xs text-muted-foreground">Carga local únicamente, sin enviar archivos a ningún servidor</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => actualizarArchivo(campo, e.target.files?.[0])} />
          </label>
          <p className="text-xs font-bold text-muted-foreground">La imagen no se envía a ningún servidor — solo se usa como referencia visual local.</p>
          {nombreArchivo && <p className="text-xs font-bold text-foreground">Archivo seleccionado: {nombreArchivo}</p>}
          {vistaPrevia && (imagenRender && campo.id === "imagen" ? (
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
                <img src={comparacion === "antes" ? vistaPrevia.url : imagenRender} alt={comparacion === "antes" ? "Imagen original" : "Render generado por IA"} className="h-auto max-h-none w-full rounded-[8px] border border-brand-gold object-contain" />
                <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[11px] font-bold text-white">{comparacion === "antes" ? "Original" : "Render"}</span>
              </div>
              <button type="button" onClick={() => setComparacion(comparacion === "antes" ? "despues" : "antes")} className="flex w-full items-center gap-3 rounded-md border border-brand-border p-2 text-left transition hover:border-brand-gold">
                <img src={comparacion === "antes" ? imagenRender : vistaPrevia.url} alt="Miniatura" className="h-14 w-14 shrink-0 rounded border border-brand-border object-cover" />
                <span className="text-xs font-bold text-muted-foreground">{comparacion === "antes" ? "Render" : "Original"}</span>
              </button>
              <a href={imagenRender} download="arquirender.png" className="block rounded-md bg-[#EA580C] px-4 py-3 text-center text-sm font-extrabold text-white transition hover:bg-[#c2470a]">Descargar</a>
            </div>
          ) : (
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
              <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-gold">ArquiRender · Arquitectura</div>
              <h1 className="m-0 text-[clamp(28px,4vw,48px)] font-black leading-tight tracking-normal text-foreground">Generador de Prompts Arquitectónicos</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {userId && (
                <div className="inline-flex gap-1 rounded-md border border-brand-border bg-input p-1">
                  <button type="button" onClick={() => setVista("generar")} className={`rounded px-3 py-1.5 text-xs font-bold transition ${vista === "generar" ? "bg-[#EA580C] text-white" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>Generar</button>
                  <button type="button" onClick={() => setVista("historial")} className={`rounded px-3 py-1.5 text-xs font-bold transition ${vista === "historial" ? "bg-[#EA580C] text-white" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>Mi historial</button>
                </div>
              )}
              {userId && creditos !== null && (
                <span className="rounded-md border border-[#EA580C] bg-[#EA580C]/10 px-3 py-2 text-xs font-extrabold text-[#EA580C]">
                  {creditos} {creditos === 1 ? "render disponible" : "renders disponibles"}
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
                      <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-md border border-brand-border bg-card shadow-xl" role="menu">
                        <button type="button" onClick={cerrarSesion} className="block w-full px-4 py-3 text-left text-xs font-bold text-foreground transition hover:bg-[#EA580C] hover:text-white" role="menuitem">Cerrar sesión</button>
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 rounded-md border border-brand-gold bg-transparent px-3 py-2 text-xs font-extrabold text-brand-gold" aria-label="Estado del análisis con IA">
                <Settings className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Análisis IA: Activo ✓</span>
              </div>
            </div>
          </div>
          {vista === "generar" && (
            <nav className="mt-6 flex gap-6 overflow-x-auto border-b border-brand-border" aria-label="Tipos de prompt">
              {tabsVisibles.map((item) => (
                <button key={item.id} type="button" className={`whitespace-nowrap border-b-[3px] px-0 py-4 text-sm transition ${item.id === tabActiva ? "border-brand-gold font-bold text-foreground" : "border-transparent font-semibold text-muted-foreground hover:text-foreground"}`} onClick={() => { setTabActiva(item.id); setPrompt(""); setError(""); }}>
                  {item.etiqueta}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {vista === "historial" && userId ? (
        <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-7">
          <HistorialRenders userId={userId} refreshSignal={refrescarHistorial} />
        </main>
      ) : (
      <main className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 py-7 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <section className="overflow-hidden rounded-md border border-brand-border bg-card">
          <div className="px-5 py-5 sm:px-6">
            <h2 className="m-0 text-2xl font-black tracking-normal text-foreground">{tab.titulo}</h2>
          </div>

          <div className="border-t border-brand-border px-5 py-5 sm:px-6">
            <div className="inline-flex w-full gap-1 rounded-md border border-brand-border bg-input p-1 sm:w-auto">
              {([["estilo", "Render de Estilo"], ["representacion", "Tipo de Representación"]] as const).map(([modo, etiqueta]) => (
                <button key={modo} type="button" onClick={() => setModoRender(modo)} className={`flex-1 whitespace-nowrap rounded px-4 py-2 text-xs font-bold transition sm:flex-none ${modoRender === modo ? "bg-[#EA580C] text-white" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>
                  {etiqueta}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-brand-border px-5 py-5 sm:px-6">
            <label className="mb-3 flex text-sm font-semibold text-brand-gold">
              <span>Tipo de imagen de origen</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {tiposImagen.map((tipo) => {
                const seleccionado = tipoImagen === tipo.id;
                return (
                  <button key={tipo.id} type="button" className={`rounded-full border px-4 py-2 text-xs font-bold transition ${seleccionado ? "border-[#EA580C] bg-[#EA580C] text-black" : "border-[hsl(var(--pill-border))] bg-transparent text-foreground hover:border-brand-gold"}`} onClick={() => setTipoImagen(tipo.id)}>
                    {tipo.etiqueta}
                  </button>
                );
              })}
            </div>
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

          {modoRender === "estilo" && (
          <>
          {renderAcordeon("materiales", "Materiales a aplicar", (
            <div className="space-y-5">
              {campoPorId("materiales") && renderCampo(campoPorId("materiales")!)}
            </div>
          ))}

          {renderAcordeon("estilo", "Estilo", (
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-xs font-extrabold uppercase tracking-normal text-muted-foreground">Estilo de diseño</div>
                {renderChipsSimple("estiloDiseno", estilosDiseno)}
              </div>
              <div>
                <div className="mb-2 text-xs font-extrabold uppercase tracking-normal text-muted-foreground">Arquitecto de referencia</div>
                {renderChipsSimple("arquitectoRef", arquitectosReferencia)}
              </div>
            </div>
          ))}

          {renderAcordeon("iluminacion", "Iluminación destino", campoPorId("iluminacion") ? renderCampo(campoPorId("iluminacion")!) : null)}

          {campoPorId("notas") && (
            <div className="border-t border-brand-border px-5 py-5 sm:px-6">
              <label className="mb-3 flex justify-between gap-3 text-sm font-semibold text-brand-gold">
                <span>{campoPorId("notas")!.etiqueta}</span>
                <span className="font-bold text-muted-foreground">Opcional</span>
              </label>
              {renderCampo(campoPorId("notas")!)}
            </div>
          )}

          <div className="border-t border-brand-border px-5 py-5 sm:px-6">
            <label className="mb-3 flex justify-between gap-3 text-sm font-semibold text-brand-gold">
              <span>Qué evitar en el render</span>
              <span className="font-bold text-muted-foreground">Opcional</span>
            </label>
            <input className={clasesControl} placeholder="Ej: personas, texto, marcas de agua, desenfoque" value={valorTexto(valores.negativePrompt)} onChange={(e) => actualizarCampo({ id: "negativePrompt", etiqueta: "Qué evitar", tipo: "textarea" }, e.target.value)} />
          </div>
          </>
          )}

          {modoRender === "representacion" && (
            <div className="border-t border-brand-border px-5 py-5 sm:px-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {categoriasRepresentacion.map((cat) => (
                  <div key={cat.categoria} className="rounded-xl border border-brand-border bg-input p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-black text-foreground">
                      <span aria-hidden="true">{cat.icono}</span>
                      <span>{cat.categoria}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.opciones.map((op) => {
                        const activo = selectedRepresentacion === op;
                        return (
                          <button key={op} type="button" onClick={() => setSelectedRepresentacion(activo ? "" : op)} className={`rounded-full border px-3 py-2 text-xs font-bold transition ${activo ? "border-[#EA580C] bg-[#EA580C] text-white" : "border-[hsl(var(--pill-border))] bg-transparent text-foreground hover:border-[#EA580C]"}`}>
                            {op}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-5 pb-6 sm:px-6">
            {error && <div className="mb-3 text-sm font-bold text-destructive">{error}</div>}
            {sinCreditos && (
              <div className="mb-3 rounded-md border border-[#EA580C] bg-[#EA580C]/10 p-4 text-sm">
                <p className="font-bold text-foreground">Ya usaste tus 3 renders gratis.</p>
                <button type="button" className="mt-3 rounded-full bg-[#EA580C] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#c2470a]" onClick={() => setMostrarPlanes(true)}>Ver planes</button>
              </div>
            )}
            <button disabled={generando} className="w-full rounded-md border-0 bg-[#EA580C] px-4 py-4 text-base font-bold text-white transition hover:bg-[#c2470a] disabled:cursor-not-allowed disabled:opacity-60" onClick={generarRender}>{generando ? "Generando render..." : "Generar Render"}</button>
            {userId && vistasPrevias[tabActiva]?.imagen?.url && (
              <button type="button" disabled={generando} className="mt-3 w-full rounded-md border border-[#EA580C] bg-transparent px-4 py-4 text-base font-bold text-[#EA580C] transition hover:bg-[#EA580C] hover:text-white disabled:cursor-not-allowed disabled:opacity-60" onClick={() => setMostrarVariaciones(true)}>Generar variaciones de estilo</button>
            )}
          </div>
        </section>

        <aside className="sticky top-5 rounded-md border border-brand-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="m-0 text-xl font-black tracking-normal text-foreground">Tu render</h2>
            <span className="text-xs font-bold text-muted-foreground">{prompt.length} caracteres</span>
          </div>
          <div className="flex min-h-72 flex-col overflow-wrap-anywhere rounded-md border border-brand-gold bg-input p-4 text-sm leading-relaxed text-foreground">
            {generando ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" aria-hidden="true" />
                <span className="font-bold text-brand-gold">Generando render...</span>
              </div>
            ) : errorRender ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <p className="font-bold text-destructive">{errorRender}</p>
                <button className="rounded-md border border-brand-gold bg-transparent px-4 py-2 text-sm font-extrabold text-brand-gold transition hover:bg-brand-gold hover:text-brand-gold-foreground" onClick={generarRender}>Reintentar</button>
              </div>
            ) : imagenRender && !vistasPrevias[tabActiva]?.imagen ? (
              <div className="flex flex-1 flex-col gap-3">
                <img src={imagenRender} alt="Render generado por IA" className="h-auto w-full rounded-md border border-brand-gold object-contain" />
                <a href={imagenRender} download="arquirender.png" className="rounded-md bg-[#EA580C] px-4 py-3 text-center text-sm font-extrabold text-white transition hover:bg-[#c2470a]">Descargar</a>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{prompt || "Completa las opciones y genera tu render con IA."}</div>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button className="rounded-md border border-brand-gold bg-transparent px-3 py-3 text-sm font-extrabold text-brand-gold transition hover:bg-brand-gold hover:text-brand-gold-foreground" onClick={() => copiarTexto(prompt, "prompt")}>{copiado ? "¡Copiado! ✓" : "Copiar prompt"}</button>
            <button className="rounded-md border border-brand-border bg-input px-3 py-3 text-sm font-extrabold text-foreground transition hover:border-brand-gold hover:text-brand-gold" onClick={nuevoPrompt}>Nuevo prompt</button>
          </div>
        </aside>
      </main>
      )}

      <footer className="border-t border-brand-border py-7 text-center text-sm text-muted-foreground">Desarrollado por ArquiRender.lat · arquirender.lat</footer>

      {mostrarAuth && (
        <AuthModal
          onClose={() => { setMostrarAuth(false); setGenerarTrasLogin(false); }}
          onSuccess={handleAuthSuccess}
        />
      )}

      {mostrarPlanes && userId && (
        <PlanesModal userId={userId} onClose={() => setMostrarPlanes(false)} />
      )}

      {mostrarVariaciones && userId && vistasPrevias[tabActiva]?.imagen?.url && (
        <VariacionesModal
          estilos={estilosDiseno}
          creditosDisponibles={creditos ?? 0}
          imageBase64={vistasPrevias[tabActiva]!.imagen!.url}
          notas={valorTexto(valores.notas)}
          onVerPlanes={() => { setMostrarVariaciones(false); setMostrarPlanes(true); }}
          onCreditosActualizados={async () => {
            if (userId) await cargarCreditos(userId);
            setRefrescarHistorial((n) => n + 1);
          }}
          onClose={() => setMostrarVariaciones(false)}
        />
      )}
    </div>
  );
};

export default GeneradorPromptsArquitectonicos;
