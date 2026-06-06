import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { format, startOfDay, endOfDay, addDays, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { fmtMxn, fmtTime } from "@/lib/utils"
import type { CitaConRelaciones } from "@/types/database"
import { Calendar, Users, FileText, Clock, UserPlus, CalendarDays, TrendingUp } from "lucide-react"
import Link from "next/link"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { plantillas } from "@/lib/whatsapp-links"

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

  // Citas del mes (para ingresos, tasa de asistencia y servicio más solicitado)
  const { data: citasMes } = await supabase
    .from("citas")
    .select("estado, servicio:servicios(nombre, precio_mxn)")
    .eq("consultorio_id", consultorio.id)
    .gte("inicio", inicioMes)

  // Ingresos del mes = suma del precio de las citas completadas
  const ingresosMes = (citasMes ?? []).reduce((sum, c) => {
    if (c.estado !== "completada") return sum
    const svc = c.servicio as { precio_mxn?: number } | null
    return sum + (svc?.precio_mxn ?? 0)
  }, 0)

  // Tasa de asistencia = completadas / (completadas + noshow)
  const completadas = (citasMes ?? []).filter((c) => c.estado === "completada").length
  const noshows = (citasMes ?? []).filter((c) => c.estado === "noshow").length
  const tasaAsistencia = completadas + noshows > 0
    ? Math.round((completadas / (completadas + noshows)) * 100)
    : 100

  // Servicio más solicitado este mes
  const conteoSvc = new Map<string, number>()
  for (const c of citasMes ?? []) {
    const svc = c.servicio as { nombre?: string } | null
    if (svc?.nombre) conteoSvc.set(svc.nombre, (conteoSvc.get(svc.nombre) ?? 0) + 1)
  }
  const servicioTop = [...conteoSvc.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

  // Pacientes nuevos este mes
  const { count: pacientesNuevos } = await supabase
    .from("pacientes")
    .select("id", { count: "exact", head: true })
    .eq("consultorio_id", consultorio.id)
    .gte("created_at", inicioMes)

  // Próxima cita (la siguiente en el tiempo)
  const { data: proximaCitaArr } = await supabase
    .from("citas")
    .select("inicio, paciente:pacientes(nombre)")
    .eq("consultorio_id", consultorio.id)
    .gt("inicio", hoy.toISOString())
    .in("estado", ["pendiente", "confirmada"])
    .order("inicio")
    .limit(1)
  const proximaCita = proximaCitaArr?.[0] as { inicio: string; paciente: { nombre: string } | null } | undefined

  // Gráfica semanal: citas por día (últimos 7 días)
  const hace7 = subDays(startOfDay(hoy), 6).toISOString()
  const { data: citas7d } = await supabase
    .from("citas")
    .select("inicio")
    .eq("consultorio_id", consultorio.id)
    .gte("inicio", hace7)
    .lte("inicio", finHoy)
    .neq("estado", "cancelada")

  const grafica7d = Array.from({ length: 7 }, (_, i) => {
    const dia = subDays(hoy, 6 - i)
    const diaStr = format(dia, "yyyy-MM-dd")
    const count = (citas7d ?? []).filter((c) => format(new Date(c.inicio), "yyyy-MM-dd") === diaStr).length
    return { label: format(dia, "EEE", { locale: es }), count }
  })
  const maxGrafica = Math.max(1, ...grafica7d.map((g) => g.count))

  // Cumpleaños del día
  const hoyMes = format(hoy, "MM-dd")
  const { data: pacientesAll } = await supabase
    .from("pacientes")
    .select("id, nombre, fecha_nacimiento, telefono")
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

      {/* Accesos rápidos */}
      <div className="grid-3 col-metrics" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <QuickAction href="/panel/citas/nueva" icon={<Calendar size={18} />} label="Nueva cita" />
        <QuickAction href="/panel/pacientes/nuevo" icon={<UserPlus size={18} />} label="Nuevo paciente" />
        <QuickAction href="/panel/recetas/nueva" icon={<FileText size={18} />} label="Nueva receta" />
        <QuickAction href="/panel/agenda" icon={<CalendarDays size={18} />} label="Ver agenda" />
      </div>

      {/* Métricas */}
      <div className="grid-3 col-metrics" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
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
          label="Ingresos del mes"
          value={fmtMxn(ingresosMes)}
          icon={<TrendingUp size={18} />}
          sublabel={`${completadas} citas completadas`}
          href="/panel/citas"
        />
        <MetricCard
          label="Tasa de asistencia"
          value={`${tasaAsistencia}%`}
          icon={<Clock size={18} />}
          sublabel={`${completadas} asistieron · ${noshows} no-show`}
          href="/panel/citas"
        />
      </div>

      {/* Gráfica semanal + métricas secundarias */}
      <div className="col-split" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div className="card">
          <div className="card__head"><div className="card__title">Citas últimos 7 días</div></div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, paddingTop: 8 }}>
            {grafica7d.map((g, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-muted)" }}>{g.count}</div>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 36,
                    height: `${(g.count / maxGrafica) * 100}px`,
                    minHeight: 4,
                    background: g.count > 0 ? "var(--c-brand)" : "var(--c-border)",
                    borderRadius: "var(--r-sm) var(--r-sm) 0 0",
                    transition: "height var(--t-base)",
                  }}
                />
                <div style={{ fontSize: 10, color: "var(--c-text-faint)", textTransform: "capitalize" }}>{g.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <MiniMetric label="Recetas este mes" value={String(recetasMes ?? 0)} />
          <MiniMetric label="Pacientes nuevos" value={String(pacientesNuevos ?? 0)} />
          <MiniMetric label="Servicio más solicitado" value={servicioTop} />
          <MiniMetric
            label="Próxima cita"
            value={proximaCita ? `${proximaCita.paciente?.nombre ?? "Paciente"}` : "Sin citas"}
            sub={proximaCita ? format(new Date(proximaCita.inicio), "EEE d MMM · HH:mm", { locale: es }) : undefined}
          />
        </div>
      </div>

      <div className="col-split" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
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
              <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cumpleHoy.map((p) => (
                  <li key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
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
                    <span style={{ fontSize: "var(--fs-sm)", flex: 1, minWidth: 0 }}>{p.nombre}</span>
                    <WhatsAppButton
                      telefono={p.telefono}
                      texto="Felicitar"
                      size="sm"
                      mensaje={plantillas.cumpleanos({ paciente: p.nombre, consultorio: consultorio.nombre })}
                    />
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

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div className="card quick-action" style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", cursor: "pointer" }}>
        <span style={{ color: "var(--c-brand)", display: "grid", placeItems: "center", width: 34, height: 34, background: "var(--c-brand-soft)", borderRadius: "var(--r-sm)", flexShrink: 0 }}>
          {icon}
        </span>
        <span style={{ fontSize: "var(--fs-sm)", fontWeight: 500 }}>{label}</span>
      </div>
    </Link>
  )
}

function MiniMetric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card" style={{ padding: "12px 14px" }}>
      <div className="muted" style={{ fontSize: "var(--fs-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: "var(--fs-md)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
      {sub && <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 2 }}>{sub}</div>}
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
  value: number | string
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
