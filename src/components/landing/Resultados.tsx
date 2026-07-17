import { Link } from "react-router-dom";

const CARDS = [
  { label: "Fotografía real", src: "/renders/fotorealista.png" },
  { label: "Nocturno", src: "/renders/nocturno.png" },
  { label: "Lluvia", src: "/renders/lluvia.png" },
  { label: "Dron", src: "/renders/dron.png" },
  { label: "Close-up", src: "/renders/closeup.png" },
  { label: "Exterior", src: "/renders/fotorealista2.png" },
  { label: "Nocturno", src: "/renders/nocturno3.png" },
  { label: "Día lluvioso", src: "/renders/lluvia2.png" },
  { label: "Estilo Bauhaus", src: "/renders/estilo.png" },
];

export default function Resultados() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-[13px] uppercase tracking-[2px] text-[#EA580C] font-semibold text-center">
          Galería
        </p>
        <h2 className="mt-3 text-[28px] md:text-[40px] font-extrabold text-[#111] text-center">
          Lo que los arquitectos están creando con ArquiRender
        </h2>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map((card) => (
            <div
              key={card.src}
              className="relative rounded-2xl overflow-hidden aspect-[4/3]"
            >
              <img
                src={card.src}
                alt={card.label}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-semibold rounded-full px-3 py-1">
                {card.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-base text-[#666]">
            Estas imágenes fueron generadas en segundos desde bocetos y modelos
            simples.
          </p>
          <Link
            to="/app"
            className="inline-block mt-5 bg-[#EA580C] text-white rounded-[10px] px-8 py-3.5 text-base font-bold hover:bg-[#c2410c] transition-colors"
          >
            Crear los míos gratis →
          </Link>
        </div>
      </div>
    </section>
  );
}
