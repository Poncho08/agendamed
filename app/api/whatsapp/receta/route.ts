import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendWhatsApp } from "@/lib/twilio"
import { z } from "zod"

const schema = z.object({
  recetaId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const { data: receta } = await supabase
    .from("recetas")
    .select("id, folio, diagnostico, paciente:pacientes(nombre, telefono, consentimiento_whatsapp), consultorio:consultorios(nombre, medico_nombre)")
    .eq("id", result.data.recetaId)
    .single()

  if (!receta) {
    return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 })
  }

  const paciente = receta.paciente as unknown as { nombre: string; telefono: string | null; consentimiento_whatsapp: boolean } | null
  const consultorio = receta.consultorio as unknown as { nombre: string; medico_nombre: string } | null

  // SIEMPRE verificar consentimiento_whatsapp antes de enviar
  if (!paciente?.consentimiento_whatsapp) {
    return NextResponse.json({ error: "Paciente sin consentimiento WhatsApp" }, { status: 400 })
  }

  if (!paciente.telefono) {
    return NextResponse.json({ error: "Paciente sin teléfono registrado" }, { status: 400 })
  }

  const mensaje = `Hola ${paciente.nombre}, tu receta del ${consultorio?.nombre ?? "consultorio"} ha sido generada.\n\nDiagnóstico: ${receta.diagnostico}\nFolio: ${receta.folio}\n\nConsulta a ${consultorio?.medico_nombre ?? "tu médico"} ante cualquier duda.`

  try {
    await sendWhatsApp(paciente.telefono, mensaje)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al enviar WhatsApp"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
