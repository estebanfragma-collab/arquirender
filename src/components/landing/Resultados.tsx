import { useCallback, useEffect, useRef, useState } from "react";

const GALERIA = [
  { src: "/renders/fotorealista.png", label: "Fotografía real" },
  { src: "/renders/nocturno.png", label: "Nocturno" },
  { src: "/renders/lluvia.png", label: "Lluvia" },
  { src: "/renders/dron.png", label: "Dron" },
  { src: "/renders/closeup.png", label: "Close-up" },
  { src: "/renders/estilo.png", label: "Estilo Bauhaus" },
  { src: "/renders/axonometrico.png", label: "Axonométrico" },
  { src: "/renders/lamina.png", label: "Maqueta" },
  { src: "/renders/exterior.png", label: "Exterior" },
];

const PAIRS = [
  { antes: "/renders/antes.png", despues: "/renders/fotorealista.png", label: "Exterior · Día" },
  { antes: "/renders/antes.png", despues: "/renders/fotorealista.png", label: "Exterior · Nocturno" },
  { antes: "/renders/antes.png", despues: "/renders/fotorealista.png", label: "Interior" },
  { antes: "/renders/antes.png", despues: "/renders/fotorealista.png", label: "Vista completa" },
];

function SliderCard({
  antes,
  despues,
  label,
}: {
  antes: string;
  despues: string;
  label: string;
}) {
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
    <div
      ref={containerRef}
      className="relative w-full h-[280px] md:h-[340px] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] select-none"
    >
      {/* Antes (base, 100%) */}
      <img
        src={antes}
        alt="Antes"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Después (encima, revelado a la derecha) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
      >
        <img
          src={despues}
          alt="Después"
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

      {/* Divisor */}
      <div
        className="absolute top-0 bottom-0 z-20 w-0.5 bg-white cursor-ew-resize"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-sm font-bold">
          {"<>"}
        </div>
      </div>

      {/* Etiqueta inferior */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pt-8 pb-3 text-center text-white text-sm font-medium bg-gradient-to-t from-black/70 to-transparent">
        {label}
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
