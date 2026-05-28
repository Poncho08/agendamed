"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { z } from "zod"

const schema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido").or(z.literal("")),
  telefono: z.string().min(10, "Teléfono inválido").or(z.literal("")),
  fecha_nacimiento: z.string().or(z.literal("")),
  sexo: z.enum(["M", "F", "otro", ""]),
  grupo_sanguineo: z.string().or(z.literal("")),
  alergias: z.string().or(z.literal("")),
  notas_medicas: z.string().or(z.literal("")),
  consentimiento_privacidad: z.boolean().refine((v) => v, "Requerido"),
  consentimiento_whatsapp: z.boolean(),
})

const GRUPOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export function NuevoPacienteForm({ consultorioId }: { consultorioId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    sexo: "" as "M" | "F" | "otro" | "",
    grupo_sanguineo: "",
    alergias: "",
    notas_medicas: "",
    consentimiento_privacidad: false,
    consentimiento_whatsapp: false,
  })

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: paciente, error } = await (supabase.from("pacientes") as any).insert({
      consultorio_id: consultorioId,
      nombre: form.nombre,
      email: form.email || null,
      telefono: form.telefono || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      sexo: form.sexo || null,
      grupo_sanguineo: form.grupo_sanguineo || null,
      alergias: form.alergias || null,
      notas_medicas: form.notas_medicas || null,
      consentimiento_privacidad: form.consentimiento_privacidad,
      consentimiento_whatsapp: form.consentimiento_whatsapp,
    }).select("id").single()

    if (error) {
      toast.error("Error al guardar el paciente")
      setLoading(false)
      return
    }

    toast.success(`${form.nombre} agregado`)
    router.push(`/panel/pacientes/${paciente.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="card stack">
      {/* Datos personales */}
      <div>
        <div className="card__head"><div className="card__title">Datos personales</div></div>
        <div className="stack" style={{ gap: 14 }}>
          <div className="field">
            <label className="field__label">Nombre completo *</label>
            <input
              className="input"
              placeholder="Ej. Ana Martínez López"
              value={form.nombre}
              onChange={(e) => update("nombre", e.target.value)}
              required
            />
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="field__label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="ana@ejemplo.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field__label">Teléfono</label>
              <input
                className="input"
                type="tel"
                placeholder="+52 55 1234 5678"
                value={form.telefono}
                onChange={(e) => update("telefono", e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field__label">Fecha de nacimiento</label>
              <input
                className="input"
                type="date"
                value={form.fecha_nacimiento}
                onChange={(e) => update("fecha_nacimiento", e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field__label">Sexo</label>
              <select className="select" value={form.sexo} onChange={(e) => update("sexo", e.target.value as typeof form.sexo)}>
                <option value="">Sin especificar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="field">
              <label className="field__label">Grupo sanguíneo</label>
              <select className="select" value={form.grupo_sanguineo} onChange={(e) => update("grupo_sanguineo", e.target.value)}>
                <option value="">Sin especificar</option>
                {GRUPOS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--c-border-faint)" }} />

      {/* Datos clínicos */}
      <div>
        <div className="card__head"><div className="card__title">Datos clínicos</div></div>
        <div className="stack" style={{ gap: 14 }}>
          <div className="field">
            <label className="field__label">Alergias</label>
            <input
              className="input"
              placeholder="Ej. Penicilina, mariscos"
              value={form.alergias}
              onChange={(e) => update("alergias", e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label">Notas médicas</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Antecedentes, condiciones previas, etc."
              value={form.notas_medicas}
              onChange={(e) => update("notas_medicas", e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--c-border-faint)" }} />

      {/* Consentimientos */}
      <div>
        <div className="card__head"><div className="card__title">Consentimientos</div></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label
            className="checkbox"
            style={{ cursor: "pointer", alignItems: "flex-start" }}
            onClick={() => update("consentimiento_privacidad", !form.consentimiento_privacidad)}
          >
            <div className={`checkbox__box ${form.consentimiento_privacidad ? "checked" : ""}`} style={{ marginTop: 1 }}>
              {form.consentimiento_privacidad && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="checkbox__label">
              El paciente acepta el <span className="link">Aviso de Privacidad</span> y el tratamiento de sus datos. *
            </span>
          </label>

          <label
            className="checkbox"
            style={{ cursor: "pointer", alignItems: "flex-start" }}
            onClick={() => update("consentimiento_whatsapp", !form.consentimiento_whatsapp)}
          >
            <div className={`checkbox__box ${form.consentimiento_whatsapp ? "checked" : ""}`} style={{ marginTop: 1 }}>
              {form.consentimiento_whatsapp && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="checkbox__label">
              El paciente acepta recibir recordatorios y notificaciones por WhatsApp.
            </span>
          </label>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.back()}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !form.consentimiento_privacidad}
        >
          {loading ? "Guardando…" : "Guardar paciente"}
        </button>
      </div>
    </form>
  )
}
