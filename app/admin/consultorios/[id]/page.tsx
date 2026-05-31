import { createServiceClient, createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AdminConsultorioForm } from "./form"
import { isAdmin } from "@/lib/admin"

export default async function AdminConsultorioPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) {
    redirect("/panel")
  }

  const serviceClient = createServiceClient()
  const { data: consultorio } = await serviceClient
    .from("consultorios")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!consultorio) redirect("/admin")

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/admin" className="btn btn-ghost btn-sm">
          ← Volver
        </Link>
        <h1 style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-semibold)" }}>
          {consultorio.nombre}
        </h1>
      </div>
      <AdminConsultorioForm consultorio={consultorio} />
    </div>
  )
}
