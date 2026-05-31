import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { sendWhatsApp, msgCumpleanos } from "@/lib/twilio"
import { sendCumpleanos } from "@/lib/resend"
import { format } from "date-fns"

// Ejecutar diariamente a las 09:00 México (15:00 UTC)
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret")
  if (
    process.env.NODE_ENV === "production" &&
    secret !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()
  const hoyMesDia = format(new Date(), "MM-dd")

  // Obtener todos los pacientes con cumpleaños hoy que tienen consentimientos
  const { data: pacientes } = await supabase
    .from("pacientes")
    .select(`
      id, nombre, email, telefono,
      consentimiento_whatsapp, consentimiento_privacidad,
      consultorio_id,
      consultorio:consultorios(nombre, medico_nombre, plan_estado)
    `)
    .not("fecha_nacimiento", "is", null)
    .is("eliminado_en", null)

  const cumpleaneros = (pacientes ?? []).filter((p: { fecha_nacimiento?: string | null; [key: string]: unknown }) => {
    if (!p.fecha_nacimiento) return false
    return (p.fecha_nacimiento as string).slice(5) === hoyMesDia
  })

  let enviados = 0
  let errores = 0

  for (const pac of cumpleaneros) {
    const cons = pac.consultorio as any
    if (!cons || cons.plan_estado !== "activo") continue

    // WhatsApp
    if (pac.consentimiento_whatsapp && pac.telefono) {
      try {
        await sendWhatsApp(pac.telefono, msgCumpleanos({
          pacienteNombre: pac.nombre,
          medicoNombre: cons.medico_nombre,
          consultorioNombre: cons.nombre,
        }))
        await supabase.from("mensajes_log").insert({
          consultorio_id: pac.consultorio_id,
          paciente_id: pac.id,
          tipo: "cumpleanos",
          canal: "whatsapp",
          estado: "enviado",
        })
        enviados++
      } catch (e: any) {
        await supabase.from("mensajes_log").insert({
          consultorio_id: pac.consultorio_id,
          paciente_id: pac.id,
          tipo: "cumpleanos",
          canal: "whatsapp",
          estado: "fallido",
          error: e.message,
        })
        errores++
      }
    }

    // Email
    if (pac.email && pac.consentimiento_privacidad) {
      try {
        await sendCumpleanos({
          to: pac.email,
          pacienteNombre: pac.nombre,
          medicoNombre: cons.medico_nombre,
          consultorioNombre: cons.nombre,
        })
        enviados++
      } catch {
        errores++
      }
    }
  }

  return NextResponse.json({
    ok: true,
    cumpleaneros: cumpleaneros.length,
    enviados,
    errores,
  })
}
