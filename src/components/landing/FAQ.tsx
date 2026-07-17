import { useState } from "react";

const ITEMS = [
  {
    q: "¿Cuánto tiempo tarda en generarse un render?",
    a: "Entre 15 y 45 segundos dependiendo del tipo de render. Sin esperas, sin colas.",
  },
  {
    q: "¿En qué formato descargo mis renders?",
    a: "En JPG de alta resolución, listo para presentaciones, láminas o redes sociales.",
  },
  {
    q: "¿Puedo usar ArquiRender desde mi celular?",
    a: "Sí, funciona desde cualquier navegador, en computador, tablet o celular. Sin instalaciones.",
  },
  {
    q: "¿Los renders tienen marca de agua?",
    a: "No. Todos los renders, incluso los del plan Free, se descargan sin marca de agua.",
  },
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí, subes o bajas de plan cuando quieras desde tu perfil. El cambio aplica de inmediato.",
  },
  {
    q: "¿ArquiRender está en español?",
    a: "Sí, toda la plataforma está en español, pensada para arquitectos de LATAM.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-white py-20">
      <div className="max-w-[800px] mx-auto px-6">
        <p className="text-[13px] uppercase tracking-[2px] text-[#EA580C] font-semibold text-center">
          FAQ
        </p>
        <h2 className="mt-3 text-[28px] md:text-[40px] font-extrabold text-[#111] text-center">
          Respuestas rápidas
        </h2>

        <div className="mt-12">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-[#F0F0F0]">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-[17px] font-semibold text-[#111]">
                    {item.q}
                  </span>
                  <span
                    className={`text-[#EA580C] transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <p className="text-[15px] text-[#555] leading-[1.7] pb-5">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
