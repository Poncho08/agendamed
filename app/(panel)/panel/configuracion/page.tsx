import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SettingsClient } from "./settings-client"

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: consultorio } = await supabase
    .from("consultorios")
    .select("*")
    .eq("user_id", user.id)
    .single()
  if (!consultorio) redirect("/onboarding")

  const [{ data: servicios }, { data: horarios }, { data: configMsg }] = await Promise.all([
    supabase.from("servicios").select("*").eq("consultorio_id", consultorio.id).order("orden"),
    supabase.from("horarios").select("*").eq("consultorio_id", consultorio.id).order("dia_semana"),
    supabase.from("configuracion_mensajes").select("*").eq("consultorio_id", consultorio.id).single(),
  ])

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Cuenta</span>
          <h1 className="page__title">Configuración</h1>
          <p className="page__sub">Gestiona tu consultorio, horarios, servicios y plantillas.</p>
        </div>
      </header>
      <SettingsClient
        consultorio={consultorio}
        servicios={servicios ?? []}
        horarios={horarios ?? []}
        configMsg={configMsg}
      />
    </div>
  )
}
