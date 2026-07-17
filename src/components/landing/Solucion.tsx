import { Link } from "react-router-dom";

const PASOS = [
  {
    num: "01",
    title: "Sube tu imagen",
    desc: "Boceto a mano, captura de SketchUp o foto. ArquiRender acepta cualquier punto de partida.",
    visual: { bg: "#E5E7EB", text: "📁 Tu imagen aquí", textClass: "text-[#555]" },
  },
  {
    num: "02",
    title: "Elige el estilo",
    desc: "Fotografía real, nocturno, lámina de presentación, moodboard, dron... Selecciona el tipo de render que necesitas.",
    visual: { bg: "#1a1a1a", text: "🎨 Dashboard de ArquiRender", textClass: "text-white" },
  },
  {
    num: "03",
    title: "Descarga tu render",
    desc: "En segundos tienes una imagen fotorrealista lista para presentar a tu cliente o subir a tu portafolio.",
    visual: { bg: "#92400E", text: "✨ Render fotorrealista", textClass: "text-white" },
  },
];

export default function Solucion() {
  return (
    <section id="solucion" className="bg-[#F9FAFB] py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-[13px] uppercase tracking-[2px] text-[#EA580C] font-semibold text-center">
          Cómo funciona
        </p>
        <h2 className="mt-3 text-[28px] md:text-[40px] font-extrabold text-[#111] text-center">
          De tu boceto a un render profesional en 3 pasos
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {PASOS.map((paso) => (
            <div key={paso.num}>
              <div className="text-[48px] font-black text-[#EA580C] leading-none">
                {paso.num}
              </div>
              <h3 className="mt-2 text-xl font-bold text-[#111]">{paso.title}</h3>
              <p className="mt-2 text-[15px] text-[#555]">{paso.desc}</p>
              <div
                className={`mt-4 rounded-xl h-[180px] flex items-center justify-center text-center ${paso.visual.textClass}`}
                style={{ backgroundColor: paso.visual.bg }}
              >
                {paso.visual.text}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-[#111]">
            Sin curva de aprendizaje. Sin software. Sin esperas.
          </p>
          <Link
            to="/app"
            className="inline-block mt-5 bg-[#EA580C] text-white rounded-[10px] px-8 py-3.5 text-base font-bold hover:bg-[#c2410c] transition-colors"
          >
            Probarlo gratis ahora →
          </Link>
        </div>
      </div>
    </section>
  );
}
