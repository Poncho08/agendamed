import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { z } from "zod"

const schema = z.object({
  userId: z.string().uuid(),
})

// Borra un usuario de Auth que quedó huérfano (sin consultorio) tras un
// registro fallido. Solo borra si NO tiene consultorio asociado — así no
// se puede usar para eliminar cuentas válidas.
export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "userId inválido" }, { status: 400 })
  }

  const { userId } = result.data
  const supabase = createServiceClient()

  // Seguridad: solo borrar si el usuario NO tiene consultorio (es huérfano)
  const { data: consultorio } = await supabase
    .from("consultorios")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  if (consultorio) {
    // Tiene consultorio → es una cuenta válida, NO borrar
    return NextResponse.json({ error: "El usuario tiene un consultorio activo" }, { status: 409 })
  }

  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
