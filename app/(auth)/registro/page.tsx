import type { Metadata } from "next"
import { RegisterForm } from "./register-form"

export const metadata: Metadata = { title: "Crear cuenta" }

export default function RegisterPage() {
  return (
    <>
      <header className="public-head">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "var(--c-brand)",
              borderRadius: 6,
              display: "grid",
              placeItems: "center",
              color: "white",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            AM
          </div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>AgendaMed</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="muted" style={{ fontSize: 13 }}>¿Ya tienes cuenta?</span>
          <a href="/login" className="btn btn-secondary btn-sm">Iniciar sesión</a>
        </div>
      </header>

      <div
        style={{
          background: "var(--c-brand-soft)",
          borderBottom: "1px solid var(--c-brand-border)",
          padding: "10px 40px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "var(--fs-sm)",
        }}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--c-brand-fg)" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <span>
          <strong>14 días gratis</strong> · sin tarjeta de crédito · cancela cuando quieras
        </span>
      </div>

      <main
        className="col-split"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: 40,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "40px 24px 64px",
        }}
      >
        <div className="card">
          <h1 style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-semibold)", marginBottom: 4 }}>
            Crea tu consultorio en AgendaMed
          </h1>
          <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 24 }}>
            Empieza con la prueba gratuita. Configurarás tu consultorio en menos de 5 minutos.
          </p>
          <RegisterForm />
          <p className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 16 }}>
            Al crear tu cuenta, tu prueba de 14 días inicia hoy. No te cobramos hasta que elijas un plan.
          </p>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: "var(--fs-md)", fontWeight: "var(--fw-semibold)", marginBottom: 16 }}>
              Tu consultorio, organizado de verdad
            </h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Agenda visual con vista día / semana / mes",
                "Recordatorios automáticos por WhatsApp",
                "Generador de recetas en PDF",
                "Teleconsultas con Zoom integrado",
                "Página pública para que tus pacientes agenden solos",
                "100% en español, hecho en México",
              ].map((feat) => (
                <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "var(--fs-sm)" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--c-success)" strokeWidth="2.5" style={{ marginTop: 1, flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="card"
            style={{ background: "var(--c-surface-2)" }}
          >
            <p style={{ fontSize: "var(--fs-sm)", fontStyle: "italic", lineHeight: 1.65, marginBottom: 14 }}>
              &ldquo;En 3 días dejé de gestionar citas por WhatsApp. Mis pacientes están más contentos y yo gano una hora al día.&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                className="avatar"
                style={{ width: 32, height: 32, background: "oklch(0.72 0.12 320)", fontSize: 11 }}
              >
                LM
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: "var(--fs-sm)" }}>Dra. Lucía Mendoza</div>
                <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>Ginecología · Puebla</div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </>
  )
}
