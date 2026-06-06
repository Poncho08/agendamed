"use client"

import { useState, useEffect } from "react"
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { coloresCita, labelEstado } from "@/lib/cita-colores"
import type { CitaEstado } from "@/types/database"

type Vista = "dia" | "semana" | "mes"

interface CitaCal {
  id: string
  inicio: string
  fin: string
  duracion_min: number
  estado: CitaEstado
  paciente: { nombre: string } | null
}

const HORAS = Array.from({ length: 11 }, (_, i) => i + 8) // 8..18
const PX_PER_MIN = 1.4

export default function AgendaPage() {
  const [vista, setVista] = useState<Vista>("dia")
  const [fecha, setFecha] = useState(new Date())
  const [citas, setCitas] = useState<CitaCal[]>([])

  // Cargar citas del rango visible
  useEffect(() => {
    let cancelado = false
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: consultorio } = await supabase
        .from("consultorios").select("id").eq("user_id", user.id).single()
      if (!consultorio) return

      let desde: Date, hasta: Date
      if (vista === "dia") {
        desde = new Date(fecha); desde.setHours(0, 0, 0, 0)
        hasta = new Date(fecha); hasta.setHours(23, 59, 59, 999)
      } else if (vista === "semana") {
        desde = startOfWeek(fecha, { weekStartsOn: 1 })
        hasta = addDays(desde, 7)
      } else {
        desde = startOfWeek(startOfMonth(fecha), { weekStartsOn: 1 })
        hasta = addDays(desde, 42)
      }

      const { data } = await supabase
        .from("citas")
        .select("id, inicio, fin, duracion_min, estado, paciente:pacientes(nombre)")
        .eq("consultorio_id", (consultorio as { id: string }).id)
        .gte("inicio", desde.toISOString())
        .lte("inicio", hasta.toISOString())
        .order("inicio")

      if (!cancelado) setCitas((data as unknown as CitaCal[]) ?? [])
    }
    load()
    return () => { cancelado = true }
  }, [vista, fecha])

  function prev() {
    if (vista === "dia") setFecha((f) => subDays(f, 1))
    else if (vista === "semana") setFecha((f) => subWeeks(f, 1))
    else setFecha((f) => subMonths(f, 1))
  }
  function next() {
    if (vista === "dia") setFecha((f) => addDays(f, 1))
    else if (vista === "semana") setFecha((f) => addWeeks(f, 1))
    else setFecha((f) => addMonths(f, 1))
  }

  function labelFecha() {
    if (vista === "dia") return format(fecha, "EEEE d 'de' MMMM yyyy", { locale: es })
    if (vista === "semana") {
      const lunes = startOfWeek(fecha, { weekStartsOn: 1 })
      const dom = addDays(lunes, 6)
      return `${format(lunes, "d MMM", { locale: es })} – ${format(dom, "d MMM yyyy", { locale: es })}`
    }
    return format(fecha, "MMMM yyyy", { locale: es })
  }

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Calendario</span>
          <h1 className="page__title">Agenda</h1>
        </div>
        <div className="page__actions">
          <Link href="/panel/citas/nueva" className="btn btn-primary">+ Nueva cita</Link>
        </div>
      </header>

      {/* Controles */}
      <div className="card" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="iconbtn" onClick={prev}><ChevronLeft size={16} /></button>
            <button className="btn btn-secondary btn-sm" onClick={() => setFecha(new Date())}>Hoy</button>
            <button className="iconbtn" onClick={next}><ChevronRight size={16} /></button>
            <span style={{ fontWeight: 600, fontSize: "var(--fs-md)", textTransform: "capitalize" }}>{labelFecha()}</span>
          </div>
          <div style={{ display: "flex", background: "var(--c-surface-2)", borderRadius: "var(--r-sm)", padding: 2 }}>
            {(["dia", "semana", "mes"] as Vista[]).map((v) => (
              <button key={v} className={`btn btn-sm ${vista === v ? "btn-secondary" : "btn-ghost"}`} onClick={() => setVista(v)} style={{ textTransform: "capitalize" }}>
                {v === "dia" ? "Día" : v === "semana" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {vista === "dia" && <AgendaDia fecha={fecha} citas={citas} />}
      {vista === "semana" && <AgendaSemana fecha={fecha} citas={citas} />}
      {vista === "mes" && <AgendaMes fecha={fecha} citas={citas} />}

      {/* Leyenda de colores */}
      <Leyenda />
    </div>
  )
}

function Leyenda() {
  const estados: CitaEstado[] = ["pendiente", "confirmada", "completada", "cancelada", "noshow"]
  return (
    <div className="card" style={{ padding: "12px 16px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <span className="muted" style={{ fontSize: "var(--fs-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Estados:</span>
        {estados.map((e) => (
          <span key={e} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-xs)" }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: coloresCita[e].bg, border: `1.5px solid ${coloresCita[e].border}` }} />
            {labelEstado[e]}
          </span>
        ))}
      </div>
    </div>
  )
}

function minutosDesde8(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes() - 8 * 60
}
function horaLocal(iso: string): string {
  return format(new Date(iso), "HH:mm")
}

function EventoCita({ cita, px }: { cita: CitaCal; px: number }) {
  const c = coloresCita[cita.estado]
  const top = Math.max(0, minutosDesde8(cita.inicio) * px)
  const height = Math.max(20, cita.duracion_min * px - 2)
  return (
    <Link
      href={`/panel/citas/${cita.id}`}
      style={{
        position: "absolute", top, left: 4, right: 4, height,
        background: c.bg, borderLeft: `3px solid ${c.border}`, color: c.text,
        borderRadius: 6, padding: "3px 6px", fontSize: 11, overflow: "hidden",
        textDecoration: "none", zIndex: 2,
      }}
    >
      <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {cita.paciente?.nombre ?? "Cita"}
      </div>
      <div style={{ opacity: 0.8 }}>{horaLocal(cita.inicio)}</div>
    </Link>
  )
}

function AgendaDia({ fecha, citas }: { fecha: Date; citas: CitaCal[] }) {
  const altura = 60 * 10 * PX_PER_MIN
  const ahora = new Date()
  const minDesde8 = ahora.getHours() * 60 + ahora.getMinutes() - 8 * 60
  const nowTop = minDesde8 * PX_PER_MIN
  const fechaStr = format(fecha, "yyyy-MM-dd")
  const delDia = citas.filter((c) => format(new Date(c.inicio), "yyyy-MM-dd") === fechaStr)

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "56px 1fr", position: "relative" }}>
        <div style={{ borderRight: "1px solid var(--c-border)" }}>
          {HORAS.map((h) => (
            <div key={h} style={{ height: 60 * PX_PER_MIN, display: "flex", alignItems: "flex-start", paddingTop: 6, paddingRight: 8, justifyContent: "flex-end", fontSize: "var(--fs-xs)", color: "var(--c-text-faint)", fontFamily: "var(--font-mono)" }}>
              {h}:00
            </div>
          ))}
        </div>
        <div style={{ position: "relative", height: altura }}>
          {HORAS.map((h) => (
            <div key={h} style={{ position: "absolute", top: (h - 8) * 60 * PX_PER_MIN, left: 0, right: 0, height: 1, background: "var(--c-border-faint)" }} />
          ))}
          {format(fecha, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && minDesde8 > 0 && minDesde8 < 600 && (
            <div style={{ position: "absolute", top: nowTop, left: 0, right: 0, height: 2, background: "var(--c-brand)", zIndex: 5 }}>
              <div style={{ width: 8, height: 8, background: "var(--c-brand)", borderRadius: "50%", position: "absolute", left: -4, top: -3 }} />
            </div>
          )}
          {delDia.map((c) => <EventoCita key={c.id} cita={c} px={PX_PER_MIN} />)}
          {delDia.length === 0 && (
            <div className="muted" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: "var(--fs-sm)", pointerEvents: "none" }}>
              Sin citas para este día
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AgendaSemana({ fecha, citas }: { fecha: Date; citas: CitaCal[] }) {
  const lunes = startOfWeek(fecha, { weekStartsOn: 1 })
  const dias = Array.from({ length: 7 }, (_, i) => addDays(lunes, i))
  const PX = 1.1

  return (
    <div className="card" style={{ padding: 0, overflow: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `56px repeat(7, 1fr)`, minWidth: 700 }}>
        <div />
        {dias.map((d) => {
          const esHoy = format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
          return (
            <div key={d.toISOString()} style={{ textAlign: "center", padding: "10px 4px", borderLeft: "1px solid var(--c-border-faint)", borderBottom: "1px solid var(--c-border)", fontSize: "var(--fs-xs)", fontWeight: esHoy ? 700 : 400, color: esHoy ? "var(--c-brand)" : "var(--c-text-muted)" }}>
              {format(d, "EEE d", { locale: es })}
            </div>
          )
        })}

        <div>
          {HORAS.map((h) => (
            <div key={h} style={{ height: 60 * PX, display: "flex", alignItems: "flex-start", paddingTop: 4, paddingRight: 6, justifyContent: "flex-end", fontSize: 10, color: "var(--c-text-faint)", fontFamily: "var(--font-mono)", borderRight: "1px solid var(--c-border)" }}>
              {h}:00
            </div>
          ))}
        </div>

        {dias.map((d) => {
          const fechaStr = format(d, "yyyy-MM-dd")
          const delDia = citas.filter((c) => format(new Date(c.inicio), "yyyy-MM-dd") === fechaStr)
          return (
            <div key={d.toISOString()} style={{ position: "relative", height: 60 * 10 * PX, borderLeft: "1px solid var(--c-border-faint)" }}>
              {HORAS.map((h) => (
                <div key={h} style={{ position: "absolute", top: (h - 8) * 60 * PX, left: 0, right: 0, height: 1, background: "var(--c-border-faint)" }} />
              ))}
              {delDia.map((c) => <EventoCita key={c.id} cita={c} px={PX} />)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AgendaMes({ fecha, citas }: { fecha: Date; citas: CitaCal[] }) {
  const inicio = startOfMonth(fecha)
  const primerDia = startOfWeek(inicio, { weekStartsOn: 1 })
  const dias = Array.from({ length: 42 }, (_, i) => addDays(primerDia, i))
  const mesActual = fecha.getMonth()
  const hoyStr = format(new Date(), "yyyy-MM-dd")

  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--c-border)" }}>
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} style={{ textAlign: "center", padding: "8px 4px", fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--c-text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {dias.map((d, i) => {
          const esMes = d.getMonth() === mesActual
          const esHoy = format(d, "yyyy-MM-dd") === hoyStr
          const fechaStr = format(d, "yyyy-MM-dd")
          const delDia = citas.filter((c) => format(new Date(c.inicio), "yyyy-MM-dd") === fechaStr)
          return (
            <div key={i} style={{ minHeight: 90, padding: "8px 6px", borderRight: (i + 1) % 7 !== 0 ? "1px solid var(--c-border-faint)" : "none", borderBottom: i < 35 ? "1px solid var(--c-border-faint)" : "none", background: !esMes ? "var(--c-surface-2)" : "transparent", opacity: !esMes ? 0.5 : 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: "var(--fs-xs)", fontWeight: esHoy ? 700 : 400, background: esHoy ? "var(--c-brand)" : "transparent", color: esHoy ? "white" : esMes ? "var(--c-text)" : "var(--c-text-faint)", marginBottom: 4 }}>
                {d.getDate()}
              </div>
              {/* Puntos de color por estado */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {delDia.slice(0, 3).map((c) => (
                  <Link key={c.id} href={`/panel/citas/${c.id}`} style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: coloresCita[c.estado].border, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: "var(--c-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {horaLocal(c.inicio)} {c.paciente?.nombre?.split(" ")[0] ?? ""}
                    </span>
                  </Link>
                ))}
                {delDia.length > 3 && (
                  <span style={{ fontSize: 9, color: "var(--c-text-faint)" }}>+{delDia.length - 3} más</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
