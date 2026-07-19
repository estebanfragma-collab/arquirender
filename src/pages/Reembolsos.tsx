import { Link } from "react-router-dom";

export default function Reembolsos() {
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
          Política de Reembolsos
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Última actualización: 18 de julio de 2026
        </p>

        <div className="mt-10 space-y-8 text-[15px] leading-[1.7] text-[#374151]">
          <section>
            <p>
              En ArquiRender (arquirender.lat) queremos que quede satisfecho con
              el Servicio. Esta política explica las condiciones bajo las cuales
              puede solicitar un reembolso. El responsable del Servicio es Esteban
              Ponce, Quito, Ecuador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              1. Suscripciones
            </h2>
            <p>
              ArquiRender ofrece planes de suscripción y créditos para la
              generación de renders. Al contratar un plan, usted acepta los
              precios y la modalidad de facturación mostrados al momento de la
              compra. Las suscripciones se renuevan automáticamente al finalizar
              cada periodo, salvo que sean canceladas con anterioridad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              2. Política de reembolso
            </h2>
            <p>
              Ofrecemos una garantía de reembolso de <strong>7 días</strong> sobre
              el <strong>primer pago</strong> de una suscripción. Si dentro de los
              7 días posteriores a su primera compra no está satisfecho, puede
              solicitar el reembolso completo de ese primer pago. Esta garantía
              aplica una sola vez por usuario y sobre el pago inicial.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              3. Cómo solicitar un reembolso
            </h2>
            <p>
              Para solicitar un reembolso, escriba a{" "}
              <a
                href="mailto:ayalgoritmo@gmail.com"
                className="text-[#EA580C] underline"
              >
                ayalgoritmo@gmail.com
              </a>{" "}
              desde el correo asociado a su cuenta, indicando su nombre y el motivo
              de la solicitud. Procesaremos las solicitudes válidas dentro de un
              plazo razonable. El reembolso se acreditará al mismo método de pago
              utilizado en la compra.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              4. Cancelaciones
            </h2>
            <p>
              Puede cancelar su suscripción en cualquier momento desde su cuenta o
              escribiéndonos. Al cancelar, no se generarán cobros futuros y
              conservará el acceso a las funciones de su plan hasta el final del
              periodo ya pagado. No se realizan reembolsos proporcionales por
              periodos parcialmente utilizados, salvo lo dispuesto en la garantía
              de 7 días.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              5. Procesamiento vía Paddle
            </h2>
            <p>
              Todos los pagos y reembolsos son gestionados por Paddle, nuestro
              procesador de pagos y comerciante registrado (Merchant of Record).
              Los tiempos de acreditación del reembolso pueden variar según su
              entidad bancaria o método de pago, generalmente entre 5 y 10 días
              hábiles una vez aprobada la solicitud.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">
              6. Excepciones
            </h2>
            <p>
              No se otorgarán reembolsos en casos de: (a) uso abusivo o
              fraudulento del Servicio; (b) solicitudes fuera del plazo de 7 días
              del primer pago; (c) renovaciones posteriores al primer periodo; o
              (d) consumo sustancial de créditos o renders durante el periodo. Nos
              reservamos el derecho de evaluar cada solicitud de buena fe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#111] mb-3">7. Contacto</h2>
            <p>
              Para cualquier duda sobre esta Política de Reembolsos, escríbanos a{" "}
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
