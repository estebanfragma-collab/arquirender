import { Link } from "react-router-dom";

export default function Terminos() {
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
          Términos y Condiciones
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Última actualización: 18 de julio de 2026
        </p>

        <div className="mt-10 space-y-8 text-[15px] leading-[1.7] text-[#374151]">
          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              1. Aceptación de términos
            </h2>
            <p>
              Al acceder o utilizar ArquiRender (disponible en arquirender.lat),
              en adelante "el Servicio", usted acepta quedar vinculado por estos
              Términos y Condiciones. Si no está de acuerdo con alguna parte de
              los mismos, no debe utilizar el Servicio. Estos términos
              constituyen un acuerdo legal entre usted y Esteban Ponce, persona
              natural con domicilio en Quito, Ecuador, responsable del Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              2. Descripción del servicio
            </h2>
            <p>
              ArquiRender es una plataforma SaaS que utiliza inteligencia
              artificial para generar renders arquitectónicos fotorrealistas a
              partir de bocetos, planos, capturas de modelos 3D u otras imágenes
              proporcionadas por el usuario. El Servicio se ofrece "tal cual" y
              puede evolucionar, actualizarse o modificarse en el tiempo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              3. Cuentas de usuario
            </h2>
            <p>
              Para acceder a determinadas funciones debe crear una cuenta y
              proporcionar información veraz y actualizada. Usted es responsable
              de mantener la confidencialidad de sus credenciales y de toda
              actividad realizada bajo su cuenta. Debe notificarnos de inmediato
              cualquier uso no autorizado. Las cuentas son personales e
              intransferibles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              4. Uso aceptable
            </h2>
            <p>
              Usted se compromete a no utilizar el Servicio para fines ilícitos
              ni a subir contenido que infrinja derechos de terceros, sea
              ofensivo, difamatorio o viole cualquier ley aplicable. Queda
              prohibido intentar vulnerar la seguridad del Servicio, realizar
              ingeniería inversa, o usar medios automatizados para sobrecargar la
              infraestructura. Nos reservamos el derecho de suspender cuentas que
              incumplan estas condiciones.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              5. Propiedad intelectual
            </h2>
            <p>
              Usted conserva todos los derechos de propiedad sobre las imágenes
              que sube y sobre los renders generados a partir de ellas. Puede
              utilizarlos con fines personales o comerciales sin restricción por
              parte de ArquiRender. La marca, el software, la interfaz y los
              elementos propios de la plataforma son propiedad de Esteban Ponce y
              están protegidos por las leyes de propiedad intelectual. Usted nos
              otorga una licencia limitada y temporal para procesar sus imágenes
              con el único fin de prestar el Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              6. Pagos y suscripciones
            </h2>
            <p>
              Los pagos y suscripciones son procesados por Paddle, nuestro
              proveedor de pagos, quien actúa como comerciante registrado (Merchant
              of Record). Al contratar un plan de pago, usted acepta también los
              términos de Paddle. Los precios se muestran antes de la compra y
              pueden incluir impuestos según su jurisdicción. Las renovaciones son
              automáticas salvo cancelación. Los reembolsos se rigen por nuestra
              Política de Reembolsos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              7. Limitación de responsabilidad
            </h2>
            <p>
              El Servicio se proporciona "tal cual" y "según disponibilidad", sin
              garantías de ningún tipo. En la máxima medida permitida por la ley,
              Esteban Ponce no será responsable por daños indirectos, incidentales
              o consecuentes derivados del uso o la imposibilidad de uso del
              Servicio, incluyendo pérdida de datos, lucro cesante o resultados de
              render que no cumplan las expectativas del usuario. La
              responsabilidad total, en cualquier caso, no excederá el monto
              pagado por usted en los últimos doce meses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              8. Modificaciones
            </h2>
            <p>
              Podemos modificar estos Términos en cualquier momento. Los cambios
              entrarán en vigor al publicarse en esta página, actualizando la
              fecha de "Última actualización". El uso continuado del Servicio tras
              dichos cambios constituye su aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              9. Ley aplicable
            </h2>
            <p>
              Estos Términos se rigen por las leyes de la República del Ecuador.
              Cualquier controversia derivada de los mismos se someterá a los
              jueces y tribunales competentes de la ciudad de Quito, Ecuador,
              renunciando las partes a cualquier otro fuero.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">10. Contacto</h2>
            <p>
              Para cualquier consulta sobre estos Términos y Condiciones, puede
              escribirnos a{" "}
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
