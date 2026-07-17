import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function StickyBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  const shown = visible && !dismissed;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[#111111] py-3.5 px-6 flex items-center justify-between gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 ${
        shown
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-full pointer-events-none"
      }`}
    >
      <span className="hidden md:inline text-white text-[15px] font-medium">
        🎁 3 renders gratis — sin tarjeta, sin instalaciones.
      </span>

      <Link
        to="/app"
        className="bg-[#EA580C] text-white rounded-lg px-6 py-2.5 text-[15px] font-bold hover:bg-[#c2410c] transition-colors mx-auto md:mx-0"
      >
        Empezar ahora →
      </Link>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Cerrar"
        className="text-[#999] text-xl bg-transparent hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
