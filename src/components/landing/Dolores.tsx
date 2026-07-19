import { useEffect, useRef, useState } from "react";

const CARDS = [
  {
    num: "01",
    icon: "😤",
    text: "Mi laptop se congela a la mitad del render. Y el cliente espera una respuesta hoy.",
  },
  {
    num: "02",
    icon: "⏰",
    text: "La entrega es mañana y sigo esperando horas para que el render termine de procesarse.",
  },
  {
    num: "03",
    icon: "💸",
    text: "Pago $40, $100, hasta $300 por render encargado — y aun así el cliente pide cambios.",
  },
  {
    num: "04",
    icon: "🤝",
    text: "Mis clientes no logran imaginar el resultado viendo solo planos o modelos 3D.",
  },
  {
    num: "05",
    icon: "🔄",
    text: "Cada cambio que pide el cliente significa volver a renderizar y perder horas de trabajo.",
  },
  {
    num: "06",
    icon: "😩",
    text: "El arquitecto de enfrente llegó a la reunión con renders espectaculares. Tú llegaste con planos. Ya sabes cómo terminó.",
  },
];

export default function Dolores() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fallback: si el observer no dispara, forzar visible a los 500ms
    const fallback = setTimeout(() => setVisible(true), 500);

    const el = sectionRef.current;
    if (!el) {
      return () => clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);

    return () => {
      clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  const anim = (delay: number) => ({
    transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
    transitionDelay: `${delay}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(30px)",
  });

  const scrollToSolucion = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("solucion")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="bg-[#F9FAFB] py-[100px]">
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Header */}
        <div className="text-center">
          <p
            className="text-[11px] uppercase tracking-[4px] text-[#EA580C] font-semibold"
            style={anim(0)}
          >
            EL PROBLEMA
          </p>
          <h2
            className="mt-4 text-[32px] md:text-[48px] font-black text-[#111] leading-none"
            style={anim(100)}
          >
            ¿Te suena familiar?
          </h2>
        </div>

        {/* Grid de dolores */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2">
          {CARDS.map((card, i) => (
            <div
              key={card.num}
              style={anim(200 + i * 100)}
              className={`px-8 py-10 border-b border-[#EBEBEB] ${
                i % 2 === 0 ? "md:border-r md:border-[#EBEBEB]" : ""
              }`}
            >
              <div className="text-[64px] font-black text-[#EA580C] leading-none mb-4">
                {card.num}
              </div>
              <div className="text-[28px] leading-none mb-2">{card.icon}</div>
              <p className="text-[17px] italic text-[#555] leading-[1.6]">
                {card.text}
              </p>
            </div>
          ))}
        </div>

        {/* Remate */}
        <div className="mt-16 text-center">
          <p className="text-[22px] font-bold text-[#111]">
            Todos estos problemas tienen la misma solución.
          </p>
          <a
            href="#solucion"
            onClick={scrollToSolucion}
            className="inline-block mt-6 bg-[#EA580C] text-white rounded-[10px] px-9 py-4 text-base font-bold hover:bg-[#c2410c] transition-colors"
          >
            Ver cómo funciona →
          </a>
        </div>
      </div>
    </section>
  );
}
