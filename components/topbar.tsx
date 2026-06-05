"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Search, Menu } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function Topbar() {
  const hoy = format(new Date(), "EEE d MMM yyyy", { locale: es })
  const pathname = usePathname()
  const router = useRouter()
  const [navOpen, setNavOpen] = useState(false)

  // Sincroniza el estado con la clase del <html> que controla el drawer en CSS
  useEffect(() => {
    document.documentElement.classList.toggle("nav-open", navOpen)
  }, [navOpen])

  // Cierra el drawer al navegar (clic en un link del sidebar cambia la ruta)
  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  return (
    <>
      <header className="topbar">
        <button
          className="topbar__hamburger"
          onClick={() => setNavOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        <div>
          <button
            className="topbar__search"
            onClick={() => router.push("/panel/pacientes")}
          >
            <Search size={14} />
            <span>Buscar pacientes…</span>
          </button>
        </div>

        <div className="topbar__actions">
          <span className="topbar__date-chip">{hoy}</span>
        </div>
      </header>

      {/* Backdrop — al tocar fuera del drawer se cierra (solo visible en móvil) */}
      <div className="nav-backdrop" onClick={() => setNavOpen(false)} />
    </>
  )
}
