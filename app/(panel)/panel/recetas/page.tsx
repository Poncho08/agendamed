import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { fmtDate } from "@/lib/utils"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { plantillas } from "@/lib/whatsapp-links"

export default async function RecetasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: consultorio } = await supabase
    .from("consultorios")
    .select("id, medico_nombre")
    .eq("user_id", user.id)
    .single()
  if (!consultorio) redirect("/onboarding")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const { data: recetas, count } = await supabase
    .from("recetas")
    .select("*, paciente:pacientes(nombre, telefono)", { count: "exact" })
    .eq("consultorio_id", consultorio.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const { count: recetasMes } = await supabase
    .from("recetas")
    .select("id", { count: "exact", head: true })
    .eq("consultorio_id", consultorio.id)
    .gte("created_at", inicioMes)

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Documentos</span>
          <h1 className="page__title">Historial de recetas</h1>
          <p className="page__sub">{count ?? 0} recetas generadas · {recetasMes ?? 0} este mes</p>
        </div>
        <div className="page__actions">
          <Link href="/panel/recetas/nueva" className="btn btn-primary">
            + Nueva receta
          </Link>
        </div>
      </header>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Diagnóstico</th>
              <th style={{ textAlign: "right" }}>Meds</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!recetas || recetas.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--c-text-faint)" }}>
                  No hay recetas generadas.{" "}
                  <Link href="/panel/recetas/nueva" className="link">Crear primera receta →</Link>
                </td>
              </tr>
            ) : (
              recetas.map((rx) => {
                const meds = Array.isArray(rx.medicamentos) ? rx.medicamentos.length : 0
                const pac = rx.paciente as { nombre: string; telefono: string | null } | null
                const pdfUrl = `${appUrl}/api/pdf/receta/${rx.id}`
                return (
                  <tr key={rx.id}>
                    <td>
                      <span className="mono muted" style={{ fontSize: "var(--fs-xs)" }}>{rx.folio}</span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: "var(--fs-sm)" }}>{fmtDate(rx.created_at)}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="avatar" style={{ width: 26, height: 26, background: "var(--c-brand)", fontSize: 9 }}>
                          {pac?.nombre?.split(" ").filter(Boolean).slice(0,2).map(w => w[0]).join("").toUpperCase()}
                        </div>
                        <span style={{ fontSize: "var(--fs-sm)" }}>{pac?.nombre}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: "var(--fs-sm)" }}>{rx.diagnostico}</td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)" }}>{meds}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
                        <Link href={`/api/pdf/receta/${rx.id}`} className="btn btn-ghost btn-sm" target="_blank">
                          Ver PDF
                        </Link>
                        {pac?.telefono && (
                          <WhatsAppButton
                            telefono={pac.telefono}
                            texto="Enviar por WhatsApp"
                            size="sm"
                            mensaje={plantillas.receta({ paciente: pac.nombre, doctor: consultorio.medico_nombre, linkPdf: pdfUrl, folio: rx.folio })}
                          />
                        )}
                        {rx.enviada_wa && (
                          <span className="badge badge-success" style={{ fontSize: 10 }}>WA ✓</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
