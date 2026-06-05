"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import {
  format, addDays, startOfMonth, startOfWeek, addMinutes, parseISO
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { fmtMxn } from "@/lib/utils"

interface Paciente { id: string; nombre: string; telefono: string | null; email: string | null }
interface Servicio { id: string; nombre: string; duracion_min: number; precio_mxn: number; tipo: string }

interface Props {
  consultorioId: string
  pacientes: Paciente[]
  servicios: Servicio[]
}

const SLOTS_INICIO = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"]

export function NuevaCitaForm({ consultorioId, pacientes, servicios }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [pacienteId, setPacienteId] = useState("")
  const [servicioId, setServicioId] = useState(servicios[0]?.id ?? "")
  const [fecha, setFecha] = useState(new Date())
  const [slot, setSlot] = useState("09:00")
  const [notas, setNotas] = useState("")
  const [recurrente, setRecurrente] = useState(false)

  const servicio = servicios.find((s) => s.id === servicioId)
  const paciente = pacientes.find((p) => p.id === pacienteId)
  const pacientesFiltrados = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  // Mini calendario
  const [mesVista, setMesVista] = useState(new Date())
  const primerDia = startOfWeek(startOfMonth(mesVista), { weekStartsOn: 1 })
  const diasCal = Array.from({ length: 42 }, (_, i) => addDays(primerDia, i))

  async function handleSubmit() {
    if (!pacienteId || !servicioId || !slot) {
      toast.error("Selecciona paciente, servicio y horario")
      return
    }

    setLoading(true)
    const inicio = parseISO(`${format(fecha, "yyyy-MM-dd")}T${slot}:00`)
    const fin = addMinutes(inicio, servicio?.duracion_min ?? 30)

    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("citas") as any).insert({
      consultorio_id: consultorioId,
      paciente_id: pacienteId,
      servicio_id: servicioId,
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      duracion_min: servicio?.duracion_min ?? 30,
      notas: notas || null,
      es_recurrente: recurrente,
    })

    if (error) {
      toast.error("Error al guardar la cita")
      setLoading(false)
      return
    }

    toast.success("Cita agendada", {
      description: `${paciente?.nombre} · ${format(inicio, "d MMM yyyy · HH:mm", { locale: es })}`,
    })
    router.push("/panel/citas")
    router.refresh()
  }

  return (
    <div className="col-split" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>
      {/* Columna izquierda */}
      <div className="stack">
        {/* Paciente */}
        <div className="card">
          <div className="card__head"><div className="card__title">Paciente</div></div>
          <div className="field" style={{ marginBottom: 12 }}>
            <input
              className="input"
              placeholder="Buscar por nombre…"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPacienteId("") }}
            />
          </div>
          {busqueda && !pacienteId && pacientesFiltrados.length > 0 && (
            <ul
              style={{
                border: "1px solid var(--c-border)",
                borderRadius: "var(--r-md)",
                overflow: "hidden",
                marginTop: -4,
              }}
            >
              {pacientesFiltrados.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <button
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      textAlign: "left",
                      borderBottom: "1px solid var(--c-border-faint)",
                      transition: "background var(--t-fast)",
                    }}
                    onClick={() => { setPacienteId(p.id); setBusqueda(p.nombre) }}
                  >
                    <div className="avatar" style={{ width: 28, height: 28, background: "var(--c-brand)", fontSize: 10 }}>
                      {p.nombre.split(" ").filter(Boolean).slice(0,2).map(w => w[0]).join("").toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "var(--fs-sm)", fontWeight: 500 }}>{p.nombre}</div>
                      {p.telefono && <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>{p.telefono}</div>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!pacientes.length && (
            <p className="muted" style={{ fontSize: "var(--fs-sm)" }}>
              No hay pacientes. <a href="/panel/pacientes" className="link">Agregar paciente →</a>
            </p>
          )}
        </div>

        {/* Servicio */}
        <div className="card">
          <div className="card__head"><div className="card__title">Servicio</div></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {servicios.map((s) => (
              <button
                key={s.id}
                onClick={() => setServicioId(s.id)}
                style={{
                  padding: "12px 14px",
                  border: `1.5px solid ${servicioId === s.id ? "var(--c-brand)" : "var(--c-border)"}`,
                  borderRadius: "var(--r-md)",
                  background: servicioId === s.id ? "var(--c-brand-soft)" : "transparent",
                  textAlign: "left",
                  transition: "border-color var(--t-fast), background var(--t-fast)",
                }}
              >
                <div style={{ fontWeight: 500, fontSize: "var(--fs-sm)", color: servicioId === s.id ? "var(--c-brand-fg)" : "var(--c-text)" }}>
                  {s.nombre}
                </div>
                <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 2 }}>
                  {s.duracion_min} min · {fmtMxn(s.precio_mxn)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Fecha y hora */}
        <div className="card">
          <div className="card__head"><div className="card__title">Fecha y horario</div></div>

          {/* Mini calendar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <button className="iconbtn" onClick={() => setMesVista((m) => addDays(startOfMonth(m), -1))}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)", textTransform: "capitalize", flex: 1, textAlign: "center" }}>
                {format(mesVista, "MMMM yyyy", { locale: es })}
              </span>
              <button className="iconbtn" onClick={() => setMesVista((m) => addDays(startOfMonth(m), 32))}>
                <ChevronRight size={14} />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {["L","M","X","J","V","S","D"].map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 10, color: "var(--c-text-faint)", padding: "4px 0", fontWeight: 600 }}>{d}</div>
              ))}
              {diasCal.map((d, i) => {
                const esMes = d.getMonth() === mesVista.getMonth()
                const esSeleccionado = format(d, "yyyy-MM-dd") === format(fecha, "yyyy-MM-dd")
                const esHoy = format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                return (
                  <button
                    key={i}
                    onClick={() => setFecha(d)}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: "50%",
                      fontSize: 12,
                      fontWeight: esSeleccionado ? 700 : 400,
                      background: esSeleccionado ? "var(--c-brand)" : esHoy ? "var(--c-brand-soft)" : "transparent",
                      color: esSeleccionado ? "white" : !esMes ? "var(--c-text-faint)" : "var(--c-text)",
                      opacity: !esMes ? 0.4 : 1,
                    }}
                  >
                    {d.getDate()}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Slots */}
          <div>
            <div style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--c-text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Horario disponible · {format(fecha, "d MMM", { locale: es })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {SLOTS_INICIO.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  style={{
                    padding: "7px 4px",
                    border: `1.5px solid ${slot === s ? "var(--c-brand)" : "var(--c-border)"}`,
                    borderRadius: "var(--r-sm)",
                    fontSize: "var(--fs-xs)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: slot === s ? 600 : 400,
                    background: slot === s ? "var(--c-brand-soft)" : "transparent",
                    color: slot === s ? "var(--c-brand-fg)" : "var(--c-text)",
                    transition: "border-color var(--t-fast), background var(--t-fast)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="card">
          <div className="card__head"><div className="card__title">Notas (opcional)</div></div>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Motivo de consulta, instrucciones especiales…"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>
      </div>

      {/* Sticky summary */}
      <div className="card panel-aside" style={{ position: "sticky", top: "calc(var(--layout-topbar-h) + 24px)" }}>
        <div className="card__head"><div className="card__title">Resumen</div></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <SummaryRow label="Paciente" value={paciente?.nombre ?? "—"} />
          <SummaryRow label="Servicio" value={servicio?.nombre ?? "—"} />
          <SummaryRow label="Fecha" value={format(fecha, "d 'de' MMMM yyyy", { locale: es })} capitalize />
          <SummaryRow label="Hora" value={slot} mono />
          <SummaryRow label="Duración" value={servicio ? `${servicio.duracion_min} min` : "—"} />
          {servicio && <SummaryRow label="Precio" value={fmtMxn(servicio.precio_mxn)} mono />}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: "var(--fs-sm)" }}>Cita recurrente</span>
          <button
            className={`toggle ${recurrente ? "on" : ""}`}
            onClick={() => setRecurrente((r) => !r)}
          >
            <div className="toggle__thumb" />
          </button>
        </div>

        <hr className="hr" />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleSubmit}
            disabled={loading || !pacienteId || !servicioId}
          >
            {loading ? "Guardando…" : "Confirmar cita"}
          </button>
          <button
            className="btn btn-ghost btn-full"
            onClick={() => router.back()}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, mono, capitalize }: { label: string; value: string; mono?: boolean; capitalize?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>{label}</span>
      <span
        style={{
          fontSize: "var(--fs-sm)",
          fontFamily: mono ? "var(--font-mono)" : undefined,
          textTransform: capitalize ? "capitalize" : undefined,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  )
}
