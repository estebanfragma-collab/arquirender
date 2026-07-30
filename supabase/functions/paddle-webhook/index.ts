import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Mapeo price_id de Paddle → plan y créditos
const PLANES: Record<string, { plan: string; creditos: number }> = {
  pri_01kwpqaed7bev0exm7e51dg1gf: { plan: "starter", creditos: 25 }, // Starter mensual
  pri_01kwpqd823dz1x08cc5rm1zykc: { plan: "starter", creditos: 25 }, // Starter anual
  pri_01kwpr1ar7dajvpb1pfv4eegdn: { plan: "studio", creditos: 100 }, // Studio mensual
  pri_01kwpr2sx5b5yagfqat56pj0y6: { plan: "studio", creditos: 100 }, // Studio anual
  pri_01kwpr67zmk4gg7xr073nxfyjd: { plan: "pro", creditos: 300 },     // Pro mensual
  pri_01kwpr9ds2fett1nwh76x5f15x: { plan: "pro", creditos: 300 },     // Pro anual
};

const textEncoder = new TextEncoder();

const timingSafeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let resultado = 0;
  for (let i = 0; i < a.length; i++) resultado |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return resultado === 0;
};

// Verificación HMAC-SHA256 del header Paddle-Signature ("ts=...;h1=...")
const verificarFirma = async (rawBody: string, signatureHeader: string | null, secret: string): Promise<boolean> => {
  if (!signatureHeader) return false;

  const partes: Record<string, string> = {};
  for (const segmento of signatureHeader.split(";")) {
    const idx = segmento.indexOf("=");
    if (idx === -1) continue;
    partes[segmento.slice(0, idx).trim()] = segmento.slice(idx + 1).trim();
  }

  const ts = partes["ts"];
  const h1 = partes["h1"];
  if (!ts || !h1) return false;

  const signedPayload = `${ts}:${rawBody}`;
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const firma = await crypto.subtle.sign("HMAC", key, textEncoder.encode(signedPayload));
  const computed = Array.from(new Uint8Array(firma)).map((b) => b.toString(16).padStart(2, "0")).join("");

  return timingSafeEqual(computed, h1);
};

const extraerEmail = (data: any): string | null =>
  data?.customer?.email ?? data?.customer_email ?? data?.billing_details?.email ?? data?.email ?? null;

const extraerPriceId = (data: any): string | null => {
  const items = data?.items ?? [];
  for (const item of items) {
    const pid = item?.price?.id ?? item?.price_id;
    if (pid && PLANES[pid]) return pid;
  }
  return null;
};

const ok = (body: unknown = { received: true }) =>
  new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405 });

  try {
    const secret = Deno.env.get("PADDLE_WEBHOOK_SECRET");
    if (!secret) {
      console.error("[paddle-webhook] PADDLE_WEBHOOK_SECRET no configurado");
      return new Response("Configuración incompleta", { status: 500 });
    }

    // Body raw (necesario para verificar firma antes de parsear)
    const rawBody = await req.text();
    const signatureHeader = req.headers.get("Paddle-Signature");

    const firmaValida = await verificarFirma(rawBody, signatureHeader, secret);
    if (!firmaValida) {
      console.error("[paddle-webhook] Firma inválida o ausente");
      return new Response("Firma inválida", { status: 401 });
    }

    const evento = JSON.parse(rawBody);
    const eventType: string = evento?.event_type ?? "";
    const data = evento?.data ?? {};
    console.log("[paddle-webhook] Evento recibido:", eventType);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Idempotencia: registrar el event_id ANTES de procesar. Si el insert choca con la
    // PK (evento ya registrado), significa que ya se procesó → 200 sin acreditar nada.
    const eventId = evento?.event_id ?? null;
    if (eventId) {
      const { error: errorIdem } = await supabase
        .from("webhook_events")
        .insert({ event_id: eventId, event_type: eventType });
      if (errorIdem) {
        if (errorIdem.code === "23505") {
          console.log("[paddle-webhook] Evento ya procesado, se ignora:", eventId);
          return ok({ status: "ya procesado" });
        }
        // Otro error (tabla caída, etc.): loguear y continuar para no perder el pago.
        console.error("[paddle-webhook] Error registrando webhook_event:", errorIdem.message);
      }
    } else {
      console.warn("[paddle-webhook] Evento sin event_id: no se puede deduplicar");
    }

    if (eventType === "subscription.created" || eventType === "transaction.completed") {
      const customUserId = data?.custom_data?.user_id ?? null;
      const email = extraerEmail(data);
      const priceId = extraerPriceId(data);
      const subscriptionId = eventType === "subscription.created"
        ? (data?.id ?? null)
        : (data?.subscription_id ?? null);

      if (!priceId) {
        console.error("[paddle-webhook] No se encontró un price_id conocido en el evento", eventType);
        return ok();
      }

      const plan = PLANES[priceId];

      // Buscar el perfil: primero por custom_data.user_id (enviado desde el checkout),
      // si no está, fallback a búsqueda por email.
      let perfil: { id: string; creditos: number | null } | null = null;
      let metodoBusqueda = "";

      if (customUserId) {
        metodoBusqueda = "custom_data.user_id";
        console.log(`[paddle-webhook] Buscando perfil por ${metodoBusqueda}: ${customUserId}`);
        const { data: encontrado, error: errorPerfil } = await supabase
          .from("profiles")
          .select("id, creditos")
          .eq("id", customUserId)
          .maybeSingle();
        if (errorPerfil) {
          console.error("[paddle-webhook] Error consultando perfil por id:", errorPerfil.message);
          return ok();
        }
        perfil = encontrado;
      } else if (email) {
        metodoBusqueda = "email";
        console.log(`[paddle-webhook] Buscando perfil por ${metodoBusqueda}: ${email}`);
        const { data: encontrado, error: errorPerfil } = await supabase
          .from("profiles")
          .select("id, creditos")
          .eq("email", email)
          .maybeSingle();
        if (errorPerfil) {
          console.error("[paddle-webhook] Error consultando perfil por email:", errorPerfil.message);
          return ok();
        }
        perfil = encontrado;
      } else {
        console.error("[paddle-webhook] No se pudo identificar al usuario: falta custom_data.user_id y email");
        return ok();
      }

      if (!perfil) {
        console.error(`[paddle-webhook] Usuario no encontrado (método ${metodoBusqueda}):`, customUserId ?? email);
        return ok();
      }

      console.log(`[paddle-webhook] Plan detectado: ${plan.plan} — usuario hallado por ${metodoBusqueda}`);

      // Solo transaction.completed acredita créditos (única fuente de verdad).
      // subscription.created solo persiste plan + paddle_subscription_id, sin sumar
      // créditos, para no duplicar la acreditación del mismo pago.
      const acreditar = eventType === "transaction.completed";
      const actualizacion: Record<string, unknown> = { plan: plan.plan };
      if (subscriptionId) actualizacion.paddle_subscription_id = subscriptionId;

      let nuevosCreditos = perfil.creditos ?? 0;
      if (acreditar) {
        nuevosCreditos = (perfil.creditos ?? 0) + plan.creditos;
        actualizacion.creditos = nuevosCreditos;
        console.log(`[paddle-webhook] Acreditando: user_id=${perfil.id} price_id=${priceId} +${plan.creditos} créditos → ${nuevosCreditos} resultantes`);
      } else {
        console.log(`[paddle-webhook] ${eventType}: solo se guarda plan/subscription (sin acreditar) para user_id=${perfil.id}`);
      }

      const { error: errorUpdate } = await supabase
        .from("profiles")
        .update(actualizacion)
        .eq("id", perfil.id);

      if (errorUpdate) {
        console.error("[paddle-webhook] Error actualizando perfil:", errorUpdate.message);
        return ok();
      }

      console.log(`[paddle-webhook] Perfil ${perfil.id} actualizado: ${nuevosCreditos} créditos, plan ${plan.plan}`);
      return ok();
    }

    if (eventType === "subscription.canceled") {
      const subscriptionId = data?.id ?? null;
      if (!subscriptionId) {
        console.error("[paddle-webhook] subscription.canceled sin subscription id");
        return ok();
      }

      const { data: perfil, error: errorPerfil } = await supabase
        .from("profiles")
        .select("id")
        .eq("paddle_subscription_id", subscriptionId)
        .maybeSingle();

      if (errorPerfil) {
        console.error("[paddle-webhook] Error consultando perfil por subscription:", errorPerfil.message);
        return ok();
      }
      if (!perfil) {
        console.error("[paddle-webhook] Usuario no encontrado por paddle_subscription_id:", subscriptionId);
        return ok();
      }

      const { error: errorUpdate } = await supabase
        .from("profiles")
        .update({ plan: "free" })
        .eq("id", perfil.id);

      if (errorUpdate) {
        console.error("[paddle-webhook] Error marcando plan free:", errorUpdate.message);
        return ok();
      }

      console.log(`[paddle-webhook] Suscripción cancelada, perfil ${perfil.id} → plan free`);
      return ok();
    }

    // Evento no manejado: responder 200 para evitar reintentos de Paddle
    console.log("[paddle-webhook] Evento no manejado:", eventType);
    return ok();
  } catch (error) {
    console.error("[paddle-webhook] Error inesperado:", error);
    // 200 para evitar reintentos infinitos; el detalle queda en los logs
    return ok({ received: true, error: "internal" });
  }
});
