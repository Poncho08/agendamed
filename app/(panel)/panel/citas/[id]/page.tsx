import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { fmtDate, fmtTime } from "@/lib/utils"
import { CitaActions } from "./cita-actions"
import type { CitaEstado } from "@/types/database"

const ESTADO_LABEL: Record<CitaEstado, string> = {
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

export default async function CitaDetallePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: consultorio } = await supabase
    .from("consultorios").select("id").eq("user_id", user.id).single()
  if (!consultorio) redirect("/onboarding")

  const { data: cita } = await supabase
    .from("citas")
    .select("*, paciente:pacientes(*), servicio:servicios(nombre, tipo)")
    .eq("id", params.id)
    .eq("consultorio_id", consultorio.id)
    .single()

  if (!cita) notFound()

  const pac = cita.paciente as { id: string; nombre: string; telefono: string | null; email: string | null; consentimiento_whatsapp: boolean } | null
  const svc = cita.servicio as { nombre: string; tipo: string } | null
  const estado = cita.estado as CitaEstado

  return (
    <div className="stack" style={{ maxWidth: 720 }}>
      <header className="page__head">
        <div className="page__title-wrap">
          <Link href="/panel/citas" className="muted" style={{ fontSize: "var(--fs-xs)", display: "block", marginBottom: 6 }}>
            ← Citas
          </Link>
          <h1 className="page__title">{pac?.nombre ?? "Cita"}</h1>
          <p className="page__sub">
            {fmtDate(cita.inicio)} · {fmtTime(cita.inicio)} — {fmtTime(cita.fin)}
          </p>
        </div>
        <div className="page__actions">
          <span className={`badge ${ESTADO_BADGE[estado]}`} style={{ fontSize: "var(--fs-sm)", padding: "5px 10px" }}>
            {ESTADO_LABEL[estado]}
          </span>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
        {/* Principal */}
        <div className="stack">
          <div className="card">
            <div className="card__head"><div className="card__title">Detalle de la cita</div></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Servicio", value: svc?.nombre ?? "Consulta" },
                { label: "Tipo", value: svc?.tipo === "teleconsulta" ? "Teleconsulta" : "Presencial" },
                { label: "Fecha", value: fmtDate(cita.inicio) },
                { label: "Hora", value: `${fmtTime(cita.inicio)} — ${fmtTime(cita.fin)}` },
                { label: "Duración", value: `${cita.duracion_min} min` },
                { label: "Recurrente", value: cita.es_recurrente ? "Sí" : "No" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>{label}</div>
                  <div style={{ fontSize: "var(--fs-sm)", marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>
            {cita.notas && (
              <>
                <hr style={{ border: "none", borderTop: "1px solid var(--c-border-faint)", margin: "14px 0" }} />
                <div>
                  <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>Notas</div>
                  <p style={{ fontSize: "var(--fs-sm)", marginTop: 4, lineHeight: 1.6 }}>{cita.notas}</p>
                </div>
              </>
            )}
          </div>

          <CitaActions citaId={cita.id} estadoActual={estado} />
        </div>

        {/* Datos del paciente */}
        {pac && (
          <div className="card" style={{ height: "fit-content" }}>
            <div className="card__head"><div className="card__title">Paciente</div></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="avatar" style={{ width: 38, height: 38, background: "var(--c-brand)", fontSize: 13 }}>
                  {pac.nombre.split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{pac.nombre}</div>
                  {pac.consentimiento_whatsapp && (
                    <span className="badge badge-success" style={{ fontSize: 9, marginTop: 2 }}>WA</span>
                  )}
                </div>
              </div>
              {pac.telefono && <div style={{ fontSize: "var(--fs-sm)" }}>{pac.telefono}</div>}
              {pac.email && <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>{pac.email}</div>}
              <Link href={`/panel/pacientes/${pac.id}`} className="btn btn-ghost btn-sm" style={{ marginTop: 4 }}>
                Ver expediente →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
