import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Aviso de Privacidad",
  description: "Aviso de Privacidad de AgendaMed / Inovit",
}

export default function PrivacidadPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 80px" }}>
        <Link href="/" className="link" style={{ fontSize: "var(--fs-sm)", display: "inline-block", marginBottom: 24 }}>
          ← Volver
        </Link>

        <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-semibold)", marginBottom: 8 }}>
          Aviso de Privacidad — AgendaMed / Inovit
        </h1>
        <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 32 }}>
          Última actualización: junio 2026 · Conforme a la LFPDPPP
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, lineHeight: 1.7, fontSize: "var(--fs-sm)" }}>
          <Seccion titulo="1. Identidad y domicilio del responsable">
            <strong>Inovit</strong>, con domicilio en Guadalajara, Jalisco, México, es responsable
            del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos
            Personales en Posesión de los Particulares (LFPDPPP) y su reglamento.
          </Seccion>

          <Seccion titulo="2. Datos personales que recabamos">
            Del <strong>médico usuario</strong> recabamos: nombre completo, correo electrónico,
            teléfono, especialidad, cédula profesional (opcional) y datos del consultorio. Estos
            datos se obtienen directamente cuando te registras y usas la plataforma.
          </Seccion>

          <Seccion titulo="3. Datos de los pacientes">
            Los datos de los pacientes que el médico captura (nombre, teléfono, email, fecha de
            nacimiento, notas e historial) son <strong>responsabilidad del médico usuario</strong>,
            quien actúa como responsable de dichos datos frente a sus pacientes. Inovit únicamente
            actúa como <strong>encargado</strong> que procesa esa información por cuenta y bajo
            instrucción del médico, para prestar el servicio.
          </Seccion>

          <Seccion titulo="4. Finalidad del tratamiento">
            Usamos los datos para: (a) prestar el servicio de agenda digital, gestión de citas,
            pacientes y recetas; (b) enviar comunicaciones operativas (confirmaciones y recordatorios
            de cita); (c) dar soporte técnico; y (d) cumplir obligaciones legales. No usamos los datos
            con fines de mercadotecnia sin tu consentimiento.
          </Seccion>

          <Seccion titulo="5. Derechos ARCO">
            Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte (ARCO) al tratamiento de tus
            datos personales, así como a revocar tu consentimiento. Para ejercerlos, envía tu
            solicitud a{" "}
            <a href="mailto:hola@inovit.mx" className="link">hola@inovit.mx</a>{" "}
            indicando tu nombre y el derecho que deseas ejercer. Responderemos en los plazos que marca
            la ley.
          </Seccion>

          <Seccion titulo="6. Transferencias y encargados">
            No transferimos tus datos a terceros con fines comerciales. Para operar el servicio nos
            apoyamos en proveedores de infraestructura que actúan como encargados y cumplen estándares
            de seguridad: <strong>Supabase</strong> (base de datos y autenticación),{" "}
            <strong>Vercel</strong> (hospedaje) y <strong>Resend</strong> (envío de correos). Estos
            proveedores procesan los datos únicamente para prestar dichos servicios.
          </Seccion>

          <Seccion titulo="7. Medidas de seguridad">
            Implementamos medidas técnicas y administrativas razonables (cifrado en tránsito, control
            de acceso por usuario y aislamiento de datos entre consultorios) para proteger tus datos
            contra daño, pérdida o acceso no autorizado.
          </Seccion>

          <Seccion titulo="8. Cambios al aviso de privacidad">
            Cualquier modificación a este Aviso será notificada por correo electrónico y publicada en
            esta misma página, indicando la fecha de la última actualización.
          </Seccion>

          <Seccion titulo="9. Contacto">
            Para cualquier duda sobre el tratamiento de tus datos:{" "}
            <a href="mailto:hola@inovit.mx" className="link">hola@inovit.mx</a>.
          </Seccion>
        </div>

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--c-border)" }}>
          <Link href="/terminos" className="link" style={{ fontSize: "var(--fs-sm)" }}>
            Ver Términos y Condiciones →
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
