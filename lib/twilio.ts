import twilio from "twilio"

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const FROM = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886"

// IMPORTANTE: SIEMPRE verificar consentimiento_whatsapp antes de llamar esta función
export async function sendWhatsApp(to: string, body: string): Promise<string> {
  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`
  const message = await client.messages.create({
    from: FROM,
    to: toFormatted,
    body,
  })
  return message.sid
}

export function msgRecordatorio24h(params: {
  pacienteNombre: string
  medicoNombre: string
  fecha: string
  hora: string
  servicio: string
  cancelUrl: string
}): string {
  return (
    `Hola ${params.pacienteNombre} 👋\n\n` +
    `Te recordamos que mañana tienes cita con *${params.medicoNombre}*:\n\n` +
    `📅 *Fecha:* ${params.fecha}\n` +
    `🕐 *Hora:* ${params.hora}\n` +
    `🩺 *Servicio:* ${params.servicio}\n\n` +
    `Si no puedes asistir, cancela aquí (al menos 3h antes):\n${params.cancelUrl}`
  )
}

export function msgRecordatorio2h(params: {
  pacienteNombre: string
  medicoNombre: string
  hora: string
}): string {
  return (
    `Hola ${params.pacienteNombre} 👋\n\n` +
    `Recuerda que en *2 horas* tienes cita con *${params.medicoNombre}* a las *${params.hora}*.\n\n` +
    `¡Te esperamos! 🩺`
  )
}

export function msgCumpleanos(params: {
  pacienteNombre: string
  medicoNombre: string
  consultorioNombre: string
}): string {
  return (
    `¡Hola ${params.pacienteNombre}! 🎂🎉\n\n` +
    `*${params.medicoNombre}* y todo el equipo de *${params.consultorioNombre}* te deseamos un feliz cumpleaños.\n\n` +
    `¡Que lo disfrutes mucho! 🎈`
  )
}

export function msgConfirmacionCita(params: {
  pacienteNombre: string
  medicoNombre: string
  fecha: string
  hora: string
  cancelUrl: string
}): string {
  return (
    `Hola ${params.pacienteNombre} ✅\n\n` +
    `Tu cita con *${params.medicoNombre}* ha sido confirmada:\n\n` +
    `📅 *Fecha:* ${params.fecha}\n` +
    `🕐 *Hora:* ${params.hora}\n\n` +
    `Para cancelar (mínimo 3h antes):\n${params.cancelUrl}`
  )
}
