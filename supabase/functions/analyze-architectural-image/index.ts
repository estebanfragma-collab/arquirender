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
        max_tokens: 500,
        messages: [
          { role: "system", content: promptsPorTab[tab] },
          {
            role: "user",
            content: [
              { type: "text", text: "Analiza la imagen adjunta y devuelve únicamente la descripción solicitada." },
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

    const descripcion = data?.choices?.[0]?.message?.content?.trim();
    if (!descripcion) return json({ error: "La IA no devolvió una descripción" }, 502);

    return json({ descripcion });
  } catch (error) {
    console.error("analyze-architectural-image error", error);
    return json({ error: "Error inesperado al analizar la imagen" }, 500);
  }
});
