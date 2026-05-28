"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { z } from "zod"
import { slugify } from "@/lib/utils"

const schema = z
  .object({
    nombreConsultorio: z.string().min(2, "Mínimo 2 caracteres"),
    medicoNombre: z.string().min(2, "Mínimo 2 caracteres"),
    especialidad: z.string().min(1, "Selecciona una especialidad"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
    tyc: z.boolean().refine((v) => v, "Debes aceptar los términos"),
    privacidad: z.boolean().refine((v) => v, "Debes aceptar el aviso de privacidad"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

const ESPECIALIDADES = [
  "Medicina general",
  "Pediatría",
  "Ginecología",
  "Dermatología",
  "Cardiología",
  "Nutrición",
  "Psicología",
  "Odontología",
  "Oftalmología",
  "Ortopedia",
  "Otra",
]

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombreConsultorio: "",
    medicoNombre: "",
    especialidad: "",
    email: "",
    password: "",
    confirmPassword: "",
    tyc: false,
    privacidad: false,
  })

  function update(key: keyof typeof form, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = schema.safeParse(form)
    if (!result.success) {
      toast.error(result.error.errors[0].message)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError || !authData.user) {
      toast.error(authError?.message ?? "Error al crear la cuenta")
      setLoading(false)
      return
    }

    // Crear consultorio
    const slug = slugify(form.nombreConsultorio)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: consError } = await (supabase.from("consultorios") as any).insert({
      user_id: authData.user.id,
      nombre: form.nombreConsultorio,
      slug,
      medico_nombre: form.medicoNombre,
      especialidad: form.especialidad,
      email: form.email,
    })

    if (consError) {
      toast.error("Error al crear el consultorio. Intenta de nuevo.")
      setLoading(false)
      return
    }

    toast.success("Cuenta creada", {
      description: "Te enviamos un correo de verificación.",
    })
    router.push("/onboarding")
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="field">
        <label className="field__label">Nombre del consultorio *</label>
        <input
          className="input"
          placeholder="Consultorio Dr. García López"
          value={form.nombreConsultorio}
          onChange={(e) => update("nombreConsultorio", e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label className="field__label">Tu nombre completo *</label>
        <input
          className="input"
          placeholder="Dr. Roberto García López"
          value={form.medicoNombre}
          onChange={(e) => update("medicoNombre", e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label className="field__label">Especialidad *</label>
        <select
          className="select"
          value={form.especialidad}
          onChange={(e) => update("especialidad", e.target.value)}
          required
        >
          <option value="">Selecciona tu especialidad</option>
          {ESPECIALIDADES.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label">Email profesional *</label>
        <span className="field__hint">Te servirá para iniciar sesión.</span>
        <input
          className="input"
          type="email"
          placeholder="tu@consultorio.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
      </div>

      <div className="grid-2">
        <div className="field">
          <label className="field__label">Contraseña *</label>
          <input
            className="input"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label className="field__label">Confirmar contraseña *</label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            required
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label className="checkbox" style={{ cursor: "pointer", alignItems: "flex-start" }} onClick={() => update("tyc", !form.tyc)}>
          <div className={`checkbox__box ${form.tyc ? "checked" : ""}`} style={{ marginTop: 1 }}>
            {form.tyc && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="checkbox__label">
            Acepto los{" "}
            <a href="/terminos" className="link" onClick={(e) => e.stopPropagation()}>
              Términos y Condiciones
            </a>{" "}
            de AgendaMed.
          </span>
        </label>

        <label className="checkbox" style={{ cursor: "pointer", alignItems: "flex-start" }} onClick={() => update("privacidad", !form.privacidad)}>
          <div className={`checkbox__box ${form.privacidad ? "checked" : ""}`} style={{ marginTop: 1 }}>
            {form.privacidad && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="checkbox__label">
            Acepto el{" "}
            <a href="/privacidad" className="link" onClick={(e) => e.stopPropagation()}>
              Aviso de Privacidad
            </a>{" "}
            y el tratamiento de mis datos personales.
          </span>
        </label>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-lg btn-full"
        disabled={loading || !form.tyc || !form.privacidad}
      >
        {loading ? "Creando cuenta…" : "Crear cuenta gratis"}
      </button>
    </form>
  )
}
