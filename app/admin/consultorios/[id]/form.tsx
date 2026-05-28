"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { fmtDate } from "@/lib/utils"

interface Consultorio {
  id: string
  nombre: string
  medico_nombre: string
  especialidad: string
  email: string
  ciudad: string | null
  plan: string
  plan_estado: string
  prueba_termina_en: string
  created_at: string
  max_pacientes: number
}

export function AdminConsultorioForm({ consultorio }: { consultorio: Consultorio }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(consultorio.plan)
  const [planEstado, setPlanEstado] = useState(consultorio.plan_estado)
  const [maxPacientes, setMaxPacientes] = useState(String(consultorio.max_pacientes))

  async function handleSave() {
    setLoading(true)
    const res = await fetch(`/api/admin/consultorio/${consultorio.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, plan_estado: planEstado, max_pacientes: Number(maxPacientes) }),
    })
    if (res.ok) {
      toast.success("Consultorio actualizado")
      router.refresh()
    } else {
      toast.error("Error al actualizar")
    }
    setLoading(false)
  }

  return (
    <div className="card stack">
      {/* Info de solo lectura */}
      <div className="grid-2">
        <div className="field">
          <label className="field__label">Nombre</label>
          <div className="input" style={{ background: "var(--c-surface-2)", cursor: "default" }}>
            {consultorio.nombre}
          </div>
        </div>
        <div className="field">
          <label className="field__label">Médico</label>
          <div className="input" style={{ background: "var(--c-surface-2)", cursor: "default" }}>
            {consultorio.medico_nombre}
          </div>
        </div>
        <div className="field">
          <label className="field__label">Email</label>
          <div className="input" style={{ background: "var(--c-surface-2)", cursor: "default" }}>
            {consultorio.email}
          </div>
        </div>
        <div className="field">
          <label className="field__label">Ciudad</label>
          <div className="input" style={{ background: "var(--c-surface-2)", cursor: "default" }}>
            {consultorio.ciudad ?? "—"}
          </div>
        </div>
        <div className="field">
          <label className="field__label">Registro</label>
          <div className="input" style={{ background: "var(--c-surface-2)", cursor: "default" }}>
            {fmtDate(consultorio.created_at)}
          </div>
        </div>
        <div className="field">
          <label className="field__label">Prueba termina</label>
          <div className="input" style={{ background: "var(--c-surface-2)", cursor: "default" }}>
            {fmtDate(consultorio.prueba_termina_en)}
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--c-border)", margin: "4px 0" }} />

      {/* Campos editables */}
      <div className="grid-2">
        <div className="field">
          <label className="field__label">Plan</label>
          <select className="select" value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="prueba">Prueba</option>
            <option value="base">Base</option>
            <option value="pro">Pro</option>
          </select>
        </div>
        <div className="field">
          <label className="field__label">Estado del plan</label>
          <select className="select" value={planEstado} onChange={(e) => setPlanEstado(e.target.value)}>
            <option value="activo">Activo</option>
            <option value="suspendido">Suspendido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="field">
          <label className="field__label">Máx. pacientes</label>
          <input
            className="input"
            type="number"
            min={0}
            value={maxPacientes}
            onChange={(e) => setMaxPacientes(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  )
}
