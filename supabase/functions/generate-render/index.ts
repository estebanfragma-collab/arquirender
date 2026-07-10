import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENAI_GENERATIONS_URL = "https://api.openai.com/v1/images/generations";
const OPENAI_EDITS_URL = "https://api.openai.com/v1/images/edits";
const MODEL = "gpt-image-2";
const SIZE = "1536x1024"; // horizontal, apto para arquitectura
const QUALITY = "medium";

// Prompts por tipo de representación (inglés, para GPT Image). Si llega
// "representacion" en el body, su prompt reemplaza al prompt de estilo normal.
const PROMPTS_REPRESENTACION: Record<string, string> = {
  nocturno: "Convert the daytime scene into a moody nighttime shot. bright moon as the primary light source from window unvisible in the scene, soft rim light outlining objects. Warm interior lights contrasting with cool moonlight tones. Add slight atmospheric haze or moisture for a cinematic feel. Realistic shadows, natural night white balance, high quality, dramatic cinematic look.",
  dia_lluvioso: "Change the scene to a rainy day. Overcast sky, soft diffused light, wet surfaces, realistic rain outside the windows, subtle reflections on the ground, moody atmosphere, natural lighting, photorealistic render.",
  vista_lateral: "Move the camera all the way to the right; show objects from a right-side perspective.",
  vista_aerea_dron: "Move the camera to a high drone viewpoint above the scene, revealing a large surrounding environment around the project. Keep the main object clearly visible while preserving original frame proportions and composition.",
  close_up: "Create a beautiful closeup shot showing one of the detail of this image, use depth of field to blur, add bokeh, show details on focus, add some detailed, small objects.",
  macro_close_up: "Extreme macro close-up of a material surface from the scene, revealing fine texture and realistic imperfections, with surrounding objects softly visible in the background, cinematic macro photography with shallow depth of field.",
  actividad_close_up: "Close-up of everyday activity within the environment, natural interaction and cinematic depth of field.",
  axonometrico: "Create a 3D cross-section in axonometric ortographic projection, visible from top 3/4.",
  design_board: "Create a high-end editorial design presentation board based on the provided project. Do not redesign the project - only present it in a premium portfolio style. The board should include: one large dominant isometric cut-away axonometric view as the focal point, a front elevation of the main wall with subtle dimensions, a secondary elevation highlighting materials and finishes, curated material swatches arranged aesthetically, minimal but elegant annotations, clear visual hierarchy and negative space. Style: modern editorial layout, Behance premium presentation style, minimal Scandinavian mood, soft beige and warm wood palette, thin architectural linework, clean sans-serif typography, luxury interior design sheet.",
  lamina_presentacion: "Transform the provided render into a premium architectural presentation board (lámina de presentación) while preserving 100% of the original design, furniture, materials, lighting, proportions and composition. The board must include: one large isometric cut-away axonometric view of the space as the main hero element; a single front elevation; a curated material palette with labeled swatches (wood, stone, fabric, metal, concrete); design notes and key features. IMPORTANT: All text labels, titles and annotations must be written in SPANISH (e.g. 'Vista Axonométrica', 'Elevación Frontal', 'Paleta de Materiales', 'Notas de Diseño', 'Características Clave'). Do NOT include any floor plan or top-down plan view. Do NOT include any numerical dimensions, measurements, scales or numeric annotations of any kind. Use a refined Swiss editorial grid layout, minimalist typography, off-white paper background, warm beige and soft gray palette, generous white space, ArchDaily and Behance publication quality. Photorealistic premium presentation board, professional architectural documentation, highly detailed.",
  moodboard: "Create a high-end interior design material moodboard using only the materials present in the 3D scene. Arrange the samples in an artistic, layered composition similar to luxury architectural boards, with realistic textures, shadows, and soft studio lighting. Include stone, wood, fabric, metal, and color swatches exactly as they appear in the scene, presented as physical material tiles and samples. Use a refined neutral background, elegant styling, and balanced layout to achieve a premium, photorealistic moodboard aesthetic.",
  maqueta: "Close-up of an architectural mockup model, axonometry view, depth of field, closeup, bokeh, highly detailed scale model of this space, clean materials like white foam board, wood, acrylic, precise miniature windows and structures, placed on a presentation table, soft studio lighting.",
  lugar_abandonado: "Introduce heavy realistic degradation across the entire scene, including strong dirt accumulation, stains, cracks, peeling surfaces, worn edges, material damage, weathering, discoloration, dust and visible aging effects, creating a neglected and deteriorated environment while maintaining the original structure.",
  remodelacion: "Transform the scene into a realistic unfinished construction state, exposing raw concrete, structural surfaces and unpainted materials, with visible construction details such as rough textures, installation elements, exposed edges, dust and natural building imperfections while maintaining original architecture.",
  planta_tecnica: "Transform this interior into an architectural floor plan viewed from directly above (top-down bird's eye view), technical black and white layout showing the spatial organization, walls, furniture placement and circulation from a cenital perspective. Simplified technical linework, clear room arrangement matching the original space. Clean white background. Do not include any numerical dimensions, measurements, scales, or numeric annotations of any kind.",
  elevacion: "Transform this interior into a front architectural elevation drawing (straight-on frontal view) in clean black and white line art, showing the front-facing wall with all cabinetry, openings and built-in architectural details as precise technical linework. Clean white background. Do not include any numerical dimensions, measurements, scales, or numeric annotations of any kind.",
  corte_arquitectonico: "Transform this into a photorealistic architectural section cut (vertical cross-section), as if the space was sliced vertically to reveal interior levels, ceiling heights, furniture and materials in section. Maintain the same layout and design. Professional architectural section drawing. Do not include any numerical dimensions, measurements, scales, or numeric annotations of any kind.",
  detalle_tecnico: "Transform this into a detailed technical drawing sheet with multiple orthographic views: plan (top view), front elevation, side elevation and a section cut, arranged together like a professional technical specification sheet. Clean blueprint/line-art style with material callouts. Do not include any numerical dimensions, measurements, scales, or numeric annotations of any kind.",
  fotografia_real: "Transform this image into a truly photorealistic architectural photograph indistinguishable from a real professional photograph captured with a full-frame camera and premium architectural lens. Eliminate any CGI appearance, rendering aesthetics, artificial shading, procedural textures, fake materials, or digitally generated look. Maintain the exact camera angle, framing, proportions, perspective, and composition. Natural indirect daylight, physically believable lighting with realistic contact shadows, soft penumbras, subtle depth variation. Enhance all materials with maximum realism showing authentic grain, tonal variation, subtle scratches and imperfections. Maintain realistic exposure, balanced highlights and shadows, neutral white balance, authentic color response. Avoid HDR, bloom, oversaturation, artificial sharpness, fake ambient occlusion, or any computer-generated appearance. Ultra-realistic architectural photography, luxury editorial quality, authentic materials, believable shadows, tactile surfaces, true photographic realism, ultra-detailed 8K architectural photograph.",
};

// Palabras conectoras que se ignoran al normalizar la etiqueta a clave.
const STOPWORDS_REPRESENTACION = new Set(["de", "del", "la", "el", "los", "las", "y"]);

// Normaliza la etiqueta que envía el frontend ("Vista aérea de dron") a la
// clave del diccionario ("vista_aerea_dron"): minúsculas, sin tildes, sin conectores.
const slugRepresentacion = (valor: string): string =>
  valor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !STOPWORDS_REPRESENTACION.has(token))
    .join("_");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Acepta base64 crudo o data URL ("data:image/png;base64,...") y devuelve bytes + mime
const parsearImagen = (input: string): { bytes: Uint8Array; mime: string } => {
  let mime = "image/png";
  let base64 = input;

  const match = input.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s);
  if (match) {
    mime = match[1];
    base64 = match[2];
  }

  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return { bytes, mime };
};

// Guarda el render en Storage + tabla renders. Es secundario: si algo falla
// solo se loguea, nunca se rompe el flujo (el usuario ya pagó su crédito).
const guardarHistorial = async (
  service: any,
  userId: string,
  generadaBase64: string,
  original: { bytes: Uint8Array; mime: string } | null,
  prompt: string,
  estilo: string | null,
) => {
  try {
    // Identificador único por render: timestamp + UUID. Evita colisiones entre
    // llamadas en paralelo (variaciones), que antes se pisaban en Storage y
    // abortaban el insert al fallar la subida.
    const unico = `${Date.now()}-${crypto.randomUUID()}`;
    const bucket = service.storage.from("renders");

    // 1) Subir la imagen generada
    const generada = parsearImagen(generadaBase64);
    const rutaGenerada = `${userId}/${unico}.png`;
    const { error: errGen } = await bucket.upload(rutaGenerada, generada.bytes, {
      contentType: generada.mime,
      upsert: true,
    });
    if (errGen) {
      console.error(`[generate-render] Error subiendo render generado (estilo=${estilo}):`, errGen.message);
      return;
    }
    const imagenGeneradaUrl = bucket.getPublicUrl(rutaGenerada).data.publicUrl;

    // 2) Subir la imagen de referencia si existe (opcional, no bloqueante)
    let imagenOriginalUrl: string | null = null;
    if (original) {
      const rutaOriginal = `${userId}/${unico}_original.png`;
      const { error: errOrig } = await bucket.upload(rutaOriginal, original.bytes, {
        contentType: original.mime,
        upsert: true,
      });
      if (errOrig) {
        console.error("[generate-render] Error subiendo imagen original:", errOrig.message);
      } else {
        imagenOriginalUrl = bucket.getPublicUrl(rutaOriginal).data.publicUrl;
      }
    }

    // 3) Insertar la fila del historial (una fila por render/estilo)
    console.log(`[generate-render] Insertando en renders → user=${userId} estilo=${estilo} url=${imagenGeneradaUrl}`);
    const { error: errInsert } = await service.from("renders").insert({
      user_id: userId,
      imagen_generada_url: imagenGeneradaUrl,
      imagen_original_url: imagenOriginalUrl,
      prompt,
      estilo,
    });
    if (errInsert) {
      console.error(`[generate-render] Error insertando fila en renders (estilo=${estilo}):`, errInsert.message);
    } else {
      console.log(`[generate-render] Fila insertada OK en renders (estilo=${estilo})`);
    }
  } catch (e) {
    console.error("[generate-render] Excepción guardando historial:", e);
  }
};

// Devuelve 1 crédito (usado si la generación falla tras haberlo descontado)
const devolverCredito = async (service: any, userId: string) => {
  try {
    const { data, error } = await service.from("profiles").select("creditos").eq("id", userId).single();
    if (error) {
      console.error("[generate-render] Error leyendo créditos para reembolso:", error.message);
      return;
    }
    const actual = data?.creditos ?? 0;
    const { error: errorUpdate } = await service.from("profiles").update({ creditos: actual + 1 }).eq("id", userId);
    if (errorUpdate) {
      console.error("[generate-render] Error reembolsando crédito:", errorUpdate.message);
      return;
    }
    console.log(`[generate-render] Crédito reembolsado a ${userId}`);
  } catch (e) {
    console.error("[generate-render] Excepción reembolsando crédito:", e);
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Método no permitido" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  let service: any = null;
  let userId: string | null = null;
  let creditoDescontado = false;

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return json({ success: false, error: "OPENAI_API_KEY no está configurado" }, 500);

    // 1) Autenticación: extraer y validar el JWT del usuario
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ success: false, error: "Debes iniciar sesión" }, 401);

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return json({ success: false, error: "Debes iniciar sesión" }, 401);
    }
    userId = userData.user.id;

    // 2) Validación del body (antes de descontar, para no cobrar por inputs inválidos)
    const body = await req.json().catch(() => null) as { prompt?: string; imageBase64?: string; estilo?: string; representacion?: string } | null;
    let prompt = body?.prompt?.trim();
    const imageBase64 = body?.imageBase64?.trim();
    const estilo = body?.estilo?.trim() || null;

    // Si llega una representación conocida, su prompt reemplaza al prompt de estilo normal.
    const representacion = body?.representacion?.trim();
    if (representacion) {
      const promptRep = PROMPTS_REPRESENTACION[slugRepresentacion(representacion)];
      if (promptRep) {
        prompt = promptRep;
        console.log(`[generate-render] Usando prompt de representación: ${representacion}`);
      } else {
        console.warn(`[generate-render] Representación desconocida, se ignora: ${representacion}`);
      }
    }

    if (!prompt) return json({ success: false, error: "El prompt es obligatorio" }, 400);

    let parsed: { bytes: Uint8Array; mime: string } | null = null;
    if (imageBase64) {
      try {
        parsed = parsearImagen(imageBase64);
      } catch {
        return json({ success: false, error: "La imagen de referencia no es un base64 válido" }, 400);
      }
    }

    // 3) Verificar y descontar 1 crédito de forma atómica (service role) ANTES de OpenAI
    service = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: rpcData, error: rpcError } = await service.rpc("descontar_credito", { user_id: userId });
    if (rpcError) {
      console.error("[generate-render] Error en descontar_credito:", rpcError.message);
      return json({ success: false, error: "No se pudo verificar tus créditos" }, 500);
    }
    if (rpcData !== true) {
      return json({ success: false, error: "No tienes créditos disponibles" }, 402);
    }
    creditoDescontado = true;

    // 4) Generación de imagen (lógica intacta)
    let response: Response;

    if (parsed) {
      // Edición / image-to-image: preserva la composición de la imagen de referencia
      const ext = (parsed.mime.split("/")[1] || "png").replace("jpeg", "jpg");
      const form = new FormData();
      form.append("model", MODEL);
      form.append("prompt", prompt);
      form.append("size", SIZE);
      form.append("quality", QUALITY);
      form.append("n", "1");
      form.append("image", new Blob([parsed.bytes], { type: parsed.mime }), `reference.${ext}`);

      response = await fetch(OPENAI_EDITS_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
    } else {
      // Texto a imagen
      response = await fetch(OPENAI_GENERATIONS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          prompt,
          size: SIZE,
          quality: QUALITY,
          n: 1,
        }),
      });
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("OpenAI image generation error", response.status, data);
      await devolverCredito(service, userId);
      const mensaje = response.status === 401
        ? "La API Key de OpenAI no es válida. Actualiza OPENAI_API_KEY en Secrets y vuelve a intentar."
        : (data?.error?.message ?? "No se pudo generar la imagen con IA");
      return json({ success: false, error: mensaje }, 502);
    }

    const imagenGenerada = data?.data?.[0]?.b64_json;
    if (!imagenGenerada) {
      await devolverCredito(service, userId);
      return json({ success: false, error: "La IA no devolvió ninguna imagen" }, 502);
    }

    // Guardar en el historial (Storage + tabla). Secundario: no rompe el render.
    await guardarHistorial(service, userId, imagenGenerada, parsed, prompt, estilo);

    return json({ success: true, imageBase64: imagenGenerada });
  } catch (error) {
    console.error("generate-render error", error);
    // Si ya se descontó el crédito y algo falló, devolverlo
    if (creditoDescontado && service && userId) await devolverCredito(service, userId);
    return json({ success: false, error: "Error inesperado al generar la imagen" }, 500);
  }
});
