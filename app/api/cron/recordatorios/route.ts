import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { sendWhatsApp, msgRecordatorio24h, msgRecordatorio2h } from "@/lib/twilio"
import { sendRecordatorioCita } from "@/lib/resend"
import { formatInTimeZone } from "date-fns-tz"
import { addHours, parseISO } from "date-fns"
import { es } from "date-fns/locale"

const TZ = "America/Mexico_City"

// Vercel invoca esta ruta según el cron definido en vercel.json
// También se puede llamar manualmente con el header x-cron-secret
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret")
  if (
    process.env.NODE_ENV === "production" &&
    secret !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()
  const ahora = new Date()
  const en24h = addHours(ahora, 24)
  const en26h = addHours(ahora, 26)
  const en2h = addHours(ahora, 2)
  const en3h = addHours(ahora, 3)

  let enviados = 0
  let errores = 0

  // ─── Recordatorios 24h ────────────────────────────────────────────
  const { data: citas24h } = await supabase
    .from("citas")
    .select(`
      id, inicio, fin,
      paciente:pacientes(nombre, telefono, email, consentimiento_whatsapp),
      servicio:servicios(nombre),
      consultorio:consultorios(medico_nombre, nombre, recordatorio_24h_enviado)
    `)
    .gte("inicio", en24h.toISOString())
    .lte("inicio", en26h.toISOString())
    .in("estado", ["pendiente", "confirmada"])

  for (const cita of citas24h ?? []) {
    const pac = cita.paciente as any
    const svc = cita.servicio as any
    const cons = cita.consultorio as any
    if (!pac || !cons) continue

    const fechaStr = formatInTimeZone(parseISO(cita.inicio), TZ, "d 'de' MMMM yyyy", { locale: es })
    const horaStr = formatInTimeZone(parseISO(cita.inicio), TZ, "HH:mm")
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cancelar/${(cita as any).cancelacion_token ?? ""}`

    // WhatsApp
    if (pac.consentimiento_whatsapp && pac.telefono) {
      try {
        const sid = await sendWhatsApp(pac.telefono, msgRecordatorio24h({
          pacienteNombre: pac.nombre,
          medicoNombre: cons.medico_nombre,
          fecha: fechaStr,
          hora: horaStr,
          servicio: svc?.nombre ?? "Consulta",
          cancelUrl,
        }))
        await supabase.from("mensajes_log").insert({
          consultorio_id: (cita as any).consultorio_id,
          paciente_id: (cita as any).paciente_id,
          cita_id: cita.id,
          tipo: "recordatorio_24h",
          canal: "whatsapp",
          estado: "enviado",
          proveedor_id: sid,
        })
        enviados++
      } catch (e: any) {
        await supabase.from("mensajes_log").insert({
          consultorio_id: (cita as any).consultorio_id,
          paciente_id: (cita as any).paciente_id,
          cita_id: cita.id,
          tipo: "recordatorio_24h",
          canal: "whatsapp",
          estado: "fallido",
          error: e.message,
        })
        errores++
      }
    }

    // Email
    if (pac.email) {
      try {
        await sendRecordatorioCita({
          to: pac.email,
          pacienteNombre: pac.nombre,
          medicoNombre: cons.medico_nombre,
          fecha: fechaStr,
          hora: horaStr,
          cancelUrl,
          tipo: "24h",
        })
        enviados++
      } catch {
        errores++
      }
    }
  }

  // ─── Recordatorios 2h ────────────────────────────────────────────
  const { data: citas2h } = await supabase
    .from("citas")
    .select(`
      id, inicio,
      paciente:pacientes(nombre, telefono, consentimiento_whatsapp),
      consultorio:consultorios(medico_nombre)
    `)
    .gte("inicio", en2h.toISOString())
    .lte("inicio", en3h.toISOString())
    .in("estado", ["pendiente", "confirmada"])

  for (const cita of citas2h ?? []) {
    const pac = cita.paciente as any
    const cons = cita.consultorio as any
    if (!pac?.consentimiento_whatsapp || !pac.telefono || !cons) continue

    const horaStr = formatInTimeZone(parseISO(cita.inicio), TZ, "HH:mm")
    try {
      const sid = await sendWhatsApp(pac.telefono, msgRecordatorio2h({
        pacienteNombre: pac.nombre,
        medicoNombre: cons.medico_nombre,
        hora: horaStr,
      }))
      await supabase.from("mensajes_log").insert({
        consultorio_id: (cita as any).consultorio_id,
        paciente_id: (cita as any).paciente_id,
        cita_id: cita.id,
        tipo: "recordatorio_2h",
        canal: "whatsapp",
        estado: "enviado",
        proveedor_id: sid,
      })
      enviados++
    } catch (e: any) {
      errores++
    }
  }

  return NextResponse.json({
    ok: true,
    enviados,
    errores,
    procesados_24h: citas24h?.length ?? 0,
    procesados_2h: citas2h?.length ?? 0,
  })
}
