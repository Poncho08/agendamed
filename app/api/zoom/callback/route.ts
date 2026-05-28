import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { exchangeZoomCode } from "@/lib/zoom"

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const code = url.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/panel/configuracion?error=zoom_denied", request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const tokens = await exchangeZoomCode(code)
  if (!tokens) {
    return NextResponse.redirect(new URL("/panel/configuracion?error=zoom_token", request.url))
  }

  // Obtener email de Zoom
  let zoomEmail: string | null = null
  try {
    const meRes = await fetch("https://api.zoom.us/v2/users/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const me = await meRes.json()
    zoomEmail = me.email ?? null
  } catch {
    // Ignorar
  }

  const expiraEn = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  await supabase
    .from("consultorios")
    .update({
      zoom_access_token: tokens.access_token,
      zoom_refresh_token: tokens.refresh_token,
      zoom_token_expira_en: expiraEn,
      zoom_account_email: zoomEmail,
    })
    .eq("user_id", user.id)

  return NextResponse.redirect(new URL("/panel/configuracion?zoom=ok", request.url))
}
