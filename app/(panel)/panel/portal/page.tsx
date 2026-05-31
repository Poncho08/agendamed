import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PortalClient } from "./portal-client"

export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: consultorio } = await supabase
    .from("consultorios")
    .select("id, nombre, medico_nombre, especialidad, slug, direccion, ciudad, telefono")
    .eq("user_id", user.id)
    .single()

  if (!consultorio) redirect("/onboarding")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const bookingUrl = consultorio.slug
    ? `${appUrl}/agendar/${consultorio.slug}`
    : null

  return (
    <div className="stack">
      <header className="page__head">
        <div className="page__title-wrap">
          <span className="page__eyebrow">Portal público</span>
          <h1 className="page__title">Comparte tu página de citas</h1>
          <p className="page__sub">Envía este enlace a tus pacientes para que agenden en línea.</p>
        </div>
      </header>

      <PortalClient
        bookingUrl={bookingUrl}
        consultorio={{
          nombre: consultorio.nombre,
          medico_nombre: consultorio.medico_nombre,
          especialidad: consultorio.especialidad,
          slug: consultorio.slug,
          direccion: consultorio.direccion,
          ciudad: consultorio.ciudad,
          telefono: consultorio.telefono,
        }}
      />
    </div>
  )
}
