"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  format, addDays, startOfMonth, startOfWeek, addMinutes, parseISO,
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { fmtMxn } from "@/lib/utils"
import { z } from "zod"

interface Servicio { id: string; nombre: string; duracion_min: number; precio_mxn: number; tipo: string }
interface Horario { dia_semana: number; activo: boolean; inicio_1: string | null; fin_1: string | null }

interface Props {
  consultorioId: string
  servicios: Servicio[]
  horarios: Horario[]
}

const SLOTS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30"]

const schema = z.object({
  nombre: z.string().min(2, "Nombre muy corto"),
  telefono: z.string().min(8, "Teléfono inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  consentimiento: z.boolean().refine(v => v, "Debes aceptar"),
  consentimientoWA: z.boolean(),
})

export function PublicBookingClient({ consultorioId, servicios, horarios }: Props) {
  const [paso, setPaso] = useState(1)
  const [servicioId, setServicioId] = useState("")
  const [fecha, setFecha] = useState<Date | null>(null)
  const [slot, setSlot] = useState("")
  const [form, setForm] = useState({
    nombre: "", telefono: "", email: "", consentimiento: false, consentimientoWA: false,
  })
  const [loading, setLoading] = useState(false)
  const [exitoso, setExitoso] = useState(false)

  const [mesVista, setMesVista] = useState(new Date())
  const primerDia = startOfWeek(startOfMonth(mesVista), { weekStartsOn: 1 })
  const diasCal = Array.from({ length: 42 }, (_, i) => addDays(primerDia, i))

  const servicio = servicios.find(s => s.id === servicioId)

  function diaHabilitado(d: Date) {
    const dow = d.getDay() // 0=dom
    return horarios.some(h => h.dia_semana === dow && h.activo)
  }

  async function confirmar() {
    const result = schema.safeParse(form)
    if (!result.success) { toast.error(result.error.errors[0].message); return }
    if (!fecha || !slot || !servicioId) { toast.error("Completa todos los campos"); return }

    setLoading(true)
    const inicio = parseISO(`${format(fecha, "yyyy-MM-dd")}T${slot}:00`)
    const fin = addMinutes(inicio, servicio?.duracion_min ?? 30)

    const res = await fetch("/api/public/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consultorio_id: consultorioId,
        servicio_id: servicioId,
        inicio: inicio.toISOString(),
        fin: fin.toISOString(),
        duracion_min: servicio?.duracion_min ?? 30,
        paciente: {
          nombre: form.nombre,
          telefono: form.telefono,
          email: form.email || null,
          consentimiento_privacidad: form.consentimiento,
          consentimiento_whatsapp: form.consentimientoWA,
        },
      }),
    })

    setLoading(false)
    if (!res.ok) {
      toast.error("Error al agendar. Intenta de nuevo.")
      return
    }
    setExitoso(true)
  }

  if (exitoso) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ width: 56, height: 56, background: "var(--c-success-soft)", borderRadius: "50%", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
          <Check size={24} style={{ color: "var(--c-success)" }} />
        </div>
        <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-semibold)", marginBottom: 8 }}>¡Cita agendada!</h2>
        <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 4 }}>
          {servicio?.nombre} · {fecha && format(fecha, "d 'de' MMMM yyyy", { locale: es })} · {slot}
        </p>
        {form.consentimientoWA && (
          <p className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 12 }}>
            Recibirás un recordatorio por WhatsApp el día anterior.
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ display: "flex", marginBottom: 32 }}>
        {["Servicio", "Fecha", "Horario", "Tus datos"].map((label, i) => (
          <div key={label} style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", margin: "0 auto 4px",
                display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600,
                background: paso > i + 1 ? "var(--c-success)" : paso === i + 1 ? "var(--c-brand)" : "var(--c-border)",
                color: paso >= i + 1 ? "white" : "var(--c-text-faint)",
              }}>
                {paso > i + 1 ? <Check size={12} /> : i + 1}
              </div>
              <span style={{ fontSize: 10, color: paso === i + 1 ? "var(--c-brand-fg)" : "var(--c-text-faint)", fontWeight: paso === i + 1 ? 600 : 400 }}>
                {label}
              </span>
            </div>
            {i < 3 && <div style={{ height: 1, flex: 1, background: paso > i + 1 ? "var(--c-success)" : "var(--c-border)", margin: "0 4px", marginBottom: 20 }} />}
          </div>
        ))}
      </div>

      {/* Paso 1: Servicio */}
      {paso === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {servicios.map(s => (
            <button
              key={s.id}
              onClick={() => { setServicioId(s.id); setPaso(2) }}
              style={{
                padding: "16px",
                border: `1.5px solid ${servicioId === s.id ? "var(--c-brand)" : "var(--c-border)"}`,
                borderRadius: "var(--r-lg)",
                textAlign: "left",
                background: "var(--c-surface)",
                transition: "border-color var(--t-fast)",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "var(--fs-md)" }}>{s.nombre}</div>
              <div className="muted" style={{ fontSize: "var(--fs-sm)", marginTop: 4 }}>
                {s.duracion_min} min · {fmtMxn(s.precio_mxn)}
                {s.tipo === "teleconsulta" && " · Teleconsulta Zoom"}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Paso 2: Fecha */}
      {paso === 2 && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <button className="iconbtn" onClick={() => setMesVista(m => addDays(startOfMonth(m), -1))}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontWeight: 600, flex: 1, textAlign: "center", textTransform: "capitalize" }}>
              {format(mesVista, "MMMM yyyy", { locale: es })}
            </span>
            <button className="iconbtn" onClick={() => setMesVista(m => addDays(startOfMonth(m), 32))}>
              <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {["L","M","X","J","V","S","D"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, color: "var(--c-text-faint)", padding: "4px 0", fontWeight: 600 }}>{d}</div>
            ))}
            {diasCal.map((d, i) => {
              const esMes = d.getMonth() === mesVista.getMonth()
              const esHabil = diaHabilitado(d) && d >= new Date()
              const esSelec = fecha && format(d, "yyyy-MM-dd") === format(fecha, "yyyy-MM-dd")
              return (
                <button
                  key={i}
                  disabled={!esHabil || !esMes}
                  onClick={() => { setFecha(d); setPaso(3) }}
                  style={{
                    width: "100%", aspectRatio: "1", borderRadius: "50%", fontSize: 13,
                    fontWeight: esSelec ? 700 : 400,
                    background: esSelec ? "var(--c-brand)" : "transparent",
                    color: esSelec ? "white" : !esMes || !esHabil ? "var(--c-text-faint)" : "var(--c-text)",
                    opacity: !esMes || !esHabil ? 0.35 : 1,
                    cursor: esHabil && esMes ? "pointer" : "default",
                  }}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setPaso(1)}>
            ← Cambiar servicio
          </button>
        </div>
      )}

      {/* Paso 3: Horario */}
      {paso === 3 && fecha && (
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: "var(--fs-md)", marginBottom: 4, textTransform: "capitalize" }}>
            {format(fecha, "EEEE d 'de' MMMM", { locale: es })}
          </div>
          <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 16 }}>Elige el horario:</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {SLOTS.map(s => (
              <button
                key={s}
                onClick={() => { setSlot(s); setPaso(4) }}
                style={{
                  padding: "10px 4px",
                  border: `1.5px solid ${slot === s ? "var(--c-brand)" : "var(--c-border)"}`,
                  borderRadius: "var(--r-sm)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--fs-sm)",
                  background: slot === s ? "var(--c-brand-soft)" : "transparent",
                  color: slot === s ? "var(--c-brand-fg)" : "var(--c-text)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setPaso(2)}>
            ← Cambiar fecha
          </button>
        </div>
      )}

      {/* Paso 4: Datos */}
      {paso === 4 && (
        <div className="card">
          <h3 style={{ fontSize: "var(--fs-md)", fontWeight: 600, marginBottom: 16 }}>Tus datos</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="field">
              <label className="field__label">Nombre completo *</label>
              <input className="input" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} placeholder="Dr. / Sra. / Sr. Tu nombre" />
            </div>
            <div className="field">
              <label className="field__label">Teléfono *</label>
              <input className="input" type="tel" value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))} placeholder="33 1234 5678" />
            </div>
            <div className="field">
              <label className="field__label">Email (opcional)</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="tu@email.com" />
            </div>
            <label className="checkbox" style={{ alignItems: "flex-start", cursor: "pointer" }} onClick={() => setForm(f => ({...f, consentimiento: !f.consentimiento}))}>
              <div className={`checkbox__box ${form.consentimiento ? "checked" : ""}`} style={{ marginTop: 1 }}>
                {form.consentimiento && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className="checkbox__label" style={{ fontSize: "var(--fs-xs)" }}>
                Acepto el <a href="/privacidad" className="link" onClick={e => e.stopPropagation()}>Aviso de Privacidad</a> y el tratamiento de mis datos. *
              </span>
            </label>
            <label className="checkbox" style={{ alignItems: "flex-start", cursor: "pointer" }} onClick={() => setForm(f => ({...f, consentimientoWA: !f.consentimientoWA}))}>
              <div className={`checkbox__box ${form.consentimientoWA ? "checked" : ""}`} style={{ marginTop: 1 }}>
                {form.consentimientoWA && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className="checkbox__label" style={{ fontSize: "var(--fs-xs)" }}>
                Acepto recibir recordatorios de citas por WhatsApp.
              </span>
            </label>
          </div>

          <div style={{ marginTop: 20, padding: "12px 14px", background: "var(--c-surface-2)", borderRadius: "var(--r-md)", fontSize: "var(--fs-xs)", display: "flex", flexDirection: "column", gap: 4 }}>
            <div><strong>Servicio:</strong> {servicio?.nombre}</div>
            <div><strong>Fecha:</strong> <span style={{ textTransform: "capitalize" }}>{fecha && format(fecha, "d 'de' MMMM", { locale: es })}</span></div>
            <div><strong>Hora:</strong> {slot}</div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => setPaso(3)}>← Volver</button>
            <button
              className="btn btn-primary btn-full"
              onClick={confirmar}
              disabled={loading || !form.consentimiento}
            >
              {loading ? "Agendando…" : "Confirmar cita"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
