import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { CookieOptions } from "@supabase/ssr"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isPublicRoute = [
    "/",
    "/planes",
    "/login",
    "/registro",
    "/onboarding",
    "/auth/",
  ].some((p) => url.pathname.startsWith(p))

  const isApiRoute = url.pathname.startsWith("/api/")
  const isAgendar = url.pathname.startsWith("/agendar/")
  const isCancelar = url.pathname.startsWith("/cancelar/")
  const isAdminRoute = url.pathname.startsWith("/admin")

  if (!user && !isPublicRoute && !isApiRoute && !isAgendar && !isCancelar) {
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (user && (url.pathname === "/login" || url.pathname === "/registro")) {
    url.pathname = "/panel"
    return NextResponse.redirect(url)
  }

  // Verificar que admin tiene rol correcto
  if (isAdminRoute && user) {
    const { data: consultorio } = await supabase
      .from("consultorios")
      .select("id")
      .eq("user_id", user.id)
      .single()

    // Si no tiene consultorio, no es admin real — redirigir
    // (el rol admin se maneja por email en el DB, no aquí)
    if (!consultorio && !url.pathname.startsWith("/admin/auth")) {
      url.pathname = "/panel"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
