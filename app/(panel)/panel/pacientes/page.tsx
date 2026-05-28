import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { fmtDate, fmtEdad } from "@/lib/utils"
import { PacientesClient } from "./pacientes-client"

export default async function PacientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: consultorio } = await supabase
    .from("consultorios")
    .select("id")
    .eq("user_id", user.id)
    .single()
  if (!consultorio) redirect("/onboarding")

  const { data: pacientes } = await supabase
    .from("pacientes")
    .select("id, nombre, email, telefono, fecha_nacimiento, total_citas, no_shows_contador, ultima_cita, consentimiento_whatsapp")
    .eq("consultorio_id", consultorio.id)
    .is("eliminado_en", null)
    .order("nombre")

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Directorio</span>
          <h1 className="page__title">Pacientes</h1>
          <p className="page__sub">{pacientes?.length ?? 0} pacientes activos</p>
        </div>
        <div className="page__actions">
          <Link href="/panel/pacientes/nuevo" className="btn btn-primary">
            + Nuevo paciente
          </Link>
        </div>
      </header>
      <PacientesClient pacientes={pacientes ?? []} />
    </div>
  )
}
