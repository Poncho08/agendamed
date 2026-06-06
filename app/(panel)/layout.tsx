import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { InstallBanner } from "@/components/install-banner"

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: consultorio } = await supabase
    .from("consultorios")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!consultorio) redirect("/onboarding")

  // Si el plan está suspendido, redirigir a expirado
  if (
    consultorio.plan_estado === "suspendido" ||
    (consultorio.plan === "prueba" &&
      new Date(consultorio.prueba_termina_en) < new Date())
  ) {
    redirect("/planes?expired=1")
  }

  return (
    <div className="app-shell">
      <Sidebar consultorio={consultorio} />
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Topbar medicoNombre={consultorio.medico_nombre} />
        <main className="main-content">
          <div className="page">
            <InstallBanner />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
