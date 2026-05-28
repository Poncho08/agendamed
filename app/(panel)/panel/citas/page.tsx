import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { fmtTime } from "@/lib/utils"
import type { CitaEstado } from "@/types/database"

const ESTADO_LABELS: Record<CitaEstado, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  noshow: "No se presentó",
}

const ESTADO_BADGE: Record<CitaEstado, string> = {
  pendiente: "badge-warning",
  confirmada: "badge-brand",
  completada: "badge-success",
  cancelada: "badge-neutral",
  noshow: "badge-danger",
}

export default async function CitasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: consultorio } = await supabase
    .from("consultorios")
    .select("id")
    .eq("user_id", user.id)
    .single()
  if (!consultorio) redirect("/onboarding")

  const { data: citas } = await supabase
    .from("citas")
    .select("*, paciente:pacientes(id, nombre), servicio:servicios(nombre)")
    .eq("consultorio_id", consultorio.id)
    .order("inicio", { ascending: false })
    .limit(100)

  // Agrupar por fecha
  const grupos = new Map<string, typeof citas>()
  for (const cita of citas ?? []) {
    const key = format(new Date(cita.inicio), "yyyy-MM-dd")
    if (!grupos.has(key)) grupos.set(key, [])
    grupos.get(key)!.push(cita)
  }

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Agenda</span>
          <h1 className="page__title">Todas las citas</h1>
          <p className="page__sub">{citas?.length ?? 0} citas encontradas</p>
        </div>
        <div className="page__actions">
          <Link href="/panel/citas/nueva" className="btn btn-primary">
            + Nueva cita
          </Link>
        </div>
      </header>

      {!citas || citas.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 24px" }}>
          <p className="muted" style={{ marginBottom: 16 }}>No hay citas registradas.</p>
          <Link href="/panel/citas/nueva" className="btn btn-primary">
            Agendar primera cita
          </Link>
        </div>
      ) : (
        Array.from(grupos.entries()).map(([fecha, citasDelDia]) => (
          <div key={fecha}>
            <div
              style={{
                fontSize: "var(--fs-xs)",
                fontWeight: 600,
                textTransform: "capitalize",
                color: "var(--c-text-muted)",
                padding: "4px 0 8px",
                letterSpacing: "0.04em",
              }}
            >
              {format(new Date(fecha + "T12:00:00"), "EEEE d 'de' MMMM yyyy", { locale: es })}
            </div>
            <div className="card" style={{ padding: 0 }}>
              <ul>
                {citasDelDia!.map((cita, i) => {
                  const pac = cita.paciente as { nombre: string } | null
                  const svc = cita.servicio as { nombre: string } | null
                  return (
                    <li key={cita.id} style={{ borderBottom: i < citasDelDia!.length - 1 ? "1px solid var(--c-border-faint)" : "none" }}>
                      <Link
                        href={`/panel/citas/${cita.id}`}
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px" }}
                      >
                        <span className="mono muted" style={{ fontSize: "var(--fs-xs)", width: 44, flexShrink: 0 }}>
                          {fmtTime(cita.inicio)}
                        </span>
                        <div
                          className="avatar"
                          style={{ width: 32, height: 32, background: "var(--c-brand)", fontSize: 11, flexShrink: 0 }}
                        >
                          {pac?.nombre?.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: "var(--fs-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {pac?.nombre ?? "Paciente"}
                          </div>
                          <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>
                            {svc?.nombre ?? "Consulta"} · {cita.duracion_min} min
                          </div>
                        </div>
                        <span className={`badge ${ESTADO_BADGE[cita.estado as CitaEstado]}`}>
                          {ESTADO_LABELS[cita.estado as CitaEstado]}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
