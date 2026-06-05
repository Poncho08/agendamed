import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { sendWhatsApp, msgRecordatorio24h } from "@/lib/twilio"
import { sendRecordatorioCita } from "@/lib/resend"
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz"
import { addDays, parseISO } from "date-fns"
import { es } from "date-fns/locale"

const TZ = "America/Mexico_City"

// Recordatorios — OPCIÓN A: una vez al día (cron diario del plan Hobby).
// Cada mañana envía recordatorio por EMAIL a TODAS las citas del día siguiente.
// WhatsApp se intenta solo si el paciente dio consentimiento (cuando esté activo).
export async function GET(request: NextRequest) {
  // Vercel Cron manda "Authorization: Bearer <CRON_SECRET>".
  // También aceptamos "x-cron-secret" para pruebas manuales.
  const auth = request.headers.get("authorization")
  const xSecret = request.headers.get("x-cron-secret")
  const secret = process.env.CRON_SECRET
  const autorizado =
    process.env.NODE_ENV !== "production" ||
    auth === `Bearer ${secret}` ||
    xSecret === secret
  if (!autorizado) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Calcular el día de MAÑANA en horario de México y convertirlo a UTC
  const nowMX = toZonedTime(new Date(), TZ)
  const mananaMX = addDays(nowMX, 1)
  const y = mananaMX.getFullYear()
  const m = String(mananaMX.getMonth() + 1).padStart(2, "0")
  const d = String(mananaMX.getDate()).padStart(2, "0")
  const fechaManana = `${y}-${m}-${d}`
  const inicioDia = fromZonedTime(`${fechaManana}T00:00:00`, TZ).toISOString()
  const finDia = fromZonedTime(`${fechaManana}T23:59:59`, TZ).toISOString()

  const { data: citas } = await supabase
    .from("citas")
    .select(`
      id, inicio, consultorio_id, paciente_id, cancelacion_token,
      paciente:pacientes(nombre, telefono, email, consentimiento_whatsapp),
      servicio:servicios(nombre),
      consultorio:consultorios(medico_nombre, nombre)
    `)
    .gte("inicio", inicioDia)
    .lte("inicio", finDia)
    .in("estado", ["pendiente", "confirmada"])

  let emailsEnviados = 0
  let whatsappEnviados = 0
  let errores = 0

  for (const cita of citas ?? []) {
    const pac = cita.paciente as any
    const svc = cita.servicio as any
    const cons = cita.consultorio as any
    if (!pac || !cons) continue

    const fechaStr = formatInTimeZone(parseISO(cita.inicio), TZ, "EEEE d 'de' MMMM", { locale: es })
    const horaStr = formatInTimeZone(parseISO(cita.inicio), TZ, "HH:mm")
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cancelar/${cita.cancelacion_token ?? ""}`

    // EMAIL (canal principal)
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
        await supabase.from("mensajes_log").insert({
          consultorio_id: cita.consultorio_id,
          paciente_id: cita.paciente_id,
          cita_id: cita.id,
          tipo: "recordatorio_dia_anterior",
          canal: "email",
          estado: "enviado",
        })
        emailsEnviados++
      } catch (e: any) {
        await supabase.from("mensajes_log").insert({
          consultorio_id: cita.consultorio_id,
          paciente_id: cita.paciente_id,
          cita_id: cita.id,
          tipo: "recordatorio_dia_anterior",
          canal: "email",
          estado: "fallido",
          error: e.message,
        })
        errores++
      }
    }

    // WhatsApp (secundario — solo si hay consentimiento y número)
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
          consultorio_id: cita.consultorio_id,
          paciente_id: cita.paciente_id,
          cita_id: cita.id,
          tipo: "recordatorio_dia_anterior",
          canal: "whatsapp",
          estado: "enviado",
          proveedor_id: sid,
        })
        whatsappEnviados++
      } catch {
        // WhatsApp aún en sandbox — fallo no bloquea el email
        errores++
      }
    }
  }

  return NextResponse.json({
    ok: true,
    fecha_recordada: fechaManana,
    citas_encontradas: citas?.length ?? 0,
    emails_enviados: emailsEnviados,
    whatsapp_enviados: whatsappEnviados,
    errores,
  })
}
