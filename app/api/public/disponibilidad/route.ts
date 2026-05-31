import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { fromZonedTime } from "date-fns-tz"

const TZ = "America/Mexico_City"

// GET /api/public/disponibilidad?consultorio_id=xxx&fecha=2025-06-10&duracion=30
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const consultorioId = searchParams.get("consultorio_id")
  const fecha = searchParams.get("fecha")        // "YYYY-MM-DD"
  const duracion = parseInt(searchParams.get("duracion") ?? "30")

  if (!consultorioId || !fecha) {
    return NextResponse.json({ error: "Parámetros requeridos" }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Traer citas del día completo en zona horaria México
  // El cliente envía la fecha en hora local México, el servidor debe consultar lo mismo
  const inicioDelDia = fromZonedTime(`${fecha}T00:00:00`, TZ).toISOString()
  const finDelDia = fromZonedTime(`${fecha}T23:59:59`, TZ).toISOString()

  const { data: citas } = await supabase
    .from("citas")
    .select("inicio, fin")
    .eq("consultorio_id", consultorioId)
    .neq("estado", "cancelada")
    .gte("inicio", inicioDelDia)
    .lte("inicio", finDelDia)

  const SLOTS = [
    "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30",
  ]

  const slotsOcupados: string[] = []

  for (const slot of SLOTS) {
    // Construir inicio del slot en hora México (igual que hace el cliente)
    const inicioSlot = fromZonedTime(`${fecha}T${slot}:00`, TZ)
    const finSlot = new Date(inicioSlot.getTime() + duracion * 60 * 1000)

    const ocupado = (citas ?? []).some((c: { inicio: string; fin: string }) => {
      const ci = new Date(c.inicio)
      const cf = new Date(c.fin)
      return ci < finSlot && cf > inicioSlot
    })

    if (ocupado) slotsOcupados.push(slot)
  }

  return NextResponse.json({ slotsOcupados })
}
