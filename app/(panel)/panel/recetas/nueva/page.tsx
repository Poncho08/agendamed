import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NuevaRecetaForm } from "./nueva-receta-form"

export default async function NuevaRecetaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: consultorio } = await supabase
    .from("consultorios")
    .select("*")
    .eq("user_id", user.id)
    .single()
  if (!consultorio) redirect("/onboarding")

  const [{ data: pacientes }, { data: plantillas }] = await Promise.all([
    supabase
      .from("pacientes")
      .select("id, nombre, fecha_nacimiento, grupo_sanguineo, consentimiento_whatsapp, telefono")
      .eq("consultorio_id", consultorio.id)
      .is("eliminado_en", null)
      .order("nombre"),
    supabase
      .from("plantillas_receta")
      .select("*")
      .eq("consultorio_id", consultorio.id),
  ])

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Documento de apoyo</span>
          <h1 className="page__title">Nueva receta</h1>
        </div>
      </header>
      <NuevaRecetaForm
        consultorio={consultorio}
        pacientes={pacientes ?? []}
        plantillas={plantillas ?? []}
      />
    </div>
  )
}
