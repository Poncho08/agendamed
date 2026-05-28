import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { format, startOfDay, endOfDay, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { fmtMxn, fmtTime } from "@/lib/utils"
import type { CitaConRelaciones } from "@/types/database"
import { Calendar, Users, FileText, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: consultorio } = await supabase
    .from("consultorios")
    .select("*")
    .eq("user_id", user.id)
    .single()
  if (!consultorio) redirect("/onboarding")

  const hoy = new Date()
  const inicioHoy = startOfDay(hoy).toISOString()
  const finHoy = endOfDay(hoy).toISOString()
  const manana = addDays(hoy, 1)
  const en48h = addDays(hoy, 2).toISOString()

  // Citas de hoy
  const { data: citasHoy } = await supabase
    .from("citas")
    .select("*, paciente:pacientes(*), servicio:servicios(*)")
    .eq("consultorio_id", consultorio.id)
    .gte("inicio", inicioHoy)
    .lte("inicio", finHoy)
    .neq("estado", "cancelada")
    .order("inicio")

  // Próximas 48h (excluyendo hoy)
  const { data: citasProximas } = await supabase
    .from("citas")
    .select("*, paciente:pacientes(*), servicio:servicios(*)")
    .eq("consultorio_id", consultorio.id)
    .gte("inicio", endOfDay(hoy).toISOString())
    .lte("inicio", en48h)
    .neq("estado", "cancelada")
    .order("inicio")
    .limit(5)

  // Total pacientes activos
  const { count: totalPacientes } = await supabase
    .from("pacientes")
    .select("id", { count: "exact", head: true })
    .eq("consultorio_id", consultorio.id)
    .is("eliminado_en", null)

  // Total recetas este mes
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString()
  const { count: recetasMes } = await supabase
    .from("recetas")
    .select("id", { count: "exact", head: true })
    .eq("consultorio_id", consultorio.id)
    .gte("created_at", inicioMes)

  // Cumpleaños del día
  const hoyMes = format(hoy, "MM-dd")
  const { data: pacientesAll } = await supabase
    .from("pacientes")
    .select("id, nombre, fecha_nacimiento")
    .eq("consultorio_id", consultorio.id)
    .is("eliminado_en", null)
    .not("fecha_nacimiento", "is", null)

  const cumpleHoy = (pacientesAll ?? []).filter((p) => {
    if (!p.fecha_nacimiento) return false
    const mesdia = p.fecha_nacimiento.slice(5) // MM-DD
    return mesdia === hoyMes
  })

  const hoySemana = format(hoy, "EEEE d 'de' MMMM", { locale: es })

  return (
    <div className="stack">
      {/* Header */}
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Panel principal</span>
          <h1 className="page__title">Buenos días, {consultorio.medico_nombre.split(" ")[0]}</h1>
          <p className="page__sub" style={{ textTransform: "capitalize" }}>{hoySemana}</p>
        </div>
        <div className="page__actions">
          <Link href="/panel/citas/nueva" className="btn btn-primary">
            <span>+ Nueva cita</span>
          </Link>
        </div>
      </header>

      {/* Métricas */}
      <div className="grid-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <MetricCard
          label="Citas hoy"
          value={citasHoy?.length ?? 0}
          icon={<Calendar size={18} />}
          sublabel={`${citasHoy?.filter((c) => c.estado === "completada").length ?? 0} completadas`}
          href="/panel/agenda"
        />
        <MetricCard
          label="Pacientes activos"
          value={totalPacientes ?? 0}
          icon={<Users size={18} />}
          sublabel={`de ${consultorio.max_pacientes} permitidos`}
          href="/panel/pacientes"
        />
        <MetricCard
          label="Recetas este mes"
          value={recetasMes ?? 0}
          icon={<FileText size={18} />}
          sublabel="documentos generados"
          href="/panel/recetas"
        />
        <MetricCard
          label="Citas próximas"
          value={citasProximas?.length ?? 0}
          icon={<Clock size={18} />}
          sublabel="próximas 48 horas"
          href="/panel/citas"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        {/* Agenda del día */}
        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title">Agenda de hoy</div>
              <div className="card__sub">{citasHoy?.length ?? 0} citas programadas</div>
            </div>
            <Link href="/panel/agenda" className="btn btn-secondary btn-sm">
              Ver agenda completa
            </Link>
          </div>

          {!citasHoy || citasHoy.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 24px",
                color: "var(--c-text-faint)",
                fontSize: "var(--fs-sm)",
              }}
            >
              <Calendar size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <div style={{ fontWeight: 500, marginBottom: 6 }}>Sin citas para hoy</div>
              <div>
                <Link href="/panel/citas/nueva" className="link">
                  Agendar una cita →
                </Link>
              </div>
            </div>
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {(citasHoy as unknown as CitaConRelaciones[]).map((cita) => (
                <li key={cita.id}>
                  <Link
                    href={`/panel/citas/${cita.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: "var(--r-sm)",
                      transition: "background var(--t-fast)",
                    }}
                    className="appt-row-link"
                  >
                    <span
                      className="mono muted"
                      style={{ fontSize: "var(--fs-xs)", width: 40, flexShrink: 0 }}
                    >
                      {fmtTime(cita.inicio)}
                    </span>
                    <div
                      className="avatar"
                      style={{
                        width: 28,
                        height: 28,
                        background: "var(--c-brand)",
                        fontSize: 10,
                        flexShrink: 0,
                      }}
                    >
                      {cita.paciente?.nombre
                        ?.split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "var(--fs-sm)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cita.paciente?.nombre}
                      </div>
                      <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>
                        {cita.servicio?.nombre ?? "Consulta"} · {cita.duracion_min} min
                      </div>
                    </div>
                    <span
                      className={`badge badge-${
                        cita.estado === "completada"
                          ? "success"
                          : cita.estado === "confirmada"
                          ? "brand"
                          : cita.estado === "cancelada"
                          ? "neutral"
                          : cita.estado === "noshow"
                          ? "danger"
                          : "warning"
                      }`}
                    >
                      {cita.estado === "pendiente"
                        ? "Pendiente"
                        : cita.estado === "confirmada"
                        ? "Confirmada"
                        : cita.estado === "completada"
                        ? "Completada"
                        : cita.estado === "cancelada"
                        ? "Cancelada"
                        : "No se presentó"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sidebar derecha */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Cumpleaños */}
          {cumpleHoy.length > 0 && (
            <div
              className="card"
              style={{ background: "var(--c-warning-soft)", border: "1px solid oklch(0.85 0.08 80)" }}
            >
              <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", marginBottom: 10 }}>
                🎂 Cumpleaños hoy ({cumpleHoy.length})
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cumpleHoy.map((p) => (
                  <li key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      className="avatar"
                      style={{ width: 24, height: 24, background: "var(--c-warning)", fontSize: 9 }}
                    >
                      {p.nombre
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w: string) => w[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <span style={{ fontSize: "var(--fs-sm)" }}>{p.nombre}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Próximas 48h */}
          <div className="card">
            <div className="card__head" style={{ marginBottom: 12 }}>
              <div className="card__title" style={{ fontSize: "var(--fs-sm)" }}>Próximas 48 horas</div>
            </div>
            {!citasProximas || citasProximas.length === 0 ? (
              <p className="muted" style={{ fontSize: "var(--fs-xs)", textAlign: "center", padding: "12px 0" }}>
                Sin citas próximas
              </p>
            ) : (
              <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(citasProximas as unknown as CitaConRelaciones[]).map((cita) => (
                  <li key={cita.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div
                      className="avatar"
                      style={{ width: 22, height: 22, background: "var(--c-brand-soft)", fontSize: 8, color: "var(--c-brand)", flexShrink: 0, marginTop: 1 }}
                    >
                      {cita.paciente?.nombre?.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "var(--fs-xs)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cita.paciente?.nombre}
                      </div>
                      <div className="muted" style={{ fontSize: 11 }}>
                        {format(new Date(cita.inicio), "EEE d MMM · HH:mm", { locale: es })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
  sublabel,
  href,
}: {
  label: string
  value: number
  icon: React.ReactNode
  sublabel: string
  href: string
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        className="card"
        style={{ cursor: "pointer", transition: "box-shadow var(--t-fast)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {label}
          </span>
          <span style={{ color: "var(--c-text-faint)" }}>{icon}</span>
        </div>
        <div style={{ fontSize: "var(--fs-3xl)", fontWeight: "var(--fw-semibold)", lineHeight: 1, marginBottom: 6 }}>
          {value}
        </div>
        <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>{sublabel}</div>
      </div>
    </Link>
  )
}
