import { createServiceClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { PublicBookingClient } from "./public-booking-client"

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from("consultorios")
    .select("nombre, medico_nombre, especialidad")
    .eq("slug", params.slug)
    .eq("plan_estado", "activo")
    .single()

  if (!data) return { title: "Agendar cita" }

  return {
    title: `Agendar cita con ${data.medico_nombre}`,
    description: `${data.especialidad} · ${data.nombre}`,
  }
}

export default async function PublicBookPage({ params }: Props) {
  const supabase = createServiceClient()

  const { data: consultorio } = await supabase
    .from("consultorios")
    .select("id, nombre, medico_nombre, especialidad, logo_url, ciudad, slug")
    .eq("slug", params.slug)
    .eq("plan_estado", "activo")
    .single()

  if (!consultorio) notFound()

  const [{ data: servicios }, { data: horarios }] = await Promise.all([
    supabase
      .from("servicios")
      .select("id, nombre, duracion_min, precio_mxn, tipo")
      .eq("consultorio_id", consultorio.id)
      .eq("activo", true)
      .order("orden"),
    supabase
      .from("horarios")
      .select("*")
      .eq("consultorio_id", consultorio.id)
      .eq("activo", true),
  ])

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>
      <header className="public-head">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "var(--c-brand)", borderRadius: 8, display: "grid", placeItems: "center", color: "white", fontWeight: 700 }}>
            {consultorio.medico_nombre.split(" ").filter(Boolean).slice(0,2).map((w: string) => w[0]).join("")}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{consultorio.medico_nombre}</div>
            <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>{consultorio.especialidad}</div>
          </div>
        </div>
        <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>{consultorio.ciudad}</span>
      </header>

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-semibold)", marginBottom: 6 }}>
            Agenda tu cita
          </h1>
          <p className="muted" style={{ fontSize: "var(--fs-sm)" }}>
            Con {consultorio.medico_nombre} · {consultorio.nombre}
          </p>
        </div>
        <PublicBookingClient
          consultorioId={consultorio.id}
          servicios={servicios ?? []}
          horarios={horarios ?? []}
        />
      </main>
    </div>
  )
}
