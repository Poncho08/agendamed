import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { z } from "zod"

const schema = z.object({
  token: z.string().uuid(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 })
  }

  const { token } = result.data
  const supabase = createServiceClient()

  // Obtener cita por token — siempre validar en servidor
  const { data: cita } = await supabase
    .from("citas")
    .select("id, inicio, estado, consultorio_id, paciente_id")
    .eq("cancelacion_token", token)
    .single()

  if (!cita) {
    return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
  }

  if (cita.estado === "cancelada" || cita.estado === "completada") {
    return NextResponse.json({ error: "Esta cita no puede ser cancelada" }, { status: 409 })
  }

  // Verificar ventana de cancelación (mínimo 3h)
  const inicio = new Date(cita.inicio)
  const diffHoras = (inicio.getTime() - Date.now()) / (1000 * 60 * 60)

  if (diffHoras < 3) {
    return NextResponse.json(
      { error: "La ventana de cancelación ha expirado. Contacta al consultorio." },
      { status: 409 }
    )
  }

  // Cancelar — el trigger RLS "cancel_by_token" valida sin auth
  const { error } = await supabase
    .from("citas")
    .update({ estado: "cancelada", cancelado_por_pac: true, motivo_cancelacion: "Cancelado por el paciente" })
    .eq("id", cita.id)
    .eq("cancelacion_token", token)

  if (error) {
    return NextResponse.json({ error: "Error al cancelar" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
