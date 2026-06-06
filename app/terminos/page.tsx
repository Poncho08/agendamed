import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y Condiciones de uso de AgendaMed",
}

export default function TerminosPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 80px" }}>
        <Link href="/" className="link" style={{ fontSize: "var(--fs-sm)", display: "inline-block", marginBottom: 24 }}>
          ← Volver
        </Link>

        <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-semibold)", marginBottom: 8 }}>
          Términos y Condiciones — AgendaMed
        </h1>
        <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 32 }}>
          Última actualización: junio 2026
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, lineHeight: 1.7, fontSize: "var(--fs-sm)" }}>
          <Seccion titulo="1. Descripción del servicio">
            AgendaMed es una plataforma de software como servicio (SaaS) operada por Inovit que
            permite a profesionales de la salud gestionar citas, expedientes básicos, recetas
            digitales y una página pública de autoagendado para sus pacientes. El servicio se
            ofrece &quot;tal cual&quot; y puede actualizarse o modificarse para mejorar su funcionamiento.
          </Seccion>

          <Seccion titulo="2. Obligaciones del médico usuario">
            El médico usuario es el único responsable de: (a) la veracidad y exactitud de la
            información que captura; (b) contar con la cédula profesional y autorizaciones legales
            para ejercer; (c) obtener el consentimiento de sus pacientes para el tratamiento de sus
            datos; (d) el uso adecuado de las recetas y documentos generados; y (e) mantener la
            confidencialidad de sus credenciales de acceso.
          </Seccion>

          <Seccion titulo="3. Limitación de responsabilidad">
            AgendaMed es una herramienta de apoyo administrativo. <strong>No constituye un expediente
            clínico oficial</strong> ni sustituye los registros médicos que la legislación exige al
            profesional de la salud. Los documentos generados (incluidas las recetas en PDF) son
            documentos de apoyo y no sustituyen una receta médica oficial. Inovit no será responsable
            por decisiones clínicas, diagnósticos, tratamientos ni por el uso que el médico haga de la
            plataforma.
          </Seccion>

          <Seccion titulo="4. Planes, pagos y cancelación">
            El servicio puede ofrecerse en planes gratuitos y de pago. El usuario puede cancelar su
            suscripción en cualquier momento. Cuando apliquen cambios sustanciales en precios o
            condiciones, se notificará con al menos <strong>30 días</strong> de anticipación por
            correo electrónico. Al cancelar, el usuario podrá exportar sus datos durante el periodo
            indicado en su plan.
          </Seccion>

          <Seccion titulo="5. Disponibilidad">
            Hacemos esfuerzos razonables por mantener el servicio disponible, pero no garantizamos
            disponibilidad ininterrumpida. Podemos realizar mantenimientos programados notificando
            cuando sea posible.
          </Seccion>

          <Seccion titulo="6. Ley aplicable y jurisdicción">
            Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier
            controversia, las partes se someten a la jurisdicción de los tribunales competentes de
            la Ciudad de México, renunciando a cualquier otro fuero.
          </Seccion>

          <Seccion titulo="7. Contacto">
            Para dudas sobre estos Términos, escríbenos a{" "}
            <a href="mailto:hola@inovit.mx" className="link">hola@inovit.mx</a>.
          </Seccion>
        </div>

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--c-border)" }}>
          <Link href="/privacidad" className="link" style={{ fontSize: "var(--fs-sm)" }}>
            Ver Aviso de Privacidad →
          </Link>
        </div>
      </div>
    </div>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontSize: "var(--fs-md)", fontWeight: 600, marginBottom: 8 }}>{titulo}</h2>
      <p style={{ color: "var(--c-text-muted)" }}>{children}</p>
    </section>
  )
}
