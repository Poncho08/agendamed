"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { User, Settings, LogOut } from "lucide-react"

export function AvatarMenu({ medicoNombre }: { medicoNombre: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const iniciales = medicoNombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function cerrarSesion() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú de usuario"
        className="avatar"
        style={{ width: 34, height: 34, background: "var(--c-brand)", fontSize: 12, cursor: "pointer" }}
      >
        {iniciales}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 200,
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--r-md)",
            boxShadow: "var(--sh-lg)",
            zIndex: 50,
            overflow: "hidden",
            padding: 4,
          }}
        >
          <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--c-border-faint)", marginBottom: 4 }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{medicoNombre}</div>
          </div>
          <MenuItem icon={<User size={15} />} label="Mi perfil" onClick={() => { setOpen(false); router.push("/panel/configuracion") }} />
          <MenuItem icon={<Settings size={15} />} label="Configuración" onClick={() => { setOpen(false); router.push("/panel/configuracion") }} />
          <MenuItem icon={<LogOut size={15} />} label="Cerrar sesión" danger onClick={cerrarSesion} />
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="nav-item"
      style={{ width: "100%", borderRadius: "var(--r-sm)", color: danger ? "var(--c-danger-fg)" : undefined }}
    >
      {icon}
      <span className="nav-item__label">{label}</span>
    </button>
  )
}
