import { supabase } from "@/integrations/supabase/client";
export class PosterError extends Error {
  constructor(message: string, public rejected = false) {
    super(message);
  }
}
export async function posterRequest(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("creative-posters", {
    body,
  });
  if (error) {
    let message =
      "No pudimos confirmar la respuesta. Consulta el estado antes de generar de nuevo.";
    let rejected = false;
    try {
      const payload = await error.context?.json();
      if (payload?.error) {
        message = payload.error;
        rejected = [400, 401, 409, 413, 503].includes(error.context.status);
      }
    } catch {}
    throw new PosterError(message, rejected);
  }
  if (!data?.success) {
    throw new PosterError(
      data?.error || "La conexión de pósters no está disponible.",
    );
  }
  return data;
}
