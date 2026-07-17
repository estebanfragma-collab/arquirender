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
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden select-none"
    >
      {/* Después (base) */}
      <img
        src="/renders/fotorealista.png"
        className="absolute inset-0 w-full h-full object-cover object-center"
        alt="Render fotorrealista"
      />
      <span className="absolute top-5 right-5 z-20 bg-black/60 text-white text-[13px] font-semibold px-4 py-1.5 rounded-full">
        Después
      </span>

      {/* Antes (recortado) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src="/renders/antes.png"
          className="w-full h-full object-cover object-center"
          alt="Maqueta arquitectónica"
        />
        <span className="absolute top-5 left-5 z-20 bg-black/60 text-white text-[13px] font-semibold px-4 py-1.5 rounded-full">
          Antes
        </span>
      </div>

      {/* Overlay gradiente izquierda */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 60%)",
        }}
      />

      {/* Divisor */}
      <div
        className="absolute top-0 bottom-0 z-20 w-0.5 bg-white cursor-ew-resize"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow flex items-center justify-center text-black">
          ↔
        </div>
      </div>

      {/* Texto */}
      <div
        className="absolute z-30 pointer-events-none max-w-[560px]"
        style={{ left: "6%", bottom: "12%" }}
      >
        <h1 className="text-[32px] md:text-[52px] font-extrabold text-white leading-[1.1]">
          Tus renders ya no tienen que tomar horas.
        </h1>
        <p className="mt-4 text-[17px] text-white/85">
          Sube un boceto, un plano o una captura de SketchUp y obtén un render
          fotorrealista listo para presentar a tu cliente en segundos.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-white text-[15px]">
          <span>✅ 3 renders gratis</span>
          <span>·</span>
          <span>✅ Sin instalar programas</span>
          <span>·</span>
          <span>✅ Sin tarjeta de crédito</span>
        </div>
        <Link
          to="/app"
          className="pointer-events-auto inline-block mt-7 bg-[#EA580C] text-white rounded-[10px] px-8 py-4 text-lg font-bold hover:bg-[#c2410c] transition-colors"
        >
          👉 Crear mis 3 renders gratis
        </Link>
      </div>
    </section>
  );
}
