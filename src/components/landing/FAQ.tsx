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
    <section id="faq" className="bg-white py-20">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[40%_60%] gap-12">
        {/* Columna izquierda (sticky) */}
        <div className="md:sticky md:top-24 md:self-start">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[2px] text-[#EA580C]">
            Preguntas frecuentes
          </span>
          <h2 className="mt-4 text-[32px] md:text-[40px] font-extrabold text-[#111] leading-tight">
            Todo lo que necesitas saber
          </h2>
          <p className="mt-3 text-[#6B7280]">
            Desde cómo funciona hasta pagos y seguridad.
          </p>

          {/* Tarjeta WhatsApp */}
          <div className="mt-8 rounded-2xl bg-[#E7F8EE] p-6">
            <div className="text-3xl leading-none">💬</div>
            <h3 className="mt-3 text-lg font-bold text-[#111]">
              ¿Tienes otra duda?
            </h3>
            <p className="mt-1 text-sm text-[#4B5563]">
              Escríbenos directo y te respondemos rápido.
            </p>
            <a
              href="https://wa.me/593993548764"
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 bg-[#16A34A] text-white rounded-lg px-5 py-2.5 text-sm font-bold hover:bg-[#15803D] transition-colors"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>

        {/* Columna derecha (acordeones) */}
        <div>
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
