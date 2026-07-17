import { Link } from "react-router-dom";

const PASOS = [
  {
    num: "01",
    title: "Sube tu imagen",
    desc: "Boceto a mano, captura de SketchUp o foto. ArquiRender acepta cualquier punto de partida.",
    img: "/renders/paso1.png",
  },
  {
    num: "02",
    title: "La IA describe tu espacio",
    desc: "ArquiRender analiza tu imagen automáticamente y genera una descripción técnica lista para renderizar.",
    img: "/renders/paso2.png",
  },
  {
    num: "03",
    title: "Elige el estilo",
    desc: "Fotografía real, nocturno, lámina, moodboard, dron... Selecciona materiales, atmósfera y cámara.",
    img: "/renders/paso3.png",
  },
  {
    num: "04",
    title: "Descarga tu render",
    desc: "En segundos tienes una imagen fotorrealista lista para presentar a tu cliente o subir a tu portafolio.",
    img: "/renders/paso4render.png",
  },
];

export default function Solucion() {
  return (
    <section id="solucion" className="bg-[#F9FAFB] py-[100px]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[4px] text-[#EA580C] font-semibold">
            CÓMO FUNCIONA
          </p>
          <h2 className="mt-4 text-[30px] md:text-[48px] font-black text-[#111] leading-none">
            De tu boceto a render profesional en 4 pasos
          </h2>
        </div>

        {/* Grid de pasos */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PASOS.map((paso) => (
            <div key={paso.num}>
              <div className="text-[64px] font-black text-[#EA580C] leading-none mb-3">
                {paso.num}
              </div>
              <h3 className="text-lg font-bold text-[#111] mb-2">{paso.title}</h3>
              <p className="text-sm text-[#666] leading-[1.6] mb-5">
                {paso.desc}
              </p>
              <div className="rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                <img
                  src={paso.img}
                  alt={paso.title}
                  className="w-full h-[200px] object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Remate */}
        <div className="mt-16 text-center">
          <p className="text-xl font-bold text-[#111]">
            Sin curva de aprendizaje. Sin software. Sin esperas.
          </p>
          <Link
            to="/app"
            className="inline-block mt-6 bg-[#EA580C] text-white rounded-[10px] px-9 py-4 text-base font-bold hover:bg-[#c2410c] transition-colors"
          >
            Probarlo gratis ahora →
          </Link>
        </div>
      </div>
    </section>
  );
}
