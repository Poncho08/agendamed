import { Resend } from "resend"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "re_placeholder")
}
const FROM = process.env.RESEND_FROM ?? "AgendaMed <noreply@agendamed.mx>"

interface EmailConfirmacionCita {
  to: string
  pacienteNombre: string
  medicoNombre: string
  consultorioNombre: string
  fecha: string
  hora: string
  servicio: string
  cancelUrl: string
}

export async function sendConfirmacionCita(data: EmailConfirmacionCita) {
  return getResend().emails.send({
    from: FROM,
    to: data.to,
    subject: `Cita confirmada con ${data.medicoNombre}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a2e">Tu cita está confirmada ✓</h2>
        <p>Hola <strong>${data.pacienteNombre}</strong>,</p>
        <p>Tu cita con <strong>${data.medicoNombre}</strong> ha sido confirmada:</p>
        <div style="background:#f5f5f8;border-radius:12px;padding:16px;margin:16px 0">
          <p style="margin:0 0 8px"><strong>Fecha:</strong> ${data.fecha}</p>
          <p style="margin:0 0 8px"><strong>Hora:</strong> ${data.hora}</p>
          <p style="margin:0"><strong>Servicio:</strong> ${data.servicio}</p>
        </div>
        <p style="font-size:13px;color:#666">
          ¿Necesitas cancelar? <a href="${data.cancelUrl}">Cancela aquí</a> con al menos 3 horas de anticipación.
        </p>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0">
        <p style="font-size:12px;color:#999">${data.consultorioNombre} · Enviado por AgendaMed</p>
      </div>
    `,
  })
}

interface EmailRecordatorio {
  to: string
  pacienteNombre: string
  medicoNombre: string
  fecha: string
  hora: string
  cancelUrl: string
  tipo: "24h" | "2h"
}

export async function sendRecordatorioCita(data: EmailRecordatorio) {
  const cuando = data.tipo === "24h" ? "mañana" : "en 2 horas"
  return getResend().emails.send({
    from: FROM,
    to: data.to,
    subject: `Recordatorio: cita ${cuando} con ${data.medicoNombre}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2>Recuerda tu cita ${cuando} 📅</h2>
        <p>Hola <strong>${data.pacienteNombre}</strong>,</p>
        <p>Te recordamos que tienes cita con <strong>${data.medicoNombre}</strong>:</p>
        <div style="background:#f5f5f8;border-radius:12px;padding:16px;margin:16px 0">
          <p style="margin:0 0 8px"><strong>Fecha:</strong> ${data.fecha}</p>
          <p style="margin:0"><strong>Hora:</strong> ${data.hora}</p>
        </div>
        ${data.tipo === "24h" ? `<p style="font-size:13px;color:#666">¿No puedes asistir? <a href="${data.cancelUrl}">Cancela aquí</a></p>` : ""}
      </div>
    `,
  })
}

interface EmailCumpleanos {
  to: string
  pacienteNombre: string
  medicoNombre: string
  consultorioNombre: string
}

export async function sendCumpleanos(data: EmailCumpleanos) {
  return getResend().emails.send({
    from: FROM,
    to: data.to,
    subject: `¡Feliz cumpleaños, ${data.pacienteNombre}! 🎂`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;text-align:center">
        <div style="font-size:48px">🎂</div>
        <h2>¡Feliz cumpleaños, ${data.pacienteNombre}!</h2>
        <p>El equipo de <strong>${data.consultorioNombre}</strong> y el ${data.medicoNombre} te desean un excelente día.</p>
        <p style="font-size:12px;color:#999;margin-top:32px">Enviado por AgendaMed</p>
      </div>
    `,
  })
}

export async function sendReactivacion(data: {
  to: string
  pacienteNombre: string
  consultorioNombre: string
  planesUrl: string
}) {
  return getResend().emails.send({
    from: FROM,
    to: data.to,
    subject: "Tu consultorio necesita renovar su plan",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2>Tu prueba ha terminado</h2>
        <p>Hola, el periodo de prueba de <strong>${data.consultorioNombre}</strong> ha terminado.</p>
        <p>Elige un plan para seguir usando AgendaMed y mantener acceso a todos tus pacientes y citas.</p>
        <a href="${data.planesUrl}" style="display:inline-block;background:#3b5bdb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Ver planes</a>
      </div>
    `,
  })
}
