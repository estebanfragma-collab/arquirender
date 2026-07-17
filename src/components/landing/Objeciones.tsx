import { useState } from "react";

const ITEMS = [
  {
    q: "¿Necesito saber usar software de renders?",
    a: "Para nada. Si puedes subir una foto, puedes usar ArquiRender. No se requiere experiencia previa en V-Ray, Lumion ni nada similar.",
  },
  {
    q: "¿Qué tan realistas son los resultados?",
    a: "Muy realistas. ArquiRender usa GPT Image 2, el mismo modelo de IA que usan las empresas más avanzadas del mundo. Los resultados sorprenden incluso a arquitectos con años de experiencia.",
  },
  {
    q: "¿Funciona con mis archivos de SketchUp?",
    a: "Sí. Toma una captura de pantalla de tu modelo en SketchUp y súbela directamente. También acepta bocetos a mano, fotos de maquetas y planos 2D.",
  },
  {
    q: "¿Qué pasa cuando se me acaban los renders del plan?",
    a: "Puedes comprar el plan que necesites en cualquier momento. Los créditos no vencen y puedes usarlos a tu ritmo.",
  },
  {
    q: "¿Es seguro pagar? ¿Mis datos están protegidos?",
    a: "Sí. Los pagos se procesan a través de Paddle, plataforma usada por miles de empresas de software en el mundo. Nunca almacenamos datos de tu tarjeta.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí, sin preguntas ni penalizaciones. Cancelas desde tu cuenta en un clic.",
  },
];

export default function Objeciones() {
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-white py-20">
      <div className="max-w-[800px] mx-auto px-6">
        <p className="text-[13px] uppercase tracking-[2px] text-[#EA580C] font-semibold text-center">
          Preguntas frecuentes
        </p>
        <h2 className="mt-3 text-[28px] md:text-[40px] font-extrabold text-[#111] text-center">
          Lo que te estás preguntando antes de probar
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
