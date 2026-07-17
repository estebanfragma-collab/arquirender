const CARDS = [
  {
    icon: "🏛️",
    title: "Arquitectos independientes",
    desc: "Cierra más proyectos mostrando renders fotorrealistas desde la primera reunión, sin esperar días ni gastar en software costoso.",
  },
  {
    icon: "🎓",
    title: "Estudiantes de arquitectura",
    desc: "Entrega láminas y portafolios que impresionan a tus profesores y clientes, aunque estés empezando tu carrera.",
  },
  {
    icon: "🏗️",
    title: "Constructoras e inmobiliarias",
    desc: "Vende unidades antes de construir con imágenes que hacen que los compradores se enamoren del proyecto desde el papel.",
  },
];

export default function Industrias() {
  return (
    <section className="bg-[#F9FAFB] py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-[13px] uppercase tracking-[2px] text-[#EA580C] font-semibold text-center">
          ¿Para quién es?
        </p>
        <h2 className="mt-3 text-[28px] md:text-[40px] font-extrabold text-[#111] text-center">
          ArquiRender funciona para cualquier etapa del proyecto
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-[20px] p-9 border border-[#F0F0F0] shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
            >
              <div className="text-[40px] leading-none">{card.icon}</div>
              <h3 className="mt-4 text-[22px] font-bold text-[#111]">
                {card.title}
              </h3>
              <p className="mt-3 text-[15px] text-[#555] leading-[1.6]">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
