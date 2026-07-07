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
    const ts = Date.now();
    const bucket = service.storage.from("renders");

    // 1) Subir la imagen generada
    const generada = parsearImagen(generadaBase64);
    const rutaGenerada = `${userId}/${ts}.png`;
    const { error: errGen } = await bucket.upload(rutaGenerada, generada.bytes, {
      contentType: generada.mime,
      upsert: true,
    });
    if (errGen) {
      console.error("[generate-render] Error subiendo render generado:", errGen.message);
      return;
    }
    const imagenGeneradaUrl = bucket.getPublicUrl(rutaGenerada).data.publicUrl;

    // 2) Subir la imagen de referencia si existe (opcional, no bloqueante)
    let imagenOriginalUrl: string | null = null;
    if (original) {
      const rutaOriginal = `${userId}/${ts}_original.png`;
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

    // 3) Insertar la fila del historial
    const { error: errInsert } = await service.from("renders").insert({
      user_id: userId,
      imagen_generada_url: imagenGeneradaUrl,
      imagen_original_url: imagenOriginalUrl,
      prompt,
      estilo,
    });
    if (errInsert) {
      console.error("[generate-render] Error insertando fila en renders:", errInsert.message);
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
    const body = await req.json().catch(() => null) as { prompt?: string; imageBase64?: string; estilo?: string } | null;
    const prompt = body?.prompt?.trim();
    const imageBase64 = body?.imageBase64?.trim();
    const estilo = body?.estilo?.trim() || null;

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
