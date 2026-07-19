import { Link } from "react-router-dom";

export default function Footer() {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const linkClass = "text-sm text-[#9CA3AF] hover:text-white transition-colors";

  return (
    <footer className="bg-[#111111] py-[60px]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
          {/* Columna 1 — Marca */}
          <div>
            <div className="text-2xl font-bold text-white">ArquiRender</div>
            <p className="mt-3 text-sm text-[#9CA3AF] max-w-[280px]">
              Renders arquitectónicos fotorrealistas con IA para arquitectos y
              diseñadores de LATAM.
            </p>
            <a
              href="https://wa.me/593993548764"
              target="_blank"
              rel="noreferrer"
              className={`${linkClass} mt-4 block`}
            >
              +593 99 354 8764
            </a>
            <a href="mailto:ayalgoritmo@gmail.com" className={`${linkClass} mt-1 block`}>
              ayalgoritmo@gmail.com
            </a>
            <p className="mt-3 text-xs text-[#6B7280]">
              Esteban Ponce · Quito, Ecuador
            </p>
          </div>

          {/* Columna 2 — Producto */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
              Producto
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a href="#caracteristicas" onClick={scrollTo("caracteristicas")} className={linkClass}>
                  Características
                </a>
              </li>
              <li>
                <a href="#precios" onClick={scrollTo("precios")} className={linkClass}>
                  Precios
                </a>
              </li>
              <li>
                <Link to="/app" className={linkClass}>
                  Empezar gratis
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3 — Recursos */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
              Recursos
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a href="#solucion" onClick={scrollTo("solucion")} className={linkClass}>
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#resultados" onClick={scrollTo("resultados")} className={linkClass}>
                  Resultados
                </a>
              </li>
              <li>
                <a href="#faq" onClick={scrollTo("faq")} className={linkClass}>
                  Preguntas frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4 — Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
              Legal
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link to="/terminos" className={linkClass}>
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className={linkClass}>
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link to="/reembolsos" className={linkClass}>
                  Política de reembolsos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Abajo */}
        <div className="mt-12 pt-6 border-t border-[#2A2A2A]">
          <p className="text-center text-xs text-[#6B7280]">
            © 2026 ArquiRender. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
