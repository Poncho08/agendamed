"use client"

import { useState } from "react"
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, addMonths, subMonths, startOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

type Vista = "dia" | "semana" | "mes"

export default function AgendaPage() {
  const [vista, setVista] = useState<Vista>("dia")
  const [fecha, setFecha] = useState(new Date())

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
          <Link href="/panel/citas/nueva" className="btn btn-primary">
            + Nueva cita
          </Link>
        </div>
      </header>

      {/* Controles */}
      <div className="card" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="iconbtn" onClick={prev}><ChevronLeft size={16} /></button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setFecha(new Date())}
            >
              Hoy
            </button>
            <button className="iconbtn" onClick={next}><ChevronRight size={16} /></button>
            <span style={{ fontWeight: 600, fontSize: "var(--fs-md)", textTransform: "capitalize" }}>
              {labelFecha()}
            </span>
          </div>
          <div style={{ display: "flex", background: "var(--c-surface-2)", borderRadius: "var(--r-sm)", padding: 2 }}>
            {(["dia", "semana", "mes"] as Vista[]).map((v) => (
              <button
                key={v}
                className={`btn btn-sm ${vista === v ? "btn-secondary" : "btn-ghost"}`}
                onClick={() => setVista(v)}
                style={{ textTransform: "capitalize" }}
              >
                {v === "dia" ? "Día" : v === "semana" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vista día */}
      {vista === "dia" && <AgendaDia fecha={fecha} />}
      {vista === "semana" && <AgendaSemana fecha={fecha} />}
      {vista === "mes" && <AgendaMes fecha={fecha} />}
    </div>
  )
}

const HORAS = Array.from({ length: 11 }, (_, i) => i + 8) // 8..18
const PX_PER_MIN = 1.4

function AgendaDia({ fecha }: { fecha: Date }) {
  const altura = 60 * 10 * PX_PER_MIN // 8:00–18:00 = 10h
  const ahora = new Date()
  const minDesde8 = ahora.getHours() * 60 + ahora.getMinutes() - 8 * 60
  const nowTop = minDesde8 * PX_PER_MIN

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "56px 1fr", position: "relative" }}>
        {/* Columna horas */}
        <div style={{ borderRight: "1px solid var(--c-border)" }}>
          {HORAS.map((h) => (
            <div
              key={h}
              style={{
                height: 60 * PX_PER_MIN,
                display: "flex",
                alignItems: "flex-start",
                paddingTop: 6,
                paddingRight: 8,
                justifyContent: "flex-end",
                fontSize: "var(--fs-xs)",
                color: "var(--c-text-faint)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {h}:00
            </div>
          ))}
        </div>

        {/* Columna citas */}
        <div style={{ position: "relative", height: altura }}>
          {HORAS.map((h) => (
            <div
              key={h}
              style={{
                position: "absolute",
                top: (h - 8) * 60 * PX_PER_MIN,
                left: 0,
                right: 0,
                height: 1,
                background: "var(--c-border-faint)",
              }}
            />
          ))}

          {/* Línea "ahora" */}
          {minDesde8 > 0 && minDesde8 < 600 && (
            <div
              style={{
                position: "absolute",
                top: nowTop,
                left: 0,
                right: 0,
                height: 2,
                background: "var(--c-brand)",
                zIndex: 5,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  background: "var(--c-brand)",
                  borderRadius: "50%",
                  position: "absolute",
                  left: -4,
                  top: -3,
                }}
              />
            </div>
          )}

          <div
            className="muted"
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              fontSize: "var(--fs-sm)",
              pointerEvents: "none",
            }}
          >
            Sin citas para este día
          </div>
        </div>
      </div>
    </div>
  )
}

function AgendaSemana({ fecha }: { fecha: Date }) {
  const lunes = startOfWeek(fecha, { weekStartsOn: 1 })
  const dias = Array.from({ length: 7 }, (_, i) => addDays(lunes, i))
  const PX = 1.1

  return (
    <div className="card" style={{ padding: 0, overflow: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `56px repeat(7, 1fr)`, minWidth: 700 }}>
        {/* Header días */}
        <div />
        {dias.map((d) => {
          const esHoy = format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
          return (
            <div
              key={d.toISOString()}
              style={{
                textAlign: "center",
                padding: "10px 4px",
                borderLeft: "1px solid var(--c-border-faint)",
                borderBottom: "1px solid var(--c-border)",
                fontSize: "var(--fs-xs)",
                fontWeight: esHoy ? 700 : 400,
                color: esHoy ? "var(--c-brand)" : "var(--c-text-muted)",
              }}
            >
              {format(d, "EEE d", { locale: es })}
            </div>
          )
        })}

        {/* Horas */}
        <div>
          {HORAS.map((h) => (
            <div
              key={h}
              style={{
                height: 60 * PX,
                display: "flex",
                alignItems: "flex-start",
                paddingTop: 4,
                paddingRight: 6,
                justifyContent: "flex-end",
                fontSize: 10,
                color: "var(--c-text-faint)",
                fontFamily: "var(--font-mono)",
                borderRight: "1px solid var(--c-border)",
              }}
            >
              {h}:00
            </div>
          ))}
        </div>

        {/* Celdas días */}
        {dias.map((d) => (
          <div
            key={d.toISOString()}
            style={{
              position: "relative",
              height: 60 * 10 * PX,
              borderLeft: "1px solid var(--c-border-faint)",
            }}
          >
            {HORAS.map((h) => (
              <div
                key={h}
                style={{
                  position: "absolute",
                  top: (h - 8) * 60 * PX,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: "var(--c-border-faint)",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function AgendaMes({ fecha }: { fecha: Date }) {
  const inicio = startOfMonth(fecha)
  const primerDia = startOfWeek(inicio, { weekStartsOn: 1 })
  const dias = Array.from({ length: 42 }, (_, i) => addDays(primerDia, i))
  const mesActual = fecha.getMonth()
  const hoyStr = format(new Date(), "yyyy-MM-dd")

  return (
    <div className="card" style={{ padding: 0 }}>
      {/* Header semana */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--c-border)" }}>
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              padding: "8px 4px",
              fontSize: "var(--fs-xs)",
              fontWeight: 600,
              color: "var(--c-text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Días */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {dias.map((d, i) => {
          const esMes = d.getMonth() === mesActual
          const esHoy = format(d, "yyyy-MM-dd") === hoyStr
          return (
            <div
              key={i}
              style={{
                minHeight: 90,
                padding: "8px 6px",
                borderRight: (i + 1) % 7 !== 0 ? "1px solid var(--c-border-faint)" : "none",
                borderBottom: i < 35 ? "1px solid var(--c-border-faint)" : "none",
                background: !esMes ? "var(--c-surface-2)" : "transparent",
                opacity: !esMes ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "var(--fs-xs)",
                  fontWeight: esHoy ? 700 : 400,
                  background: esHoy ? "var(--c-brand)" : "transparent",
                  color: esHoy ? "white" : esMes ? "var(--c-text)" : "var(--c-text-faint)",
                  marginBottom: 4,
                }}
              >
                {d.getDate()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
