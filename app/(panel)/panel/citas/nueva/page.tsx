import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NuevaCitaForm } from "./nueva-cita-form"

export default async function NuevaCitaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: consultorio } = await supabase
    .from("consultorios")
    .select("id")
    .eq("user_id", user.id)
    .single()
  if (!consultorio) redirect("/onboarding")

  const [{ data: pacientes }, { data: servicios }] = await Promise.all([
    supabase
      .from("pacientes")
      .select("id, nombre, telefono, email")
      .eq("consultorio_id", consultorio.id)
      .is("eliminado_en", null)
      .order("nombre"),
    supabase
      .from("servicios")
      .select("id, nombre, duracion_min, precio_mxn, tipo")
      .eq("consultorio_id", consultorio.id)
      .eq("activo", true)
      .order("orden"),
  ])

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Agenda</span>
          <h1 className="page__title">Nueva cita</h1>
        </div>
      </header>
      <NuevaCitaForm
        consultorioId={consultorio.id}
        pacientes={pacientes ?? []}
        servicios={servicios ?? []}
      />
    </div>
  )
}
