"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { z } from "zod"

const schema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [listo, setListo] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = schema.safeParse({ password, confirmPassword })
    if (!result.success) {
      toast.error(result.error.errors[0].message)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error("El enlace expiró o no es válido. Solicita uno nuevo desde el login.")
      setTimeout(() => router.push("/login"), 1500)
      return
    }

    setListo(true)
    toast.success("Contraseña actualizada correctamente")
    await supabase.auth.signOut()
    setTimeout(() => router.push("/login"), 2000)
  }

  if (listo) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--c-bg)" }}>
        <div style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Contraseña actualizada</h2>
          <p className="muted" style={{ fontSize: "var(--fs-sm)" }}>Inicia sesión con tu nueva contraseña…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--c-bg)" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, background: "var(--c-brand)", borderRadius: 10, display: "grid", placeItems: "center", margin: "0 auto 16px", color: "white", fontWeight: 700, fontSize: 14 }}>
            AM
          </div>
          <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-semibold)", marginBottom: 8 }}>
            Nueva contraseña
          </h1>
          <p className="muted" style={{ fontSize: "var(--fs-sm)" }}>
            Elige una contraseña segura de al menos 8 caracteres.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label className="field__label">Nueva contraseña</label>
              <input
                className="input"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="field">
              <label className="field__label">Confirmar contraseña</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
            >
              {loading ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
