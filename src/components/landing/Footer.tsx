import { Link } from "react-router-dom";

export default function Footer() {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[#111111] py-[60px]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Fila superior */}
        <div className="flex flex-wrap justify-between gap-10">
          <div>
            <div className="text-xl font-bold text-white">ArquiRender</div>
            <p className="mt-2 text-sm text-[#999]">
              Renders fotorrealistas con IA para arquitectos de LATAM
            </p>
            <a
              href="https://instagram.com/ayalgoritmo"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-[#999] hover:text-white transition-colors"
            >
              <span>📷</span>
              <span>@ayalgoritmo</span>
            </a>
            <p className="mt-2 text-sm text-[#999]">ayalgoritmo@gmail.com</p>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="#caracteristicas"
              onClick={scrollTo("caracteristicas")}
              className="text-sm text-[#999] hover:text-white transition-colors"
            >
              Características
            </a>
            <a
              href="#precios"
              onClick={scrollTo("precios")}
              className="text-sm text-[#999] hover:text-white transition-colors"
            >
              Precios
            </a>
            <Link
              to="/app"
              className="text-sm text-[#999] hover:text-white transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        {/* Divisor */}
        <div className="mt-12 border-t border-[#333]" />

        {/* Fila inferior */}
        <div className="mt-6 flex flex-wrap justify-between gap-4">
          <p className="text-[13px] text-[#666]">
            © 2026 ArquiRender. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link
              to="/terminos"
              className="text-[13px] text-[#666] hover:text-[#999] transition-colors"
            >
              Términos de uso
            </Link>
            <Link
              to="/privacidad"
              className="text-[13px] text-[#666] hover:text-[#999] transition-colors"
            >
              Política de privacidad
            </Link>
            <Link
              to="/reembolsos"
              className="text-[13px] text-[#666] hover:text-[#999] transition-colors"
            >
              Política de reembolsos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
