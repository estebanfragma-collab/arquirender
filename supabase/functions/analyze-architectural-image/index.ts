const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const promptsPorTab = {
  remodelacion: "Eres un arquitecto de interiores especializado en retail. Analiza esta imagen de local comercial y describe en español: materiales visibles (piso, paredes, techo), tipo de iluminación, distribución del mobiliario, estilo actual, colores dominantes y estado general del espacio. Sé técnico y específico. Máximo 150 palabras.",
  planta: "Eres un arquitecto especializado en diseño comercial. Analiza esta planta arquitectónica y describe en español: dimensiones aproximadas, distribución de zonas, flujo de circulación, accesos, proporción del espacio y elementos estructurales visibles. Máximo 150 palabras.",
  sketch: "Eres un arquitecto de interiores especializado en retail. Analiza esta imagen y describe en español con precisión fotográfica: forma del espacio, proporciones, materiales, acabados, iluminación, mobiliario y composición espacial. Esta descripción se usará para generar un render fotorrealista. Máximo 150 palabras.",
} as const;

type TabAnalisis = keyof typeof promptsPorTab;

/** Clasificaciones válidas del origen de la imagen. Cualquier otra cosa cae a "otro". */
const TIPOS_IMAGEN = ["sketch", "sketchup", "render", "otro"] as const;
type TipoImagen = typeof TIPOS_IMAGEN[number];

const normalizarTipoImagen = (valor: unknown): TipoImagen =>
  typeof valor === "string" && (TIPOS_IMAGEN as readonly string[]).includes(valor)
    ? valor as TipoImagen
    : "otro";

// Se añade al prompt de cada tab: además de describir, clasifica el origen.
// El cliente usa esa clasificación para el prefijo del prompt de generación.
const INSTRUCCION_JSON = ` Responde ÚNICAMENTE con un objeto JSON con dos claves:
"descripcion": la descripción pedida arriba, en español, como string.
"tipoImagen": una de estas cuatro palabras exactas, según qué es la imagen:
  "sketch" si es un boceto o dibujo a mano,
  "sketchup" si es una captura de un modelo 3D (SketchUp, Revit, Rhino, similar),
  "render" si ya es un render o una fotografía de un espacio construido,
  "otro" si no encaja con claridad en ninguna de las anteriores.
Ante la duda entre dos categorías, usa "otro".`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) return json({ error: "OPENAI_API_KEY no está configurado" }, 500);

    const body = await req.json().catch(() => null) as { tab?: string; imageDataUrl?: string } | null;
    const tab = body?.tab as TabAnalisis | undefined;
    const imageDataUrl = body?.imageDataUrl;

    if (!tab || !(tab in promptsPorTab)) return json({ error: "Tab de análisis inválido" }, 400);
    if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) return json({ error: "Imagen inválida" }, 400);

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        // Margen sobre las ~150 palabras pedidas para que el envoltorio JSON no trunque.
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: promptsPorTab[tab] + INSTRUCCION_JSON },
          {
            role: "user",
            content: [
              { type: "text", text: "Analiza la imagen adjunta y devuelve el JSON solicitado." },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("OpenAI image analysis error", response.status, data);
      const mensaje = response.status === 401
        ? "La API Key de OpenAI configurada no es válida. Actualiza OPENAI_API_KEY en Secrets y vuelve a intentar."
        : "No se pudo analizar la imagen con IA";
      return json({ error: mensaje }, 502);
    }

    const contenido = data?.choices?.[0]?.message?.content?.trim();
    if (!contenido) return json({ error: "La IA no devolvió una descripción" }, 502);

    // Se espera { descripcion, tipoImagen }. Si el JSON viniera mal formado, se
    // trata el contenido como descripción suelta: la clasificación se pierde,
    // pero el análisis —que es lo que el usuario ve— sigue funcionando.
    let descripcion = contenido;
    let tipoImagen: TipoImagen = "otro";
    try {
      const parseado = JSON.parse(contenido) as { descripcion?: unknown; tipoImagen?: unknown };
      if (typeof parseado?.descripcion === "string" && parseado.descripcion.trim()) {
        descripcion = parseado.descripcion.trim();
        tipoImagen = normalizarTipoImagen(parseado.tipoImagen);
      } else {
        console.warn("[analyze] JSON sin descripcion utilizable, se usa el contenido crudo");
      }
    } catch {
      console.warn("[analyze] La respuesta no era JSON válido, se usa el contenido crudo y tipoImagen=otro");
    }

    console.log(`[analyze] tab=${tab} tipoImagen=${tipoImagen}`);
    return json({ descripcion, tipoImagen });
  } catch (error) {
    console.error("analyze-architectural-image error", error);
    return json({ error: "Error inesperado al analizar la imagen" }, 500);
  }
});
