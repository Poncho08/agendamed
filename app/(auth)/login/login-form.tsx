"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { z } from "zod"

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña muy corta"),
})

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = schema.safeParse({ email, password })
    if (!result.success) {
      toast.error(result.error.errors[0].message)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error("Credenciales incorrectas. Verifica tu email y contraseña.")
      setLoading(false)
      return
    }

    router.push("/panel")
    router.refresh()
  }

  async function handleForgotPassword() {
    if (!email) {
      toast.error("Ingresa tu email primero")
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      toast.error("Error al enviar el correo")
    } else {
      toast.success("Te enviamos un correo", {
        description: "Revisa tu bandeja de entrada.",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="field">
        <label className="field__label">Email</label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@consultorio.com"
          autoFocus
          required
        />
      </div>

      <div className="field">
        <label className="field__label">Contraseña</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="link"
          style={{ fontSize: "var(--fs-xs)", background: "none", border: "none", cursor: "pointer" }}
          onClick={handleForgotPassword}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-lg btn-full"
        disabled={loading}
      >
        {loading ? "Ingresando…" : "Iniciar sesión"}
      </button>
    </form>
  )
}
