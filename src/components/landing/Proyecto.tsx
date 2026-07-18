import { Link } from "react-router-dom";

const RESULTADOS = [
  { src: "/renders/slider-antes3.png", label: "SketchUp Original" },
  { src: "/renders/proyecto-v2.png", label: "Fotorrealista" },
  { src: "/renders/proyecto-lamina.png", label: "Lámina Técnica" },
  { src: "/renders/proyecto-moodboard.png", label: "Moodboard" },
  { src: "/renders/proyecto-moderno.png", label: "Estilo Moderno" },
  { src: "/renders/proyecto-bauhaus.png", label: "Estilo Bauhaus" },
];

export default function Proyecto() {
  return (
    <section className="bg-[#111111] py-[100px]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-[60px]">
          <h2 className="text-[32px] md:text-[48px] font-black text-white leading-tight">
            Un proyecto. Infinitas presentaciones.
          </h2>
          <p className="mt-4 text-lg text-[#9CA3AF]">
            Del mismo modelo SketchUp generamos todas las vistas que necesitas
          </p>
        </div>

        {/* Layout principal */}
        <div className="flex flex-col md:grid md:grid-cols-[35%_65%] md:gap-10 md:items-center gap-10">
          {/* Izquierda — modelo original */}
          <div className="text-center md:text-left">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[2px] text-[#EA580C]">
              Modelo original
            </span>
            <img
              src="/renders/proyecto-v1.jpg"
              alt="Modelo SketchUp original"
              className="mt-3 w-full rounded-xl"
            />
            <p className="mt-3 text-sm text-[#9CA3AF]">1 modelo SketchUp</p>
            <div className="mt-4 text-[48px] text-[#EA580C] animate-pulse leading-none">
              →
            </div>
          </div>

          {/* Derecha — grid 3x3 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {RESULTADOS.map((item) => (
              <div
                key={item.src}
                className="group relative rounded-[10px] overflow-hidden aspect-square cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
              >
                <img
                  src={item.src}
                  alt={item.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 pt-6 pb-2 px-3 text-white text-xs font-medium bg-gradient-to-t from-black/80 to-transparent">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-white text-lg font-medium">
            ¿Quieres ver todas las vistas de tu proyecto?
          </p>
          <Link
            to="/app"
            className="inline-block mt-5 bg-[#EA580C] text-white rounded-[10px] px-8 py-4 text-base font-bold hover:bg-[#c2410c] transition-colors"
          >
            Generar renders gratis →
          </Link>
        </div>
      </div>
    </section>
  );
}
