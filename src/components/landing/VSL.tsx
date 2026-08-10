export default function VSL() {
  return (
    <section className="bg-[#F9FAFB] py-20">
      <div className="max-w-[800px] mx-auto px-6 text-center">
        <p className="text-[13px] uppercase tracking-[2px] text-[#EA580C] font-semibold">
          Míralo en acción
        </p>
        <h2 className="mt-3 text-[24px] md:text-[36px] font-extrabold text-[#111]">
          De boceto a render profesional en menos de 30 segundos
        </h2>

        <div className="mt-8 rounded-2xl overflow-hidden aspect-video bg-[#1a1a1a] shadow-[0_8px_40px_rgba(0,0,0,0.15)]">
          <button
            type="button"
            className="w-full h-full flex flex-col items-center justify-center gap-3 group"
            aria-label="Ver demo"
          >
            <span className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#111] text-2xl transition-transform group-hover:scale-110">
              ▶
            </span>
            <span className="text-sm text-white">Ver demo</span>
          </button>
        </div>

        <p className="mt-6 text-base text-[#555]">
          Exactamente lo que ven tus clientes cuando les presentas
        </p>
      </div>
    </section>
  );
}
