export type TabId = "nueva" | "remodelacion" | "planta" | "sketch";
export type CampoTipo = "select" | "textarea" | "pills" | "color" | "archivo" | "archivoAnalisis" | "parametros" | "parametrosEspacio";

export interface CampoPrompt {
  id: string;
  etiqueta: string;
  tipo: CampoTipo;
  opciones?: string[];
  requerido?: boolean;
  max?: number;
  placeholder?: string;
  opcional?: boolean;
  promptAnalisis?: string;
  instruccion?: string;
}

export interface TabPrompt {
  id: TabId;
  etiqueta: string;
  titulo: string;
  campos: CampoPrompt[];
}

export const tiposEspacio = [
  "Almacén Colineal (sala + comedor + dormitorio)",
  "Colineal Dreams (colchones + lencería de cama)",
  "Cafetería Colineal (recibidor + bar + área de mesas)",
  "Showroom de producto",
  "Local en centro comercial",
  "Tienda de calle / fachada",
];

export const tamanosEspacio = ["Espacio compacto (hasta 60m²)", "Espacio mediano (60–120m²)", "Espacio amplio (120–250m²)", "Gran formato / flagship (+250m²)"];
export const proporcionesPlanta = ["Local angosto y profundo", "Local cuadrado / equilibrado", "Local en L", "Planta abierta irregular", "Esquinero (dos frentes)"];
export const alturasTecho = ["Techo bajo íntimo (2.4–2.8m)", "Techo estándar comercial (3–3.5m)", "Techo alto con gypsum liso (3.5–4.5m)", "Techo alto industrial expuesto (4–6m, vigas y ductos visibles)", "Doble altura / void central (+6m)", "Techo abovedado / artesonado (colonial)", "Techo inclinado con estructura vista (madera o acero)"];
export const nivelesEspacio = ["Un solo nivel / planta libre", "Dos niveles con escalera", "Nivel principal + mezanine", "Planta baja + sótano visible"];
export const ventanasLuzNatural = ["Sin ventanas (local interior de mall)", "Ventanas frontales medianas", "Ventanales de piso a techo", "Skylights / lucernarios en techo", "Claraboya central", "Fachada completamente acristalada"];

export const estilos = [
  "Colonial cálido (molduras, madera, hierro forjado, teja)",
  "Contemporáneo biofílico (vegetación, madera oak, luz natural)",
  "Minimalista premium (negro + dorado + blanco, líneas limpias)",
  "Industrial refinado (concreto, metal negro, vigas expuestas)",
  "Japandi (madera clara, neutros, minimalismo cálido)",
  "Lujo boutique (mármol, terciopelo, iluminación focal)",
  "Tropical moderno (vegetación exuberante, madera, piedra volcánica)",
  "Art Deco (geometría, dorado, mármol negro, simetría)",
  "Neoclásico (columnas, molduras finas, mármol blanco, elegancia)",
  "Wabi-Sabi (imperfección natural, cerámica, lino, madera rústica)",
  "Mediterráneo (blanco, arcos, cerámica, luz cálida)",
  "Boho luxury (texturas mixtas, plantas, dorado, terciopelo)",
];

export const materialesPorCategoria = [
  { categoria: "Maderas", opciones: ["Oak clara", "Nogal oscuro", "Pino natural", "Cedro", "Bambú", "Madera blanca lacada"] },
  { categoria: "Metales", opciones: ["Metal negro mate", "Metal blanco", "Aluminio cepillado", "Acero inoxidable", "Cobre", "Bronce", "Dorado", "Hierro forjado"] },
  { categoria: "Piedras y cemento", opciones: ["Mármol blanco", "Mármol negro", "Travertino", "Piedra natural", "Granito", "Terrazo", "Concreto pulido", "Ladrillo visto", "Estuco", "Enlucido", "Pintura"] },
  { categoria: "Textiles y acabados", opciones: ["Terciopelo", "Lino", "Tejido boucle", "Cuero natural", "Cuero eco", "Tela gris perla", "Lacado mate"] },
  { categoria: "Vidrios y fachada", opciones: ["Muro cortina de vidrio", "Vidrio templado"] },
];

export const estilosDiseno = ["Moderno", "Minimalista", "Industrial", "Contemporáneo", "Brutalista", "Bauhaus", "Art Deco", "Orgánico", "Paramétrico", "Neoclásico", "Mediterráneo", "Rústico"];

export const arquitectosReferencia = ["Zaha Hadid", "Frank Gehry", "Le Corbusier", "Mies van der Rohe", "Tadao Ando", "Luis Barragán", "Norman Foster", "Renzo Piano", "Kengo Kuma", "David Chipperfield", "Oscar Niemeyer"];

export const materiales = materialesPorCategoria.flatMap((grupo) => grupo.opciones);

export const coloresDominantes = [
  "⬜ Blanco roto",
  "🟫 Beige",
  "🟡 Arena",
  "🩶 Gris claro",
  "⬛ Gris oscuro",
  "⬛ Negro",
  "🟢 Verde salvia",
  "🟠 Terracota",
  "🔵 Azul marino",
  "🟡 Mostaza",
  "🤍 Crema",
  "🟫 Caramelo",
];

export const zonasEnfoque = [
  "Vista general del espacio",
  "Zona de exhibición de producto",
  "Fachada exterior",
  "Área de bienvenida / recepción",
  "Pasillo de circulación",
  "Vitrina / display de producto",
  "Zona de descanso / lounge",
  "Área de caja / mostrador",
];

export const iluminaciones = [
  "Cálida difusa LED 2700K (ambiente acogedor)",
  "Luz natural diurna cenital suave",
  "Golden hour 17:30h (luz lateral dorada)",
  "Iluminación nocturna artificial",
  "Dramática focal (spots sobre producto)",
  "Luz circular tipo aro LED (estilo Colineal)",
  "Mixta: natural + artificial cálida",
];

export const horasDia = [
  "Mañana 9:00h (luz suave de entrada)",
  "Mediodía 12:00h (luz alta cenital)",
  "Tarde cálida 16:00h",
  "Golden hour 17:30h",
  "Noche (100% artificial)",
];

export const camaras = [
  "Interior frontal — 24mm f/1.4",
  "Perspectiva 3/4 interior — 35mm f/2.8",
  "Vista de pasillo — 50mm f/2.8",
  "Fachada exterior — 35mm f/2.8",
  "Vista aérea / axonométrica",
  "Detalle de material — 85mm macro",
  "Gran angular interior — 16mm f/2.8",
];

export const descripcionesCamara: Record<string, string> = {
  "Interior frontal — 24mm f/1.4": "Vista directa al fondo, ideal para espacios simétricos",
  "Perspectiva 3/4 interior — 35mm f/2.8": "Ángulo diagonal, muestra profundidad y volumen",
  "Vista de pasillo — 50mm f/2.8": "Recorrido lineal, sensación de profundidad",
  "Fachada exterior — 35mm f/2.8": "Vista desde calle, muestra imagen exterior del local",
  "Vista aérea / axonométrica": "Vista desde arriba, muestra distribución completa",
  "Detalle de material — 85mm macro": "Primer plano de textura o acabado específico",
  "Gran angular interior — 16mm f/2.8": "Máxima amplitud, ideal para espacios pequeños",
};

export const camarasReferencia = [
  "Canon EOS 5D Mark IV (arquitectura profesional)",
  "Hasselblad X1D II (editorial de lujo)",
  "Sony α7R IV (alta resolución)",
  "Nikon D750 (interiores cálidos)",
  "Leica Q2 (street / fachada)",
];

export const calidades = [
  "8K fotorrealista · archdaily style",
  "Unreal Engine 5 · ultra detail",
  "Render editorial · high contrast",
  "Fotografía de catálogo premium",
  "Conceptual · moodboard",
  "Corona Renderer · iluminación global",
];

export const biofilicos = [
  "Ninguno",
  "Vegetación colgante",
  "Jardín vertical",
  "Plantas interiores",
  "Luz natural filtrada",
  "Madera vista",
  "Lámina de agua",
  "Piedra natural expuesta",
  "Musgo decorativo",
  "Árbol interior",
];

export const arquitectos = [
  "Sin referencia",
  "Kengo Kuma (materiales naturales + integración)",
  "Zaha Hadid (formas orgánicas + futurismo)",
  "Neri & Hu (industrial + calidez asiática)",
  "Patricia Urquiola (diseño italiano + texturas)",
  "Ilse Crawford (bienestar + confort)",
  "Vincent Van Duysen (minimalismo belga)",
  "Axel Vervoordt (wabi-sabi + antigüedad)",
  "Kelly Wearstler (maximalismo americano)",
  "India Mahdavi (color + formas curvas)",
];

export const relacionesAspecto = ["16:9", "3:2", "4:3", "1:1", "9:16"];
export const estilizados = ["250", "500", "750", "1000"];
export const versiones = ["v6", "v6.1", "v7"];
export const estilosMidjourney = ["raw", "default"];
export const caos = ["0", "10", "25", "50"];

export const conservar = ["Solo la estructura", "Layout actual", "Mobiliario existente", "Piso actual", "Fachada exterior", "Nada — rediseño total"];
export const cambios = ["Actualización de materiales y acabados", "Nueva distribución del espacio", "Cambio de concepto completo", "Actualización de iluminación", "Nueva fachada / imagen exterior", "Incorporar zona de experiencia / lounge"];
export const softwareOrigen = ["AutoCAD (planta DWG/DXF exportada)", "SketchUp (captura de modelo 3D)", "Boceto a mano alzada", "Planta en imagen / foto"];
export const visualizaciones = ["Render interior fotorrealista (perspectiva desde acceso)", "Vista perspectiva 3/4", "Axonometría explotada", "Render exterior desde calle", "Render de pasillo / recorrido", "Vista aérea del espacio", "Walkthrough / recorrido virtual"];
export const transformaciones = ["Boceto a mano → render fotorrealista (preservar arquitectura exacta)", "Render existente → cambiar atmósfera e iluminación", "Captura SketchUp → render realista (mismo layout)", "Imagen referencia → extraer moodboard y paleta", "Render diurno → convertir a nocturno", "Render nocturno → convertir a diurno", "Cambiar materiales manteniendo arquitectura exacta", "Agregar personas / ambientación al espacio"];
export const preservar = ["Arquitectura exacta", "Proporciones", "Layout de mobiliario", "Posición de cámara", "Elementos decorativos", "Distribución de luz", "Composición general"];
export const iluminacionSketch = ["Luz natural diurna suave (sombras difusas, global illumination)", "Noche — lámparas colgantes cálidas 2700K (cozy mood)", "Golden hour lateral (sombras largas, atmósfera cálida)", "Dramática focal (spots sobre producto héroe)", "LED circular tipo aro (estilo Colineal signature)", "Amanecer (luz rosada lateral suave)"];

export const promptAnalisisLocal = "Analiza esta imagen de local comercial Colineal y describe con detalle: materiales actuales visibles (piso, paredes, techo), tipo de iluminación, distribución del mobiliario, estilo actual, colores dominantes y estado general del espacio. Sé específico y técnico.";
export const promptAnalisisPlanta = "Analiza esta planta arquitectónica y describe: dimensiones aproximadas, distribución de zonas, flujo de circulación, accesos, proporción del espacio, orientación de luz natural y elementos estructurales visibles. Identifica las zonas principales y su relación espacial.";
export const promptAnalisisSketch = "Analiza esta imagen de referencia arquitectónica y describe con detalle: geometría del espacio, composición, proporciones, materiales visibles, iluminación, atmósfera, posición de cámara y elementos que deben preservarse para convertirla en un render fotorrealista. Sé específico y técnico.";

const notasNueva = "Ej: logo Colineal en pared, colchones como producto héroe, clientes navegando el espacio, cafetería al fondo...";
const parametros: CampoPrompt = { id: "parametros", etiqueta: "Parámetros técnicos Midjourney", tipo: "parametros" };
const parametrosEspacio: CampoPrompt = { id: "parametrosEspacio", etiqueta: "Parámetros del espacio", tipo: "parametrosEspacio" };

export const tabsPrompt: TabPrompt[] = [
  {
    id: "nueva",
    etiqueta: "Nueva Tienda",
    titulo: "Concepto desde cero",
    campos: [
      { id: "tipoEspacio", etiqueta: "Tipo de espacio", tipo: "select", opciones: tiposEspacio },
      parametrosEspacio,
      { id: "estilo", etiqueta: "Concepto / estilo", tipo: "select", opciones: estilos },
      { id: "materiales", etiqueta: "Materiales", tipo: "pills", opciones: materiales, max: 6 },
      { id: "color", etiqueta: "Color dominante del espacio", tipo: "color", opciones: coloresDominantes },
      { id: "zona", etiqueta: "Zona de enfoque", tipo: "select", opciones: zonasEnfoque },
      { id: "iluminacion", etiqueta: "Iluminación", tipo: "select", opciones: iluminaciones },
      { id: "hora", etiqueta: "Hora del día", tipo: "select", opciones: horasDia },
      { id: "camara", etiqueta: "Vista y cámara", tipo: "select", opciones: camaras },
      { id: "camaraReferencia", etiqueta: "Cámara de referencia", tipo: "select", opciones: camarasReferencia },
      { id: "calidad", etiqueta: "Calidad y render", tipo: "select", opciones: calidades },
      { id: "biofilicos", etiqueta: "Elementos biofílicos", tipo: "pills", opciones: biofilicos, opcional: true },
      { id: "arquitecto", etiqueta: "Arquitecto / referente", tipo: "select", opciones: arquitectos, opcional: true },
      parametros,
      { id: "notas", etiqueta: "Notas adicionales", tipo: "textarea", placeholder: notasNueva, opcional: true },
    ],
  },
  {
    id: "remodelacion",
    etiqueta: "Remodelación",
    titulo: "Transformar local existente",
    campos: [
      { id: "tipoEspacio", etiqueta: "Tipo de espacio", tipo: "select", opciones: tiposEspacio },
      parametrosEspacio,
      { id: "foto", etiqueta: "Sube una foto del local actual (opcional)", tipo: "archivoAnalisis", promptAnalisis: promptAnalisisLocal, instruccion: "Pega este prompt + la foto en ChatGPT o Gemini para obtener la descripción automática del local" },
      { id: "descripcion", etiqueta: "Descripción del local actual", tipo: "textarea", placeholder: "Pega aquí la descripción que generó ChatGPT, o escríbela manualmente: local de 80m², estantería blanca, iluminación fría fluorescente..." },
      { id: "conservar", etiqueta: "Qué conservar", tipo: "pills", opciones: conservar },
      { id: "cambio", etiqueta: "Propuesta de cambio", tipo: "select", opciones: cambios },
      { id: "estilo", etiqueta: "Estilo destino", tipo: "select", opciones: estilos },
      { id: "materiales", etiqueta: "Materiales nuevos", tipo: "pills", opciones: materiales, max: 6 },
      { id: "color", etiqueta: "Color dominante", tipo: "color", opciones: coloresDominantes },
      { id: "iluminacion", etiqueta: "Iluminación destino", tipo: "select", opciones: iluminaciones },
      { id: "camara", etiqueta: "Vista y cámara", tipo: "select", opciones: camaras },
      parametros,
      { id: "notas", etiqueta: "Notas adicionales", tipo: "textarea", opcional: true },
    ],
  },
  {
    id: "planta",
    etiqueta: "Desde Planta",
    titulo: "AutoCAD / SketchUp a render",
    campos: [
      { id: "tipoEspacio", etiqueta: "Tipo de espacio", tipo: "select", opciones: tiposEspacio },
      parametrosEspacio,
      { id: "archivo", etiqueta: "Sube planta AutoCAD, captura SketchUp o boceto (opcional)", tipo: "archivoAnalisis", promptAnalisis: promptAnalisisPlanta, instruccion: "Pega este prompt + la imagen en ChatGPT o Gemini" },
      { id: "descripcion", etiqueta: "Descripción de la planta", tipo: "textarea", placeholder: "Pega la descripción generada por ChatGPT, o escribe: planta rectangular 12×8m, zona exhibición al frente, bodega al fondo, 2 accesos, altura libre 3.5m..." },
      { id: "software", etiqueta: "Software de origen", tipo: "select", opciones: softwareOrigen },
      { id: "visualizacion", etiqueta: "Tipo de visualización destino", tipo: "select", opciones: visualizaciones },
      { id: "estilo", etiqueta: "Estilo arquitectónico", tipo: "select", opciones: estilos },
      { id: "materiales", etiqueta: "Materiales", tipo: "pills", opciones: materiales, max: 6 },
      { id: "color", etiqueta: "Color dominante", tipo: "color", opciones: coloresDominantes },
      { id: "iluminacion", etiqueta: "Iluminación", tipo: "select", opciones: iluminaciones },
      { id: "camara", etiqueta: "Vista y cámara", tipo: "select", opciones: camaras },
      parametros,
      { id: "notas", etiqueta: "Notas adicionales", tipo: "textarea", opcional: true },
    ],
  },
  {
    id: "sketch",
    etiqueta: "Sketch → Render",
    titulo: "Transformación de imagen",
    campos: [
      { id: "imagen", etiqueta: "Sube boceto, captura SketchUp o render existente", tipo: "archivoAnalisis", promptAnalisis: promptAnalisisSketch, instruccion: "Pega este prompt + la imagen en ChatGPT o Gemini para obtener una descripción técnica de la referencia" },
      { id: "descripcion", etiqueta: "Descripción generada / editable", tipo: "textarea", placeholder: "La IA analizará tu imagen y escribirá aquí una descripción arquitectónica editable..." },
      { id: "transformacion", etiqueta: "Tipo de transformación", tipo: "select", opciones: transformaciones },
      { id: "preservar", etiqueta: "Qué preservar", tipo: "pills", opciones: preservar },
      { id: "materiales", etiqueta: "Materiales a aplicar", tipo: "pills", opciones: materiales, max: 6 },
      { id: "color", etiqueta: "Color dominante", tipo: "color", opciones: coloresDominantes },
      { id: "iluminacion", etiqueta: "Iluminación destino", tipo: "select", opciones: iluminacionSketch },
      { id: "camara", etiqueta: "Vista y cámara", tipo: "select", opciones: camaras },
      parametros,
      { id: "notas", etiqueta: "Notas adicionales", tipo: "textarea", opcional: true },
    ],
  },
];

export const ejemplosPrompt = [
  { titulo: "Dreams bedroom", texto: "Photorealistic architectural render, Colineal Dreams interior, colchones hero product display, spa-sanctuary aesthetic, warm oak materiality, biophilic elements, soft 2700K ambient lighting..." },
  { titulo: "Almacén sala", texto: "Photorealistic interior, Colineal almacén showroom, living room + dining display, contemporáneo biofílico style, oak wood floor, hanging vegetation, warm golden lighting..." },
  { titulo: "Fachada colonial", texto: "Exterior architectural photography, Colineal store facade, colonial cálido style, white stucco + wood molduras + iron details, afternoon light, Canon EOS 5D 35mm..." },
];
