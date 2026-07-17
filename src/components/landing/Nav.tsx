import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const linkColor = scrolled
    ? "text-gray-600 hover:text-black"
    : "text-white/90 hover:text-white";

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        scrolled
          ? "bg-white border-b border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className={`font-bold text-[20px] transition-colors ${
            scrolled ? "text-black" : "text-white"
          }`}
        >
          ArquiRender
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#caracteristicas"
            onClick={scrollToSection("caracteristicas")}
            className={`transition-colors ${linkColor}`}
          >
            Características
          </a>
          <a
            href="#precios"
            onClick={scrollToSection("precios")}
            className={`transition-colors ${linkColor}`}
          >
            Precios
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/app"
            className={`hidden md:inline transition-colors ${linkColor}`}
          >
            Iniciar sesión
          </Link>
          <Link
            to="/app"
            className="bg-[#EA580C] text-white rounded-lg px-5 py-2.5 font-medium hover:bg-[#c2410c] transition-colors"
          >
            Empieza gratis →
          </Link>
        </div>
      </div>
    </nav>
  );
}
