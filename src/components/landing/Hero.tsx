import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Ruler, Camera, Layers } from "lucide-react";

const FLOATING = [
  { Icon: Box, pos: "top-24 left-6 md:left-16", anim: "heroFloat1 5s ease-in-out 0s infinite" },
  { Icon: Ruler, pos: "top-24 right-6 md:right-16", anim: "heroFloat2 6s ease-in-out 0.7s infinite" },
  { Icon: Camera, pos: "bottom-16 left-6 md:left-16", anim: "heroFloat3 4.5s ease-in-out 1.2s infinite" },
  { Icon: Layers, pos: "bottom-16 right-6 md:right-16", anim: "heroFloat4 5.5s ease-in-out 0.4s infinite" },
];

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
      <div className="relative w-full min-h-screen bg-[#0A0A0A] px-5 flex flex-col justify-center items-center overflow-hidden">
        <style>{`
          @keyframes heroFloat1 {
            0%,100%{transform:translate(0,0) rotate(0deg)}
            33%{transform:translate(15px,-35px) rotate(6deg)}
            66%{transform:translate(-12px,-15px) rotate(-4deg)}
          }
          @keyframes heroFloat2 {
            0%,100%{transform:translate(0,0) rotate(0deg)}
            50%{transform:translate(-15px,32px) rotate(-8deg)}
          }
          @keyframes heroFloat3 {
            0%,100%{transform:translate(0,0) rotate(0deg)}
            25%{transform:translate(-14px,-30px) rotate(5deg)}
            75%{transform:translate(14px,-40px) rotate(8deg)}
          }
          @keyframes heroFloat4 {
            0%,100%{transform:translate(0,0) rotate(0deg)}
            40%{transform:translate(13px,26px) rotate(7deg)}
            70%{transform:translate(-11px,36px) rotate(-6deg)}
          }
          @keyframes heroFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          .hero-fadeup{opacity:0;animation:heroFadeUp .6s ease-out forwards}
        `}</style>

        {/* Grid sutil */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow radial naranja */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(234,88,12,0.15), transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Iconos flotantes */}
        {FLOATING.map(({ Icon, pos, anim }, i) => (
          <div
            key={i}
            className={`hidden md:flex absolute ${pos} w-[60px] h-[60px] rounded-full border border-white/10 bg-white/[0.02] backdrop-blur items-center justify-center pointer-events-none`}
            style={{
              animation: anim,
              boxShadow: "0 0 20px rgba(234,88,12,0.15)",
            }}
          >
            <Icon className="w-6 h-6 text-white/60" />
          </div>
        ))}

        {/* Contenido */}
        <div className="relative z-10 max-w-[1200px] mx-auto text-center">
          <span className="hero-fadeup inline-block bg-white/10 text-white/90 text-sm rounded-full px-4 py-1.5" style={{ animationDelay: "0ms" }}>
            ✨ Renders fotorrealistas con IA
          </span>
          <h1 className="hero-fadeup mt-6 text-[32px] md:text-[72px] font-black text-white leading-[1.05]" style={{ animationDelay: "100ms" }}>
            Tus renders ya no tienen que tomar horas.
          </h1>
          <p className="hero-fadeup mt-5 max-w-[600px] mx-auto text-lg text-[#9CA3AF]" style={{ animationDelay: "200ms" }}>
            Sube un boceto, un plano o una captura de SketchUp y obtén un render
            fotorrealista listo para presentar a tu cliente en segundos.
          </p>
          <div className="hero-fadeup mt-6 flex flex-wrap justify-center gap-2 text-white text-[15px]" style={{ animationDelay: "300ms" }}>
            <span>✅ 3 renders gratis</span>
            <span className="text-white/40">·</span>
            <span>✅ Sin instalar programas</span>
            <span className="text-white/40">·</span>
            <span>✅ Sin tarjeta de crédito</span>
          </div>
          <Link
            to="/app"
            className="hero-fadeup inline-block mt-8 bg-[#EA580C] text-white rounded-[10px] px-8 py-4 text-lg font-bold hover:bg-[#c2410c] transition-colors"
            style={{ animationDelay: "400ms" }}
          >
            👉 Crear mis 3 renders gratis
          </Link>
        </div>
      </div>

      {/* Sección 2 — Slider antes/después (tarjeta flotante) */}
      <div
        className="relative w-full min-h-screen bg-[#0A0A0A] flex items-center justify-center p-[60px] md:p-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div
          ref={containerRef}
          className="relative w-full max-w-[1100px] aspect-[16/10] rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] select-none"
        >
          {/* Antes (base) — SketchUp */}
          <img
            src="/renders/antes.png"
            className="absolute inset-0 w-full h-full object-cover object-center"
            alt="Maqueta arquitectónica"
          />

          {/* Después (encima, revelado desde la derecha) — render */}
          <img
            src="/renders/fotorealista.png"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
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
      </div>
    </section>
  );
}
