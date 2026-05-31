"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Eye } from "lucide-react"
import { Cie10Input } from "@/components/cie10-input"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { fmtEdad } from "@/lib/utils"
import type { Consultorio, Paciente, PlantillaReceta, Medicamento } from "@/types/database"

interface Props {
  consultorio: Consultorio
  pacientes: Partial<Paciente>[]
  plantillas: PlantillaReceta[]
}

export function NuevaRecetaForm({ consultorio, pacientes, plantillas }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pacienteId, setPacienteId] = useState(pacientes[0]?.id ?? "")
  const [diagnostico, setDiagnostico] = useState("")
  const [indicaciones, setIndicaciones] = useState("")
  const [meds, setMeds] = useState<(Medicamento & { id: number })[]>([
    { id: 1, nombre: "", dosis: "", frecuencia: "", duracion: "" },
  ])
  const [guardarPlantilla, setGuardarPlantilla] = useState(false)
  const [nombrePlantilla, setNombrePlantilla] = useState("")

  const paciente = pacientes.find((p) => p.id === pacienteId)

  function addMed() {
    setMeds((m) => [...m, { id: Date.now(), nombre: "", dosis: "", frecuencia: "", duracion: "" }])
  }

  function removeMed(id: number) {
    setMeds((m) => m.filter((x) => x.id !== id))
  }

  function updateMed(id: number, key: keyof Medicamento, value: string) {
    setMeds((m) => m.map((x) => (x.id === id ? { ...x, [key]: value } : x)))
  }

  function applyPlantilla(id: string) {
    const pl = plantillas.find((p) => p.id === id)
    if (!pl) return
    if (pl.diagnostico) setDiagnostico(pl.diagnostico)
    if (pl.indicaciones) setIndicaciones(pl.indicaciones)
    const meds = pl.medicamentos as unknown as Medicamento[]
    if (meds?.length) {
      setMeds(meds.map((m, i) => ({ ...m, id: Date.now() + i })))
    }
    toast.info(`Plantilla "${pl.nombre}" aplicada`)
  }

  async function handleSubmit(accion: "guardar" | "whatsapp" | "pdf") {
    if (!pacienteId) { toast.error("Selecciona un paciente"); return }
    if (!diagnostico) { toast.error("Escribe el diagnóstico"); return }
    if (meds.some((m) => !m.nombre)) { toast.error("Completa el nombre de todos los medicamentos"); return }

    setLoading(true)
    const supabase = createClient()

    // Generar folio
    const { data: folioData } = await supabase.rpc("generar_folio_receta", {
      consultorio_id: consultorio.id,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: receta, error } = await (supabase.from("recetas") as any)
      .insert({
        consultorio_id: consultorio.id,
        paciente_id: pacienteId,
        folio: folioData ?? `RX-${consultorio.id.slice(0, 8).toUpperCase()}-${Date.now()}`,
        diagnostico,
        medicamentos: meds.map(({ id, ...m }) => m),
        indicaciones: indicaciones || null,
      })
      .select()
      .single()

    if (error) {
      toast.error("Error al guardar la receta")
      setLoading(false)
      return
    }

    // Guardar como plantilla si se pidió
    if (guardarPlantilla && nombrePlantilla) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("plantillas_receta") as any).insert({
        consultorio_id: consultorio.id,
        nombre: nombrePlantilla,
        diagnostico,
        medicamentos: meds.map(({ id, ...m }) => m),
        indicaciones: indicaciones || null,
      })
    }

    if (accion === "whatsapp" && paciente?.consentimiento_whatsapp && paciente.telefono) {
      await fetch("/api/whatsapp/receta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recetaId: receta.id }),
      })
      toast.success("Receta enviada por WhatsApp", {
        description: `A ${paciente.nombre}`,
      })
    } else if (accion === "pdf") {
      window.open(`/api/pdf/receta/${receta.id}`, "_blank")
    } else {
      toast.success("Receta guardada", { description: `Folio ${receta.folio}` })
    }

    router.push("/panel/recetas")
    router.refresh()
  }

  const hoy = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, alignItems: "start" }}>
      {/* Columna izquierda: formulario */}
      <div className="stack">
        {/* Paciente y plantilla */}
        <div className="card">
          <div className="card__head"><div className="card__title">Paciente y plantilla</div></div>
          <div className="grid-2">
            <div className="field">
              <label className="field__label">Paciente</label>
              <select className="select" value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label">Plantilla</label>
              <select className="select" defaultValue="" onChange={(e) => applyPlantilla(e.target.value)}>
                <option value="">— Sin plantilla —</option>
                {plantillas.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Diagnóstico */}
        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title">Diagnóstico</div>
              <div className="card__sub">Escribe o busca por nombre o código CIE-10</div>
            </div>
          </div>
          <Cie10Input
            value={diagnostico}
            onChange={setDiagnostico}
          />
        </div>

        {/* Medicamentos */}
        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title">Medicamentos</div>
              <div className="card__sub">Añade uno por línea</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addMed}>
              <Plus size={13} /> Agregar
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {meds.map((m, i) => (
              <div
                key={m.id}
                style={{
                  border: "1px solid var(--c-border)",
                  borderRadius: "var(--r-md)",
                  padding: "14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span className="mono muted" style={{ fontSize: "var(--fs-xs)" }}>#{i + 1}</span>
                  <button className="iconbtn" onClick={() => removeMed(m.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
                  <div className="field">
                    <label className="field__label">Medicamento *</label>
                    <input className="input" placeholder="Ej: Losartán" value={m.nombre} onChange={(e) => updateMed(m.id, "nombre", e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="field__label">Dosis *</label>
                    <input className="input" placeholder="50 mg" value={m.dosis} onChange={(e) => updateMed(m.id, "dosis", e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="field__label">Duración *</label>
                    <input className="input" placeholder="30 días" value={m.duracion} onChange={(e) => updateMed(m.id, "duracion", e.target.value)} />
                  </div>
                  <div className="field" style={{ gridColumn: "1/-1" }}>
                    <label className="field__label">Frecuencia / vía *</label>
                    <input className="input" placeholder="Cada 24h por la mañana, vía oral" value={m.frecuencia} onChange={(e) => updateMed(m.id, "frecuencia", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicaciones */}
        <div className="card">
          <div className="card__head"><div className="card__title">Indicaciones generales</div></div>
          <textarea
            className="textarea"
            rows={5}
            placeholder="Recomendaciones, cuidados, frecuencia de monitoreo…"
            value={indicaciones}
            maxLength={1500}
            onChange={(e) => setIndicaciones(e.target.value)}
          />
          <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 4, textAlign: "right" }}>
            {indicaciones.length}/1500
          </div>
        </div>

        {/* Guardar como plantilla */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: "var(--fs-sm)" }}>Guardar como plantilla</div>
              <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 2 }}>Reutiliza este conjunto en futuras recetas.</div>
            </div>
            <button
              className={`toggle ${guardarPlantilla ? "on" : ""}`}
              onClick={() => setGuardarPlantilla((g) => !g)}
            >
              <div className="toggle__thumb" />
            </button>
          </div>
          {guardarPlantilla && (
            <div className="field" style={{ marginTop: 14 }}>
              <label className="field__label">Nombre de la plantilla</label>
              <input
                className="input"
                placeholder="Ej: Hipertensión controlada"
                value={nombrePlantilla}
                onChange={(e) => setNombrePlantilla(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="card">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn btn-ghost"
              onClick={() => router.back()}
            >
              Cancelar
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleSubmit("pdf")}
              disabled={loading}
            >
              <Eye size={14} /> Generar PDF
            </button>
            {paciente?.consentimiento_whatsapp ? (
              <button
                className="btn btn-primary"
                onClick={() => handleSubmit("whatsapp")}
                disabled={loading}
              >
                Enviar por WhatsApp
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => handleSubmit("guardar")}
                disabled={loading}
              >
                {loading ? "Guardando…" : "Guardar receta"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vista previa PDF */}
      <div style={{ position: "sticky", top: "calc(var(--layout-topbar-h) + 24px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>Vista previa del PDF</span>
        </div>
        <div
          style={{
            background: "white",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--r-lg)",
            padding: 20,
            fontSize: 11,
            color: "#222",
            boxShadow: "var(--sh-md)",
          }}
        >
          {/* Header receta */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, paddingBottom: 14, borderBottom: "2px solid #1a1a2e" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>AgendaMed</div>
              <div style={{ marginTop: 8, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 600 }}>{consultorio.medico_nombre}</div>
                <div>{consultorio.especialidad}</div>
                {consultorio.cedula_profesional && <div>Céd. {consultorio.cedula_profesional}</div>}
              </div>
            </div>
            <div style={{ textAlign: "right", lineHeight: 1.6, fontSize: 10 }}>
              <div style={{ fontWeight: 600 }}>{consultorio.nombre}</div>
              {consultorio.direccion && <div>{consultorio.direccion}</div>}
              {consultorio.ciudad && <div>{consultorio.ciudad}</div>}
              {consultorio.telefono && <div>{consultorio.telefono}</div>}
            </div>
          </div>

          {/* Datos paciente */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", marginBottom: 14, fontSize: 10 }}>
            <div><span style={{ color: "#666" }}>Paciente:</span> <strong>{paciente?.nombre ?? "—"}</strong></div>
            <div><span style={{ color: "#666" }}>Fecha:</span> <strong style={{ textTransform: "capitalize" }}>{hoy}</strong></div>
            {paciente?.fecha_nacimiento && (
              <div><span style={{ color: "#666" }}>Edad:</span> <strong>{fmtEdad(paciente.fecha_nacimiento)} años</strong></div>
            )}
          </div>

          {/* Diagnóstico */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", color: "#666" }}>Diagnóstico</div>
            <p style={{ lineHeight: 1.5 }}>{diagnostico || <em style={{ color: "#aaa" }}>—</em>}</p>
          </div>

          {/* Medicamentos */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 10, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", color: "#666" }}>Indicación médica</div>
            <ol style={{ paddingLeft: 16, lineHeight: 1.6 }}>
              {meds.filter((m) => m.nombre).map((m, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  <strong>{m.nombre}{m.dosis && ` · ${m.dosis}`}</strong><br />
                  <span style={{ color: "#555" }}>{m.frecuencia || "—"}{m.duracion && ` · ${m.duracion}`}</span>
                </li>
              ))}
              {!meds.some((m) => m.nombre) && <li style={{ color: "#aaa" }}>—</li>}
            </ol>
          </div>

          {/* Indicaciones */}
          {indicaciones && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", color: "#666" }}>Recomendaciones</div>
              <p style={{ lineHeight: 1.5, color: "#444" }}>{indicaciones}</p>
            </div>
          )}

          {/* Firma */}
          <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #ddd" }}>
            <div style={{ width: 100, borderBottom: "1px solid #222", marginBottom: 4 }} />
            <div style={{ fontWeight: 600 }}>{consultorio.medico_nombre}</div>
            {consultorio.cedula_profesional && (
              <div style={{ color: "#666", fontSize: 10 }}>Cédula profesional: {consultorio.cedula_profesional}</div>
            )}
          </div>

          <div style={{ marginTop: 12, fontSize: 9, color: "#aaa", borderTop: "1px solid #eee", paddingTop: 8 }}>
            Documento de apoyo emitido por AgendaMed · No sustituye una receta médica oficial.
          </div>
        </div>
      </div>
    </div>
  )
}
