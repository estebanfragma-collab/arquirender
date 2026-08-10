import { useCallback, useEffect, useRef, useState } from "react";

const GALERIA = [
  { src: "/renders/fotorealista.webp", label: "Fotografía real", w: 1536, h: 1024 },
  { src: "/renders/nocturno.webp", label: "Nocturno", w: 800, h: 534 },
  { src: "/renders/lluvia.webp", label: "Lluvia", w: 800, h: 534 },
  { src: "/renders/dron.webp", label: "Dron", w: 800, h: 534 },
  { src: "/renders/closeup.webp", label: "Close-up", w: 800, h: 534 },
  { src: "/renders/estilo.webp", label: "Estilo Bauhaus", w: 800, h: 534 },
  { src: "/renders/axonometrico.webp", label: "Axonométrico", w: 800, h: 534 },
  { src: "/renders/lamina.webp", label: "Maqueta", w: 800, h: 534 },
  { src: "/renders/exterior.webp", label: "Exterior", w: 800, h: 534 },
  { src: "/renders/arquirender-Moderno-5.webp", label: "Estilo Moderno", w: 800, h: 534 },
  { src: "/renders/arquirender-36.webp", label: "Moodboard", w: 800, h: 534 },
  { src: "/renders/opcion_1.webp", label: "Lluvioso", w: 800, h: 534 },
  { src: "/renders/opcion2.webp", label: "Nocturno", w: 800, h: 534 },
  { src: "/renders/fachada_colineal_2.webp", label: "Nocturno", w: 800, h: 534 },
  { src: "/renders/arquirender-Bauhaus-6.webp", label: "Bauhaus", w: 800, h: 534 },
];

const PAIRS = [
  { antes: "/renders/slider-antes1.webp", despues: "/renders/arquirender-40.webp", label: "Casa Modular", antesW: 1200, antesH: 757, despuesW: 1200, despuesH: 800 },
  { antes: "/renders/slider-antes2.webp", despues: "/renders/slider-despues2.webp", label: "Dentalika · Lluvia", antesW: 1200, antesH: 747, despuesW: 1200, despuesH: 800 },
  { antes: "/renders/slider-antes3.webp", despues: "/renders/arquirender-57.webp", label: "Only Natural", antesW: 1200, antesH: 822, despuesW: 1200, despuesH: 800 },
  { antes: "/renders/slider-antes4.webp", despues: "/renders/arquirender-41.webp", label: "DermaPro", antesW: 1200, antesH: 752, despuesW: 1200, despuesH: 800 },
];

function SliderCard({
  antes,
  despues,
  label,
  antesW,
  antesH,
  despuesW,
  despuesH,
}: {
  antes: string;
  despues: string;
  label: string;
  antesW: number;
  antesH: number;
  despuesW: number;
  despuesH: number;
}) {
  // pos = fracción de RENDER (después) visible. 0 = original, 100 = render.
  const [pos, setPos] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 100 : 50
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    // el divisor sigue al dedo: su x = 100 - pos
    setPos(Math.min(100, Math.max(0, 100 - pct)));
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
    <div
      ref={containerRef}
      className="relative w-full h-[280px] md:h-[340px] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] select-none"
    >
      {/* Antes (base, 100%) */}
      <img
        src={antes}
        alt="Antes"
        width={antesW}
        height={antesH}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Después (encima, revelado a la derecha) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${100 - pos}%)` }}
      >
        <img
          src={despues}
          alt="Después"
          width={despuesW}
          height={despuesH}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Badges */}
      <span className="absolute top-3 left-3 z-10 bg-black/50 text-white text-xs rounded-md px-2.5 py-1">
        Antes
      </span>
      <span className="absolute top-3 right-3 z-10 bg-black/50 text-white text-xs rounded-md px-2.5 py-1">
        Después
      </span>

      {/* Divisor (solo desktop, arrastrable) */}
      <div
        className="hidden md:block absolute top-0 bottom-0 z-20 w-0.5 bg-white cursor-ew-resize"
        style={{ left: `${100 - pos}%`, transform: "translateX(-50%)" }}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-sm font-bold">
          {"<>"}
        </div>
      </div>

      {/* Etiqueta inferior (solo desktop) */}
      <div className="hidden md:block absolute bottom-0 left-0 right-0 z-10 pt-8 pb-3 text-center text-white text-sm font-medium bg-gradient-to-t from-black/70 to-transparent">
        {label}
      </div>

      {/* Controles mobile (sin drag) */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-20 flex justify-center gap-2 pt-8 pb-3 bg-gradient-to-t from-black/80 to-transparent">
        <button
          type="button"
          onClick={() => setPos(0)}
          className="rounded-full bg-white/20 backdrop-blur text-white text-xs font-medium px-3 py-1.5"
        >
          ← Ver original
        </button>
        <button
          type="button"
          onClick={() => setPos(100)}
          className="rounded-full bg-[#EA580C] text-white text-xs font-medium px-3 py-1.5"
        >
          Ver render →
        </button>
      </div>
    </div>
  );
}

export default function Resultados() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Sección 1 — Galería */}
        <h2 className="text-[40px] font-extrabold text-[#111] text-center">
          Lo que están haciendo nuestros arquitectos
        </h2>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GALERIA.map((item, i) => (
            <div
              key={i}
              className="relative rounded-2xl overflow-hidden aspect-[4/3]"
            >
              <img
                src={item.src}
                alt={item.label}
                width={item.w}
                height={item.h}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-semibold rounded-full px-3 py-1">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Sección 2 — Sliders antes/después */}
        <div className="mt-24 text-center">
          <h2 className="text-[40px] font-extrabold text-[#111]">
            Resultados reales
          </h2>
          <p className="mt-3 text-[#6B7280]">
            Arrastra el divisor para ver la transformación
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {PAIRS.map((pair, i) => (
            <SliderCard key={i} {...pair} />
          ))}
        </div>
      </div>
    </section>
  );
}
