import { useState } from "react";
import { Link } from "react-router-dom";

const PLANS = [
  {
    name: "Free",
    monthly: "$0",
    annual: "$0",
    featured: false,
    features: [
      "3 renders al mes",
      "Todos los estilos disponibles",
      "Sin tarjeta de crédito",
    ],
    cta: "Empieza gratis →",
  },
  {
    name: "Starter",
    monthly: "$7",
    annual: "$5.60",
    featured: false,
    features: [
      "25 renders al mes",
      "Todos los estilos disponibles",
      "Descarga en alta resolución",
      "Soporte por email",
    ],
    cta: "Comenzar →",
  },
  {
    name: "Studio",
    monthly: "$15",
    annual: "$12",
    featured: true,
    features: [
      "100 renders al mes",
      "Todos los estilos disponibles",
      "Descarga en alta resolución",
      "Soporte prioritario",
    ],
    cta: "Comenzar →",
  },
  {
    name: "Pro",
    monthly: "$29",
    annual: "$23.20",
    featured: false,
    features: [
      "300 renders al mes",
      "Todos los estilos disponibles",
      "Descarga en alta resolución",
      "Soporte prioritario",
    ],
    cta: "Comenzar →",
  },
];

export default function Precios() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="precios" className="bg-[#F9FAFB] py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-[13px] uppercase tracking-[2px] text-[#EA580C] font-semibold text-center">
          Planes
        </p>
        <h2 className="mt-3 text-[28px] md:text-[40px] font-extrabold text-[#111] text-center">
          Empieza gratis. Escala cuando lo necesites.
        </h2>

        {/* Toggle mensual/anual */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="inline-flex items-center bg-white rounded-full p-1 border border-[#F0F0F0]">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                !annual ? "bg-[#EA580C] text-white" : "bg-transparent text-[#555]"
              }`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                annual ? "bg-[#EA580C] text-white" : "bg-transparent text-[#555]"
              }`}
            >
              Anual
            </button>
          </div>
          <span className="bg-green-100 text-green-700 text-xs font-semibold rounded-full px-3 py-1">
            Ahorra 20%
          </span>
        </div>

        {/* Tarjetas */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-[20px] p-8 flex flex-col ${
                plan.featured
                  ? "border-2 border-[#EA580C] shadow-[0_8px_32px_rgba(234,88,12,0.15)]"
                  : "border border-[#F0F0F0]"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 right-6 bg-[#EA580C] text-white text-xs font-semibold rounded-full px-3 py-1">
                  Más popular
                </span>
              )}
              <h3 className="text-[22px] font-bold text-[#111]">{plan.name}</h3>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-[48px] font-black text-[#111] leading-none">
                  {annual ? plan.annual : plan.monthly}
                </span>
                <span className="text-[#555] text-sm mb-1">/ mes</span>
              </div>

              <ul className="mt-6 flex flex-col gap-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-[#555]">
                    <span className="text-[#EA580C]">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/app"
                className={`mt-8 block w-full text-center rounded-[10px] py-3 font-bold transition-colors ${
                  plan.featured
                    ? "bg-[#EA580C] text-white hover:bg-[#c2410c]"
                    : "bg-white text-[#EA580C] border border-[#EA580C] hover:bg-[#EA580C]/5"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-12 max-w-[700px] mx-auto text-center text-[15px] text-[#666]">
          Todos los planes incluyen acceso completo a todos los tipos de render:
          Fotografía real, Nocturno, Lámina, Moodboard, Dron, Axonométrico y más.
        </p>
      </div>
    </section>
  );
}
