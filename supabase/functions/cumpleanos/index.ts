import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

serve(async () => {
  const hoy = new Date()
  const mesDia = `${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`

  // Pacientes que cumplen años hoy
  const { data: pacientes } = await supabase
    .from("pacientes")
    .select(`
      id, nombre, telefono, email, consentimiento_whatsapp,
      consultorio:consultorios(id, nombre, medico_nombre, configuracion_mensajes(cumpleanos))
    `)
    .is("eliminado_en", null)
    .not("fecha_nacimiento", "is", null)
    .like("fecha_nacimiento", `%-${mesDia}`)

  let enviados = 0
  let errores = 0

  for (const pac of pacientes ?? []) {
    const cons = pac.consultorio as any
    // Verificar que el consultorio tiene cumpleaños activado
    if (!cons?.configuracion_mensajes?.[0]?.cumpleanos) continue
    // SIEMPRE verificar consentimiento_whatsapp
    if (!pac.consentimiento_whatsapp || !pac.telefono) continue

    // Verificar si ya enviamos hoy
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString()
    const { data: yaEnviado } = await supabase
      .from("mensajes_log")
      .select("id")
      .eq("paciente_id", pac.id)
      .eq("tipo", "cumpleanos")
      .gte("created_at", inicioHoy)
      .single()

    if (yaEnviado) continue

    const body =
      `¡Hola ${pac.nombre}! 🎂🎉\n\n` +
      `*${cons.medico_nombre}* y todo el equipo de *${cons.nombre}* te deseamos un feliz cumpleaños.\n\n` +
      `¡Que lo disfrutes mucho! 🎈`

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
        consultorio_id: cons.id,
        paciente_id: pac.id,
        tipo: "cumpleanos",
        canal: "whatsapp",
        estado: "enviado",
        proveedor_id: msg.sid,
      })
      enviados++
    } catch (err: any) {
      await supabase.from("mensajes_log").insert({
        consultorio_id: cons.id,
        paciente_id: pac.id,
        tipo: "cumpleanos",
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
