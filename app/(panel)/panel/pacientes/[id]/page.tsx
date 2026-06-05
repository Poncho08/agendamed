import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { fmtDate, fmtEdad, fmtTime } from "@/lib/utils"
import type { CitaEstado } from "@/types/database"

const ESTADO_BADGE: Record<CitaEstado, string> = {
  pendiente: "badge-warning",
  confirmada: "badge-brand",
  completada: "badge-success",
  cancelada: "badge-neutral",
  noshow: "badge-danger",
}

export default async function PatientProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: consultorio } = await supabase
    .from("consultorios").select("id").eq("user_id", user.id).single()
  if (!consultorio) redirect("/onboarding")

  const { data: paciente } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", params.id)
    .eq("consultorio_id", consultorio.id)
    .is("eliminado_en", null)
    .single()

  if (!paciente) notFound()

  const [{ data: citas }, { data: recetas }] = await Promise.all([
    supabase
      .from("citas")
      .select("*, servicio:servicios(nombre)")
      .eq("paciente_id", paciente.id)
      .order("inicio", { ascending: false })
      .limit(20),
    supabase
      .from("recetas")
      .select("id, folio, diagnostico, created_at")
      .eq("paciente_id", paciente.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <Link href="/panel/pacientes" className="muted" style={{ fontSize: "var(--fs-xs)", display: "block", marginBottom: 6 }}>
            ← Pacientes
          </Link>
          <h1 className="page__title">{paciente.nombre}</h1>
          {paciente.fecha_nacimiento && (
            <p className="page__sub">{fmtEdad(paciente.fecha_nacimiento)} años · {paciente.grupo_sanguineo ?? "Sin grupo sanguíneo"}</p>
          )}
        </div>
        <div className="page__actions">
          <Link href={`/panel/citas/nueva?paciente=${paciente.id}`} className="btn btn-primary">
            + Nueva cita
          </Link>
          <Link href={`/panel/recetas/nueva?paciente=${paciente.id}`} className="btn btn-secondary">
            + Receta
          </Link>
        </div>
      </header>

      <div className="col-split" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        {/* Citas */}
        <div className="stack">
          <div className="card">
            <div className="card__head">
              <div className="card__title">Historial de citas</div>
            </div>
            {!citas || citas.length === 0 ? (
              <p className="muted" style={{ fontSize: "var(--fs-sm)", textAlign: "center", padding: "20px 0" }}>
                Sin citas registradas
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Servicio</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((c) => {
                    const svc = c.servicio as { nombre: string } | null
                    return (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontSize: "var(--fs-sm)" }}>{fmtDate(c.inicio)}</div>
                          <div className="mono muted" style={{ fontSize: "var(--fs-xs)" }}>{fmtTime(c.inicio)}</div>
                        </td>
                        <td style={{ fontSize: "var(--fs-sm)" }}>{svc?.nombre ?? "Consulta"}</td>
                        <td>
                          <span className={`badge ${ESTADO_BADGE[c.estado as CitaEstado]}`}>
                            {c.estado}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {recetas && recetas.length > 0 && (
            <div className="card">
              <div className="card__head"><div className="card__title">Recetas</div></div>
              <ul>
                {recetas.map((rx, i) => (
                  <li key={rx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < recetas.length - 1 ? "1px solid var(--c-border-faint)" : "none" }}>
                    <div>
                      <div className="mono muted" style={{ fontSize: "var(--fs-xs)" }}>{rx.folio}</div>
                      <div style={{ fontSize: "var(--fs-sm)" }}>{rx.diagnostico}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>{fmtDate(rx.created_at)}</span>
                      <Link href={`/api/pdf/receta/${rx.id}`} className="btn btn-ghost btn-sm" target="_blank">
                        PDF
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar datos */}
        <div className="card" style={{ height: "fit-content" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div className="avatar" style={{ width: 44, height: 44, background: "var(--c-brand)", fontSize: 14 }}>
                {paciente.nombre.split(" ").filter(Boolean).slice(0,2).map((w: string) => w[0]).join("").toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{paciente.nombre}</div>
                {paciente.consentimiento_whatsapp && (
                  <span className="badge badge-success" style={{ marginTop: 4 }}>WA activo</span>
                )}
              </div>
            </div>

            <hr className="hr" style={{ margin: "4px 0" }} />

            {[
              { label: "Email", value: paciente.email },
              { label: "Teléfono", value: paciente.telefono },
              { label: "Nacimiento", value: paciente.fecha_nacimiento ? fmtDate(paciente.fecha_nacimiento) : null },
              { label: "Sexo", value: paciente.sexo },
              { label: "Grupo sanguíneo", value: paciente.grupo_sanguineo },
              { label: "Alergias", value: paciente.alergias },
              { label: "Total citas", value: String(paciente.total_citas) },
              { label: "No shows", value: paciente.no_shows_contador > 0 ? String(paciente.no_shows_contador) : "0" },
            ].filter(({ value }) => value).map(({ label, value }) => (
              <div key={label}>
                <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>{label}</div>
                <div style={{ fontSize: "var(--fs-sm)", marginTop: 2 }}>{value}</div>
              </div>
            ))}

            {paciente.notas_medicas && (
              <>
                <hr className="hr" style={{ margin: "4px 0" }} />
                <div>
                  <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>Notas médicas</div>
                  <p style={{ fontSize: "var(--fs-sm)", marginTop: 4, lineHeight: 1.6 }}>{paciente.notas_medicas}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
