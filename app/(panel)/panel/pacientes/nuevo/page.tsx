import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NuevoPacienteForm } from "./nuevo-paciente-form"

export default async function NuevoPacientePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: consultorio } = await supabase
    .from("consultorios").select("id").eq("user_id", user.id).single()
  if (!consultorio) redirect("/onboarding")

  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Pacientes</span>
          <h1 className="page__title">Nuevo paciente</h1>
        </div>
      </header>
      <NuevoPacienteForm consultorioId={consultorio.id} />
    </div>
  )
}
