import { useState } from "react";

interface PlanesModalProps {
  userId: string;
  onClose: () => void;
}

type Ciclo = "mensual" | "anual";

const PLANES = [
  { id: "starter", nombre: "Starter", precio: 7, precioAnual: 67.2, renders: 25, mensual: "pri_01kwpqaed7bev0exm7e51dg1gf", anual: "pri_01kwpqd823dz1x08cc5rm1zykc", destacado: false },
  { id: "studio", nombre: "Studio", precio: 15, precioAnual: 144, renders: 100, mensual: "pri_01kwpr1ar7dajvpb1pfv4eegdn", anual: "pri_01kwpr2sx5b5yagfqat56pj0y6", destacado: true },
  { id: "pro", nombre: "Pro", precio: 29, precioAnual: 278.4, renders: 300, mensual: "pri_01kwpr67zmk4gg7xr073nxfyjd", anual: "pri_01kwpr9ds2fett1nwh76x5f15x", destacado: false },
] as const;

declare global {
  interface Window {
    Paddle?: any;
  }
}

let paddlePromesa: Promise<any> | null = null;

const cargarPaddle = (token: string): Promise<any> => {
  if (paddlePromesa) return paddlePromesa;
  paddlePromesa = new Promise((resolve, reject) => {
    if (window.Paddle) {
      resolve(window.Paddle);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      const P = window.Paddle;
      if (!P) {
        reject(new Error("Paddle no disponible"));
        return;
      }
      if (token.startsWith("test_")) P.Environment.set("sandbox");
      P.Initialize({ token });
      resolve(P);
    };
    script.onerror = () => reject(new Error("No se pudo cargar Paddle.js"));
    document.head.appendChild(script);
  });
  return paddlePromesa;
};

const PlanesModal = ({ userId, onClose }: PlanesModalProps) => {
  const [ciclo, setCiclo] = useState<Ciclo>("mensual");
  const [error, setError] = useState("");
  const [abriendo, setAbriendo] = useState("");

  const abrirCheckout = async (planId: string, priceId: string) => {
    if (abriendo) return;
    setError("");

    const token = (import.meta.env as any).VITE_PADDLE_CLIENT_TOKEN as string | undefined;
    if (!token) {
      setError("Falta configurar VITE_PADDLE_CLIENT_TOKEN en el .env.");
      return;
    }

    setAbriendo(planId);
    try {
      const Paddle = await cargarPaddle(token);
      Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { user_id: userId },
        settings: { theme: "dark", displayMode: "overlay" },
      });
    } catch {
      setError("No se pudo abrir el checkout de Paddle. Intenta de nuevo.");
    } finally {
      setAbriendo("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl border border-brand-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#EA580C]">ArquiRender</div>
            <h2 className="m-0 mt-1 text-2xl font-black text-foreground">Elige tu plan</h2>
            <p className="mt-1 text-sm text-muted-foreground">Renders fotorrealistas según tu plan.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full px-2 text-lg font-bold text-muted-foreground transition hover:text-foreground">✕</button>
        </div>

        {/* Toggle mensual / anual */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex gap-1 rounded-full border border-brand-border bg-input p-1">
            {(["mensual", "anual"] as const).map((opcion) => {
              const activo = ciclo === opcion;
              return (
                <button key={opcion} type="button" onClick={() => setCiclo(opcion)} className={`rounded-full px-4 py-2 text-xs font-bold transition ${activo ? "bg-[#EA580C] text-white" : "bg-transparent text-muted-foreground hover:text-foreground"}`}>
                  {opcion === "mensual" ? "Mensual" : "Anual"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {PLANES.map((plan) => {
            const priceId = ciclo === "mensual" ? plan.mensual : plan.anual;
            const esAnual = ciclo === "anual";
            return (
              <div key={plan.id} className={`flex flex-col rounded-xl border p-5 ${plan.destacado ? "border-[#EA580C] bg-[#EA580C]/10" : "border-brand-border bg-input"}`}>
                {plan.destacado && <span className="mb-2 inline-block w-fit rounded-full bg-[#EA580C] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">Popular</span>}
                <h3 translate="no" className="notranslate m-0 text-lg font-black text-foreground">{plan.nombre}</h3>
                <div translate="no" className="notranslate mt-2 flex items-end gap-1">
                  <span className="text-3xl font-black text-foreground">${esAnual ? plan.precioAnual.toFixed(2) : plan.precio}</span>
                  <span className="pb-1 text-xs font-bold text-muted-foreground">{esAnual ? "/año" : "/mes"}</span>
                </div>
                <p translate="no" className="notranslate mt-1 text-[11px] font-semibold text-muted-foreground">{esAnual ? `equivale a $${(plan.precioAnual / 12).toFixed(2)}/mes` : "facturación mensual"}</p>
                <p className="mt-3 text-sm font-bold text-[#EA580C]">{plan.renders} renders</p>
                <button type="button" disabled={!!abriendo} onClick={() => abrirCheckout(plan.id, priceId)} className={`mt-5 rounded-full px-4 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${plan.destacado ? "bg-[#EA580C] text-white hover:bg-[#c2470a]" : "border border-[#EA580C] bg-transparent text-[#EA580C] hover:bg-[#EA580C] hover:text-white"}`}>
                  {abriendo === plan.id ? "Abriendo..." : "Elegir"}
                </button>
              </div>
            );
          })}
        </div>

        {error && <p className="mt-4 text-center text-sm font-bold text-destructive">{error}</p>}
      </div>
    </div>
  );
};

export default PlanesModal;
