import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { z } from "zod"
import { sendConfirmacionCita } from "@/lib/resend"
import { sendWhatsApp, msgConfirmacionCita } from "@/lib/twilio"
import { formatInTimeZone } from "date-fns-tz"
import { es } from "date-fns/locale"

const TZ = "America/Mexico_City"

const schema = z.object({
  consultorio_id: z.string().uuid(),
  servicio_id: z.string().uuid(),
  inicio: z.string(),
  fin: z.string(),
  duracion_min: z.number(),
  paciente: z.object({
    nombre: z.string().min(2),
    telefono: z.string().min(8),
    email: z.string().email().optional().nullable(),
    consentimiento_privacidad: z.boolean(),
    consentimiento_whatsapp: z.boolean(),
  }),
})

export async function POST(request: Request) {
  const body = await request.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors }, { status: 400 })
  }

  const { consultorio_id, servicio_id, inicio, fin, duracion_min, paciente } = result.data
  const supabase = createServiceClient()

  // Verificar que el consultorio existe y está activo
  const { data: consultorio } = await supabase
    .from("consultorios")
    .select("id, nombre, medico_nombre, plan_estado")
    .eq("id", consultorio_id)
    .eq("plan_estado", "activo")
    .single()

  if (!consultorio) {
    return NextResponse.json({ error: "Consultorio no disponible" }, { status: 404 })
  }

  // Verificar que el slot está disponible (no hay solapamiento)
  const { data: solapamiento } = await supabase
    .from("citas")
    .select("id")
    .eq("consultorio_id", consultorio_id)
    .neq("estado", "cancelada")
    .lt("inicio", fin)
    .gt("fin", inicio)
    .single()

  if (solapamiento) {
    return NextResponse.json({ error: "El horario ya no está disponible" }, { status: 409 })
  }

  // Crear o encontrar paciente
  let pacienteId: string

  const { data: pacExistente } = await supabase
    .from("pacientes")
    .select("id")
    .eq("consultorio_id", consultorio_id)
    .eq("telefono", paciente.telefono)
    .is("eliminado_en", null)
    .single()

  if (pacExistente) {
    pacienteId = pacExistente.id
    // Actualizar consentimientos
    await supabase
      .from("pacientes")
      .update({
        consentimiento_privacidad: paciente.consentimiento_privacidad,
        consentimiento_whatsapp: paciente.consentimiento_whatsapp,
      })
      .eq("id", pacienteId)
  } else {
    const { data: nuevoPac, error: pacErr } = await supabase
      .from("pacientes")
      .insert({
        consultorio_id,
        nombre: paciente.nombre,
        telefono: paciente.telefono,
        email: paciente.email ?? null,
        consentimiento_privacidad: paciente.consentimiento_privacidad,
        consentimiento_whatsapp: paciente.consentimiento_whatsapp,
      })
      .select("id")
      .single()

    if (pacErr || !nuevoPac) {
      return NextResponse.json({ error: "Error creando paciente" }, { status: 500 })
    }
    pacienteId = nuevoPac.id
  }

  // Crear cita
  const { data: cita, error: citaErr } = await supabase
    .from("citas")
    .insert({
      consultorio_id,
      paciente_id: pacienteId,
      servicio_id,
      inicio,
      fin,
      duracion_min,
      estado: "pendiente",
    })
    .select()
    .single()

  if (citaErr || !cita) {
    return NextResponse.json({ error: "Error creando cita" }, { status: 500 })
  }

  // Enviar confirmación — formatear siempre en zona horaria del consultorio (México)
  const inicioDate = new Date(inicio)
  const fechaStr = formatInTimeZone(inicioDate, TZ, "d 'de' MMMM yyyy", { locale: es })
  const horaStr = formatInTimeZone(inicioDate, TZ, "HH:mm")
  const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cancelar/${cita.cancelacion_token}`

  // WhatsApp (solo si tiene consentimiento)
  if (paciente.consentimiento_whatsapp && paciente.telefono) {
    try {
      const sid = await sendWhatsApp(
        paciente.telefono,
        msgConfirmacionCita({
          pacienteNombre: paciente.nombre,
          medicoNombre: consultorio.medico_nombre,
          fecha: fechaStr,
          hora: horaStr,
          cancelUrl,
        })
      )
      await supabase.from("mensajes_log").insert({
        consultorio_id,
        paciente_id: pacienteId,
        cita_id: cita.id,
        tipo: "confirmacion",
        canal: "whatsapp",
        estado: "enviado",
        proveedor_id: sid,
      })
    } catch (e: any) {
      await supabase.from("mensajes_log").insert({
        consultorio_id,
        paciente_id: pacienteId,
        cita_id: cita.id,
        tipo: "confirmacion",
        canal: "whatsapp",
        estado: "fallido",
        error: e.message,
      })
    }
  }

  // Email
  if (paciente.email) {
    try {
      await sendConfirmacionCita({
        to: paciente.email,
        pacienteNombre: paciente.nombre,
        medicoNombre: consultorio.medico_nombre,
        consultorioNombre: consultorio.nombre,
        fecha: fechaStr,
        hora: horaStr,
        servicio: "",
        cancelUrl,
      })
    } catch {
      // Silencioso: no bloquear por fallo de email
    }
  }

  return NextResponse.json({ citaId: cita.id }, { status: 201 })
}
