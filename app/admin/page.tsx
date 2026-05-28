import { createServiceClient } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { fmtDate, planLabel } from "@/lib/utils"

const ADMIN_EMAILS = ["silvaalfonso381@gmail.com", "admin@agendamed.mx"]

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    redirect("/panel")
  }

  const serviceClient = createServiceClient()
  const { data: consultorios } = await serviceClient
    .from("consultorios")
    .select("id, nombre, medico_nombre, especialidad, plan, plan_estado, prueba_termina_en, created_at, ciudad, email")
    .order("created_at", { ascending: false })

  type ConsultorioRow = { id: string; nombre: string; medico_nombre: string; especialidad: string; plan: string; plan_estado: string; prueba_termina_en: string; created_at: string; ciudad: string | null; email: string }
  const rows = (consultorios ?? []) as ConsultorioRow[]
  const activos = rows.filter(c => c.plan_estado === "activo").length
  const enPrueba = rows.filter(c => c.plan === "prueba").length
  const suspendidos = rows.filter(c => c.plan_estado === "suspendido").length

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-semibold)", marginBottom: 24 }}>
        Admin · AgendaMed
      </h1>

      {/* Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Consultorios totales", value: rows.length },
          { label: "Activos", value: activos },
          { label: "En prueba", value: enPrueba },
          { label: "Suspendidos", value: suspendidos },
        ].map(m => (
          <div key={m.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "var(--fs-3xl)", fontWeight: "var(--fw-semibold)" }}>{m.value}</div>
            <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Consultorio</th>
              <th>Médico</th>
              <th>Plan</th>
              <th>Estado</th>
              <th>Registro</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 500, fontSize: "var(--fs-sm)" }}>{c.nombre}</div>
                  <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>{c.ciudad} · {c.email}</div>
                </td>
                <td style={{ fontSize: "var(--fs-sm)" }}>
                  <div>{c.medico_nombre}</div>
                  <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>{c.especialidad}</div>
                </td>
                <td>
                  <span className={`badge ${c.plan === "pro" ? "badge-brand" : c.plan === "base" ? "badge-success" : "badge-neutral"}`}>
                    {planLabel(c.plan)}
                  </span>
                </td>
                <td>
                  <span className={`badge ${c.plan_estado === "activo" ? "badge-success" : c.plan_estado === "suspendido" ? "badge-danger" : "badge-neutral"}`}>
                    {c.plan_estado}
                  </span>
                </td>
                <td style={{ fontSize: "var(--fs-xs)" }} className="muted">{fmtDate(c.created_at)}</td>
                <td>
                  <Link href={`/admin/consultorios/${c.id}`} className="btn btn-ghost btn-sm">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
