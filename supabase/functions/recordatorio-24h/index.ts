import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

serve(async () => {
  const ahora = new Date()
  // Ventana: citas que empiezan entre 23h y 25h desde ahora
  const desde = new Date(ahora.getTime() + 23 * 60 * 60 * 1000)
  const hasta = new Date(ahora.getTime() + 25 * 60 * 60 * 1000)

  const { data: citas, error } = await supabase
    .from("citas")
    .select(`
      *,
      paciente:pacientes(id, nombre, telefono, email, consentimiento_whatsapp),
      servicio:servicios(nombre),
      consultorio:consultorios(medico_nombre, nombre)
    `)
    .gte("inicio", desde.toISOString())
    .lte("inicio", hasta.toISOString())
    .in("estado", ["pendiente", "confirmada"])
    .eq("es_bloqueo", false)

  if (error) {
    console.error("Error fetching citas:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  let enviados = 0
  let errores = 0

  for (const cita of citas ?? []) {
    const pac = cita.paciente as any
    const cons = cita.consultorio as any
    const svc = cita.servicio as any

    // Verificar consentimiento_whatsapp SIEMPRE antes de enviar
    if (!pac?.consentimiento_whatsapp || !pac?.telefono) continue

    // Verificar si ya enviamos en las últimas 2h para esta cita
    const { data: yaEnviado } = await supabase
      .from("mensajes_log")
      .select("id")
      .eq("cita_id", cita.id)
      .eq("tipo", "recordatorio_24h")
      .gte("created_at", new Date(ahora.getTime() - 2 * 60 * 60 * 1000).toISOString())
      .single()

    if (yaEnviado) continue

    const cancelUrl = `${Deno.env.get("APP_URL")}/cancelar/${cita.cancelacion_token}`
    const inicio = new Date(cita.inicio)
    const fechaStr = inicio.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
    const horaStr = inicio.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })

    const body =
      `Hola ${pac.nombre} 👋\n\n` +
      `Te recordamos que mañana tienes cita con *${cons.medico_nombre}*:\n\n` +
      `📅 *Fecha:* ${fechaStr}\n` +
      `🕐 *Hora:* ${horaStr}\n` +
      (svc ? `🩺 *Servicio:* ${svc.nombre}\n` : "") +
      `\nSi no puedes asistir, cancela aquí:\n${cancelUrl}`

    try {
      const twilio = await import("npm:twilio")
      const client = twilio.default(
        Deno.env.get("TWILIO_ACCOUNT_SID")!,
        Deno.env.get("TWILIO_AUTH_TOKEN")!
      )

      const msg = await client.messages.create({
        from: Deno.env.get("TWILIO_WHATSAPP_FROM")!,
        to: `whatsapp:${pac.telefono}`,
        body,
      })

      await supabase.from("mensajes_log").insert({
        consultorio_id: cita.consultorio_id,
        paciente_id: pac.id,
        cita_id: cita.id,
        tipo: "recordatorio_24h",
        canal: "whatsapp",
        estado: "enviado",
        proveedor_id: msg.sid,
      })
      enviados++
    } catch (err: any) {
      await supabase.from("mensajes_log").insert({
        consultorio_id: cita.consultorio_id,
        paciente_id: pac.id,
        cita_id: cita.id,
        tipo: "recordatorio_24h",
        canal: "whatsapp",
        estado: "fallido",
        error: err.message,
      })
      errores++
    }
  }

  return new Response(JSON.stringify({ enviados, errores }), {
    headers: { "Content-Type": "application/json" },
  })
})
