import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      updateFromClientX(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      updateFromClientX(e.touches[0].clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [updateFromClientX]);

  const startDrag = () => {
    dragging.current = true;
  };

  return (
    <section>
      {/* Sección 1 — Texto/CTA */}
      <div className="w-full bg-[#111111] py-20 px-5">
        <div className="max-w-[1200px] mx-auto text-center">
          <span className="inline-block bg-white/10 text-white/90 text-sm rounded-full px-4 py-1.5">
            ✨ Renders fotorrealistas con IA
          </span>
          <h1 className="mt-6 text-[32px] md:text-[64px] font-black text-white leading-[1.05]">
            Tus renders ya no tienen que tomar horas.
          </h1>
          <p className="mt-5 max-w-[600px] mx-auto text-lg text-[#9CA3AF]">
            Sube un boceto, un plano o una captura de SketchUp y obtén un render
            fotorrealista listo para presentar a tu cliente en segundos.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-white text-[15px]">
            <span>✅ 3 renders gratis</span>
            <span className="text-white/40">·</span>
            <span>✅ Sin instalar programas</span>
            <span className="text-white/40">·</span>
            <span>✅ Sin tarjeta de crédito</span>
          </div>
          <Link
            to="/app"
            className="inline-block mt-8 bg-[#EA580C] text-white rounded-[10px] px-8 py-4 text-lg font-bold hover:bg-[#c2410c] transition-colors"
          >
            👉 Crear mis 3 renders gratis
          </Link>
        </div>
      </div>

      {/* Sección 2 — Slider antes/después */}
      <div
        ref={containerRef}
        className="relative w-screen h-[70vh] overflow-hidden select-none"
      >
        {/* Antes (base) */}
        <img
          src="/renders/antes.png"
          className="absolute top-0 left-0 w-full h-full object-cover"
          alt="Maqueta arquitectónica"
        />

        {/* Después (encima) */}
        <img
          src="/renders/fotorealista.png"
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          alt="Render fotorrealista"
        />

        {/* Badges */}
        <span className="absolute top-4 left-4 z-10 bg-black/60 text-white text-xs rounded-md px-3 py-1">
          Antes
        </span>
        <span className="absolute top-4 right-4 z-10 bg-black/60 text-white text-xs rounded-md px-3 py-1">
          Después
        </span>

        {/* Divisor */}
        <div
          className="absolute top-0 bottom-0 z-20 w-0.5 bg-white cursor-ew-resize"
          style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow flex items-center justify-center text-black text-sm font-bold">
            {"<>"}
          </div>
        </div>
      </div>
    </section>
  );
}
