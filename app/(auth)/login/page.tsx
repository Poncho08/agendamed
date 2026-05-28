import type { Metadata } from "next"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Iniciar sesión" }

export default function LoginPage() {
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
          <span className="muted" style={{ fontSize: 13 }}>¿No tienes cuenta?</span>
          <a href="/registro" className="btn btn-secondary btn-sm">Crear cuenta</a>
        </div>
      </header>

      <main
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "calc(100vh - 64px)",
          padding: "40px 16px",
        }}
      >
        <div
          className="card"
          style={{ width: "100%", maxWidth: 400 }}
        >
          <h1
            style={{
              fontSize: "var(--fs-xl)",
              fontWeight: "var(--fw-semibold)",
              marginBottom: 4,
            }}
          >
            Bienvenido de vuelta
          </h1>
          <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 24 }}>
            Ingresa para gestionar tu consultorio.
          </p>
          <LoginForm />
          <p
            className="muted"
            style={{ fontSize: "var(--fs-xs)", marginTop: 16, textAlign: "center" }}
          >
            Al iniciar sesión aceptas nuestros{" "}
            <a href="/terminos" className="link">Términos</a> y{" "}
            <a href="/privacidad" className="link">Aviso de Privacidad</a>.
          </p>
        </div>
      </main>
    </>
  )
}
