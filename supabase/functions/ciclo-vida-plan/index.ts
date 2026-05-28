import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

serve(async () => {
  const ahora = new Date().toISOString()

  // Consultorios en prueba vencida y activos
  const { data: expirados } = await supabase
    .from("consultorios")
    .select("id, email, nombre, medico_nombre")
    .eq("plan", "prueba")
    .eq("plan_estado", "activo")
    .lt("prueba_termina_en", ahora)

  let suspendidos = 0

  for (const c of expirados ?? []) {
    await supabase
      .from("consultorios")
      .update({ plan_estado: "suspendido" })
      .eq("id", c.id)

    // Enviar email de reactivación via Resend
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: Deno.env.get("RESEND_FROM") ?? "AgendaMed <noreply@agendamed.mx>",
          to: c.email,
          subject: "Tu periodo de prueba ha terminado",
          html: `
            <div style="font-family:system-ui;max-width:480px;margin:0 auto;padding:24px">
              <h2>Tu prueba ha terminado</h2>
              <p>Hola, el periodo de prueba de <strong>${c.nombre}</strong> ha terminado.</p>
              <p>Elige un plan para continuar usando AgendaMed y mantener acceso a todos tus pacientes y citas.</p>
              <a href="${Deno.env.get("APP_URL")}/planes?expired=1" style="display:inline-block;background:#3b5bdb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Ver planes</a>
            </div>
          `,
        }),
      })
    } catch (e) {
      console.error("Error sending reactivation email:", e)
    }

    suspendidos++
  }

  return new Response(JSON.stringify({ suspendidos }), {
    headers: { "Content-Type": "application/json" },
  })
})
