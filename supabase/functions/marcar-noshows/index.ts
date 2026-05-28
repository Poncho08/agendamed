import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

serve(async () => {
  const ahora = new Date()
  // Citas que terminaron hace más de 30 min y siguen como pendiente/confirmada
  const limite = new Date(ahora.getTime() - 30 * 60 * 1000)

  const { data: citas, error } = await supabase
    .from("citas")
    .select("id, fin")
    .in("estado", ["pendiente", "confirmada"])
    .lt("fin", limite.toISOString())
    .eq("es_bloqueo", false)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  let marcados = 0
  for (const cita of citas ?? []) {
    const { error: updateErr } = await supabase
      .from("citas")
      .update({ estado: "noshow" })
      .eq("id", cita.id)

    if (!updateErr) marcados++
  }

  return new Response(JSON.stringify({ marcados }), {
    headers: { "Content-Type": "application/json" },
  })
})
