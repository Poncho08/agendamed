import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Planes y precios" }

export default function PlanesPage({
  searchParams,
}: {
  searchParams: { expired?: string }
}) {
  const expirado = searchParams.expired === "1"

  return (
    <>
      <header className="public-head">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "var(--c-brand)", borderRadius: 6, display: "grid", placeItems: "center", color: "white", fontSize: 12, fontWeight: 700 }}>AM</div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>AgendaMed</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/login" className="link" style={{ fontSize: 13 }}>Iniciar sesión</Link>
          <Link href="/registro" className="btn btn-primary btn-sm">Empezar gratis</Link>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px 80px" }}>
        {expirado && (
          <div
            style={{
              background: "var(--c-warning-soft)",
              border: "1px solid oklch(0.85 0.08 80)",
              borderRadius: "var(--r-lg)",
              padding: "20px 24px",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 40,
            }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--c-warning-fg)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <div style={{ fontWeight: 600, color: "var(--c-warning-fg)" }}>Tu prueba ha terminado</div>
              <p className="muted" style={{ fontSize: "var(--fs-sm)", marginTop: 4 }}>
                Tranquilo — tus pacientes y citas están guardados y seguros. Elige un plan para reanudar tu acceso.
              </p>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="page__eyebrow">Planes y precios</span>
          <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: "var(--fw-semibold)", marginTop: 8, marginBottom: 12 }}>
            El sistema que tu consultorio necesitaba
          </h1>
          <p className="muted" style={{ fontSize: "var(--fs-md)" }}>
            Olvídate de la agenda en WhatsApp. Empieza con 14 días gratis — sin tarjeta de crédito.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 720, margin: "0 auto 60px" }}>
          {/* Plan Base */}
          <PlanCard
            nombre="Plan Base"
            desc="Para consultorios individuales que empiezan a profesionalizarse."
            precio={1500}
            features={[
              "Hasta 200 pacientes activos",
              "Citas ilimitadas",
              "Agenda en 3 vistas (día / semana / mes)",
              "Recordatorios automáticos por WhatsApp",
              "Generador de recetas en PDF",
              "Página pública para agendar",
              "Felicitaciones de cumpleaños",
              "Soporte por email",
            ]}
            cta="Empezar 14 días gratis"
            href="/registro"
            variant="secondary"
          />

          {/* Plan Pro */}
          <PlanCard
            nombre="Plan Pro"
            desc="Para consultorios consolidados que quieren crecer sin caos."
            precio={2500}
            features={[
              "Hasta 500 pacientes activos",
              "Todo lo del Plan Base, más:",
              "Teleconsultas integradas con Zoom",
              "Recordatorios con autocancelación",
              "Plantillas de receta ilimitadas",
              "Métricas y reportes mensuales",
              "Exportación de datos (CSV/JSON)",
              "Soporte prioritario por WhatsApp",
            ]}
            cta="Empezar 14 días gratis"
            href="/registro"
            variant="primary"
            popular
          />
        </div>

        {/* Garantías */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 60 }}>
          {[
            { icon: "🔒", title: "Sin tarjeta de crédito", desc: "Empieza tu prueba en menos de 2 minutos. Cancela cuando quieras." },
            { icon: "📞", title: "Soporte en español", desc: "Equipo en México, atención de lunes a sábado." },
            { icon: "🏢", title: "Empresas y clínicas", desc: "¿Más de 500 pacientes? Hablemos." },
          ].map((g) => (
            <div key={g.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>{g.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{g.title}</div>
                <p className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 4 }}>{g.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <section>
          <h3 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-semibold)", marginBottom: 24, textAlign: "center" }}>
            Preguntas frecuentes
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { q: "¿Cómo funciona la prueba gratuita?", a: "Recibes acceso completo al Plan Pro por 14 días. Al terminar, eliges Base o Pro. No te cobramos automáticamente." },
              { q: "¿Acepto pacientes nuevos en la prueba?", a: "Sí. Puedes invitar pacientes, agendar citas, enviar recetas y todo lo demás. Tus datos quedan guardados al pasar a plan pagado." },
              { q: "¿Cómo pago?", a: "Por transferencia bancaria. Te enviaremos los datos y activaremos tu cuenta en menos de 2 horas en días hábiles." },
              { q: "¿Las recetas tienen validez oficial?", a: "Son documentos de apoyo profesionales con tus datos y firma digitalizada. Sirven como respaldo, no sustituyen receta oficial." },
            ].map((faq) => (
              <div key={faq.q} className="card">
                <h4 style={{ fontSize: "var(--fs-sm)", fontWeight: 600, marginBottom: 6 }}>{faq.q}</h4>
                <p className="muted" style={{ fontSize: "var(--fs-sm)" }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="public-foot">
        <span>© 2026 AgendaMed · Hecho en México</span>
        <span>
          <a className="link" href="/terminos">Términos</a> · <a className="link" href="/privacidad">Privacidad</a>
        </span>
      </footer>
    </>
  )
}

function PlanCard({
  nombre, desc, precio, features, cta, href, variant, popular,
}: {
  nombre: string; desc: string; precio: number; features: string[]
  cta: string; href: string; variant: "primary" | "secondary"; popular?: boolean
}) {
  return (
    <div
      className="card"
      style={{
        position: "relative",
        border: popular ? "2px solid var(--c-brand)" : undefined,
      }}
    >
      {popular && (
        <div
          style={{
            position: "absolute",
            top: -12,
            right: 16,
            background: "var(--c-brand)",
            color: "white",
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 99,
            letterSpacing: "0.04em",
          }}
        >
          Más popular
        </div>
      )}
      <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-semibold)", marginBottom: 4 }}>{nombre}</h2>
      <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 20 }}>{desc}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
        <span style={{ fontSize: "var(--fs-3xl)", fontWeight: "var(--fw-semibold)", fontFamily: "var(--font-mono)" }}>
          ${precio.toLocaleString("es-MX")}
        </span>
        <span className="muted" style={{ fontSize: "var(--fs-sm)" }}>MXN/mes</span>
      </div>
      <ul style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {features.map((f) => (
          <li key={f} style={{ display: "flex", gap: 8, fontSize: "var(--fs-sm)", alignItems: "flex-start" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--c-success)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link href={href} className={`btn btn-${variant} btn-full btn-lg`}>{cta}</Link>
    </div>
  )
}
