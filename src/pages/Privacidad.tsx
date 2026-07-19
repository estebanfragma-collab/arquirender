import { Link } from "react-router-dom";

export default function Privacidad() {
  return (
    <div className="bg-white text-[#111] min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[#E5E7EB]">
        <div className="max-w-[800px] mx-auto px-6 py-4">
          <Link to="/" className="text-xl font-bold text-black">
            ArquiRender
          </Link>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-[800px] mx-auto px-6 py-[60px]">
        <h1 className="text-[36px] font-extrabold leading-tight">
          Política de Privacidad
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Última actualización: 18 de julio de 2026
        </p>

        <div className="mt-10 space-y-8 text-[15px] leading-[1.7] text-[#374151]">
          <section>
            <p>
              En ArquiRender (arquirender.lat) valoramos su privacidad. Esta
              política describe qué información recopilamos, cómo la usamos y
              cuáles son sus derechos. El responsable del tratamiento de datos es
              Esteban Ponce, persona natural con domicilio en Quito, Ecuador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              1. Información que recopilamos
            </h2>
            <p>
              Recopilamos: (a) su dirección de correo electrónico y datos de
              cuenta al registrarse; (b) las imágenes que usted sube para generar
              renders; (c) datos de uso, como interacciones con la plataforma,
              tipo de navegador y métricas de rendimiento; y (d) información de
              facturación gestionada por nuestro procesador de pagos. No
              recopilamos datos de tarjetas de crédito directamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              2. Cómo usamos la información
            </h2>
            <p>
              Utilizamos la información para prestar y mejorar el Servicio,
              procesar sus renders, gestionar su cuenta y suscripción, brindar
              soporte, enviar comunicaciones relacionadas con el servicio y
              cumplir obligaciones legales. No vendemos su información personal a
              terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              3. Procesamiento de imágenes
            </h2>
            <p>
              Las imágenes que usted sube se procesan mediante modelos de
              inteligencia artificial de terceros, como OpenAI, con el único fin
              de generar los renders solicitados. Sus imágenes{" "}
              <strong>no se utilizan para entrenar modelos de IA</strong>. El
              tratamiento se limita a la generación del resultado que usted
              solicita. Recomendamos no subir imágenes con información confidencial
              o datos personales de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              4. Compartir datos
            </h2>
            <p>
              Compartimos datos únicamente con proveedores necesarios para operar
              el Servicio: Paddle, para el procesamiento de pagos y facturación; y
              Supabase, para el almacenamiento seguro de datos de cuenta e
              infraestructura. Estos proveedores tratan los datos conforme a sus
              propias políticas de privacidad y solo para los fines aquí
              descritos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">5. Cookies</h2>
            <p>
              Utilizamos cookies y tecnologías similares para mantener su sesión
              iniciada, recordar preferencias y analizar el uso del Servicio.
              Puede configurar su navegador para rechazar cookies, aunque esto
              podría afectar el funcionamiento de algunas funciones.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">6. Seguridad</h2>
            <p>
              Aplicamos medidas técnicas y organizativas razonables para proteger
              su información contra acceso no autorizado, pérdida o alteración.
              Sin embargo, ningún sistema es completamente seguro, por lo que no
              podemos garantizar una seguridad absoluta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              7. Tus derechos
            </h2>
            <p>
              Usted tiene derecho a acceder, rectificar y solicitar la eliminación
              de sus datos personales, así como a oponerse a su tratamiento o
              solicitar su portabilidad. Para ejercer estos derechos, escríbanos a
              ayalgoritmo@gmail.com. Atenderemos su solicitud en un plazo
              razonable conforme a la legislación aplicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              8. Retención de datos
            </h2>
            <p>
              Conservamos su información mientras mantenga una cuenta activa o
              según sea necesario para prestar el Servicio y cumplir obligaciones
              legales. Al eliminar su cuenta, procederemos a borrar o anonimizar
              sus datos personales, salvo aquellos que debamos conservar por
              motivos legales o de facturación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">9. Contacto</h2>
            <p>
              Para consultas sobre esta Política de Privacidad o el tratamiento de
              sus datos, escríbanos a{" "}
              <a
                href="mailto:ayalgoritmo@gmail.com"
                className="text-[#EA580C] underline"
              >
                ayalgoritmo@gmail.com
              </a>
              . Responsable: Esteban Ponce, Quito, Ecuador.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB]">
        <div className="max-w-[800px] mx-auto px-6 py-6 text-sm text-[#6B7280]">
          © 2026 ArquiRender · Esteban Ponce · Quito, Ecuador ·{" "}
          <Link to="/" className="text-[#EA580C] underline">
            Volver al inicio
          </Link>
        </div>
      </footer>
    </div>
  );
}
