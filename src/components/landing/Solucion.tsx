import { Link } from "react-router-dom";

const PASOS = [
  {
    num: "01",
    img: "/screenshots/paso1.png",
    title: "Sube tu diseño",
    desc: "SketchUp, Revit, boceto o cualquier imagen. La IA lo reconoce automáticamente.",
  },
  {
    num: "02",
    img: "/screenshots/paso2.png",
    title: "La IA analiza tu espacio",
    desc: "Describimos cada detalle de tu diseño: materiales, geometría, iluminación.",
  },
  {
    num: "03",
    img: "/screenshots/paso3.png",
    title: "Ajusta estilo e iluminación",
    desc: "Elige materiales, estilo arquitectónico y tipo de iluminación con un clic.",
  },
];

export default function Solucion() {
  return (
    <section id="solucion">
      {/* Parte superior — 3 pasos */}
      <div className="bg-white py-[100px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center">
            <h2 className="text-[32px] md:text-[44px] font-black text-[#111] leading-tight">
              Así funciona ArquiRender
            </h2>
            <p className="mt-4 text-lg text-[#6B7280]">
              De tu boceto al render fotorrealista en menos de 2 minutos
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {PASOS.map((paso) => (
              <div
                key={paso.num}
                className="border border-[#EBEBEB] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
              >
                <div className="text-[48px] font-extrabold text-[#EA580C] leading-none">
                  {paso.num}
                </div>
                <img
                  src={paso.img}
                  alt={paso.title}
                  className="mt-4 w-full rounded-lg"
                />
                <h3 className="mt-5 text-lg font-bold text-[#111]">
                  {paso.title}
                </h3>
                <p className="mt-2 text-sm text-[#6B7280] leading-[1.6]">
                  {paso.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parte inferior — Paso 04 ancho completo */}
      <div className="bg-[#111111] py-20">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col-reverse gap-10 md:grid md:grid-cols-[40%_60%] md:gap-12 md:items-center">
          {/* Texto */}
          <div>
            <span className="inline-block bg-[#EA580C] text-white text-[11px] font-semibold uppercase tracking-[2px] rounded-full px-3 py-1">
              Resultado final
            </span>
            <div className="mt-4 text-[80px] font-black text-[#EA580C] leading-none">
              04
            </div>
            <h3 className="mt-2 text-[36px] font-extrabold text-white leading-tight">
              Tu render fotorrealista, listo para descargar
            </h3>
            <p className="mt-4 text-[#9CA3AF] leading-[1.6]">
              Descarga en alta resolución y compártelo con tu cliente al
              instante. Sin esperas, sin software especializado.
            </p>
            <Link
              to="/app"
              className="inline-block mt-7 bg-[#EA580C] text-white rounded-[10px] px-8 py-4 text-base font-bold hover:bg-[#c2410c] transition-colors"
            >
              Generar mi render gratis →
            </Link>
          </div>

          {/* Imagen */}
          <div>
            <img
              src="/renders/arquirender_24.png"
              alt="Render fotorrealista final"
              className="w-full rounded-xl shadow-[0_0_40px_rgba(234,88,12,0.3)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
