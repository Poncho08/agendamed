import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { slugify } from "@/lib/utils"
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

  // Auto-heal: si el consultorio no tiene slug, lo generamos automáticamente
  // a partir del nombre del consultorio (o del médico como respaldo) y lo
  // guardamos. El slug nunca se edita manualmente — solo se genera una vez.
  let slug = consultorio.slug
  if (!slug) {
    const base = slugify(consultorio.nombre || consultorio.medico_nombre || "consultorio")
    slug = base || "consultorio"
    // Garantizar unicidad
    let intento = 0
    while (intento < 20) {
      const candidato = intento === 0 ? base : `${base}-${intento}`
      const { data: existente } = await supabase
        .from("consultorios")
        .select("id")
        .eq("slug", candidato)
        .neq("id", consultorio.id)
        .maybeSingle()
      if (!existente) {
        slug = candidato
        break
      }
      intento++
    }
    await supabase.from("consultorios").update({ slug }).eq("id", consultorio.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const bookingUrl = `${appUrl}/agendar/${slug}`

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
          slug,
          direccion: consultorio.direccion,
          ciudad: consultorio.ciudad,
          telefono: consultorio.telefono,
        }}
      />
    </div>
  )
}
