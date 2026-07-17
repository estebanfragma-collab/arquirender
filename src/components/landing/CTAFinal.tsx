import { Link } from "react-router-dom";

export default function CTAFinal() {
  const scrollToResultados = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-[#EA580C] py-[100px]">
      <div className="max-w-[800px] mx-auto px-6 text-center">
        <p className="text-[13px] uppercase tracking-[2px] font-semibold text-white/70">
          Empieza hoy
        </p>
        <h2 className="mt-3 text-[28px] md:text-[44px] font-extrabold text-white leading-[1.1]">
          Tu próxima presentación puede ser la que cierre el proyecto
        </h2>
        <p className="mt-5 max-w-[600px] mx-auto text-lg text-white/85">
          Únete a cientos de arquitectos en LATAM que ya presentan renders
          profesionales en segundos, sin software costoso y sin perder horas de
          trabajo.
        </p>

        <div className="mt-8 flex justify-center">
          <ul className="inline-flex flex-col gap-3 text-left">
            <li className="text-base text-white">✓ 3 renders gratis sin tarjeta</li>
            <li className="text-base text-white">✓ Sin instalaciones</li>
            <li className="text-base text-white">✓ Resultados en segundos</li>
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/app"
            className="bg-white text-[#EA580C] rounded-[10px] px-9 py-4 text-lg font-bold hover:bg-white/90 transition-colors"
          >
            Crear mis renders gratis →
          </Link>
          <a
            href="#resultados"
            onClick={scrollToResultados}
            className="border-2 border-white/60 text-white rounded-[10px] px-9 py-4 text-lg font-bold hover:bg-white/10 transition-colors"
          >
            Ver ejemplos
          </a>
        </div>
      </div>
    </section>
  );
}
