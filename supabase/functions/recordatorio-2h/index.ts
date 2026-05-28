import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!
const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!
const TWILIO_WA = Deno.env.get("TWILIO_WHATSAPP_FROM")!

async function sendWhatsApp(to: string, body: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
    },
    body: new URLSearchParams({
      From: `whatsapp:${TWILIO_WA}`,
      To: `whatsapp:${to}`,
      Body: body,
    }),
  })
  if (!res.ok) throw new Error(await res.text())
}

serve(async () => {
  const ahora = new Date()
  const en2h = new Date(ahora.getTime() + 2 * 60 * 60 * 1000)
  const ventanaInicio = new Date(en2h.getTime() - 15 * 60 * 1000)
  const ventanaFin = new Date(en2h.getTime() + 15 * 60 * 1000)

  const { data: citas, error } = await supabase
    .from("citas")
    .select(`
      id,
      inicio,
      consultorio:consultorios(nombre, medico_nombre),
      paciente:pacientes(nombre, telefono, consentimiento_whatsapp)
    `)
    .in("estado", ["pendiente", "confirmada"])
    .gte("inicio", ventanaInicio.toISOString())
    .lte("inicio", ventanaFin.toISOString())

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  let enviados = 0
  const errores: string[] = []

  for (const cita of citas ?? []) {
    const pac = cita.paciente as { nombre: string; telefono: string | null; consentimiento_whatsapp: boolean } | null
    const cons = cita.consultorio as { nombre: string; medico_nombre: string } | null

    // SIEMPRE verificar consentimiento_whatsapp antes de enviar
    if (!pac?.consentimiento_whatsapp || !pac.telefono) continue

    // Verificar si ya se envió recordatorio de 2h para esta cita
    const { data: yaEnviado } = await supabase
      .from("mensajes_log")
      .select("id")
      .eq("cita_id", cita.id)
      .eq("tipo", "recordatorio_2h")
      .single()

    if (yaEnviado) continue

    const inicio = new Date(cita.inicio)
    const hora = inicio.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true })
    const fecha = inicio.toLocaleDateString("es-MX", { day: "numeric", month: "long" })

    const mensaje = `Hola ${pac.nombre}, este es un recordatorio de que tienes cita en ${cons?.nombre} *en 2 horas*.\n\n📅 Hoy ${fecha} a las ${hora}\n👨‍⚕️ ${cons?.medico_nombre}`

    try {
      await sendWhatsApp(pac.telefono, mensaje)

      await supabase.from("mensajes_log").insert({
        cita_id: cita.id,
        tipo: "recordatorio_2h",
        canal: "whatsapp",
        estado: "enviado",
      })

      enviados++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errores.push(`${cita.id}: ${msg}`)

      await supabase.from("mensajes_log").insert({
        cita_id: cita.id,
        tipo: "recordatorio_2h",
        canal: "whatsapp",
        estado: "error",
        error_detalle: msg,
      })
    }
  }

  return new Response(JSON.stringify({ enviados, errores }), {
    headers: { "Content-Type": "application/json" },
  })
})
