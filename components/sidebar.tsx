"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  CreditCard,
  LogOut,
  Stethoscope,
  Share2,
} from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Consultorio } from "@/types/database"
import { cn, planLabel, diasHastaPrueba } from "@/lib/utils"

const NAV = [
  { href: "/panel", label: "Inicio", icon: LayoutDashboard, exact: true },
  {
    label: "Agenda",
    icon: Calendar,
    children: [
      { href: "/panel/agenda", label: "Vista de agenda" },
      { href: "/panel/citas", label: "Todas las citas" },
      { href: "/panel/citas/nueva", label: "Nueva cita" },
    ],
  },
  { href: "/panel/pacientes", label: "Pacientes", icon: Users },
  { href: "/panel/recetas", label: "Recetas", icon: FileText },
  { href: "/panel/portal", label: "Portal de citas", icon: Share2 },
  { href: "/panel/configuracion", label: "Configuración", icon: Settings },
]

interface SidebarProps {
  consultorio: Consultorio
  pacientesCount?: number
}

export function Sidebar({ consultorio, pacientesCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [agendaOpen, setAgendaOpen] = useState(
    pathname.startsWith("/panel/agenda") || pathname.startsWith("/panel/citas")
  )

  const pacientes = pacientesCount
  const maxPac = consultorio.max_pacientes
  const fillPct = Math.min(100, (pacientes / maxPac) * 100)

  const diasRestantes =
    consultorio.plan === "prueba"
      ? diasHastaPrueba(consultorio.prueba_termina_en)
      : null

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className={cn("sidebar", collapsed && "collapsed")}>
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-mark">
          <Stethoscope size={16} />
        </div>
        {!collapsed && (
          <span className="sidebar__logo-name">AgendaMed</span>
        )}
      </div>

      {/* CTA */}
      <div className="sidebar__cta">
        <Link
          href="/panel/citas/nueva"
          className={cn(
            "btn btn-primary btn-full",
            collapsed && "justify-center px-0 w-10 h-9"
          )}
        >
          <Plus size={16} />
          {!collapsed && <span>Nueva cita</span>}
        </Link>
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        {NAV.map((item) => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  className={cn(
                    "nav-item",
                    item.children.some((c) => pathname.startsWith(c.href)) && "active"
                  )}
                  onClick={() => setAgendaOpen((o) => !o)}
                >
                  <item.icon size={16} />
                  {!collapsed && (
                    <>
                      <span className="nav-item__label">{item.label}</span>
                      <span className="ml-auto">
                        {agendaOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </span>
                    </>
                  )}
                </button>
                {agendaOpen && !collapsed && (
                  <div style={{ marginLeft: 24 }}>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn("nav-item", isActive(child.href) && "active")}
                      >
                        <span className="nav-item__label">{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn("nav-item", isActive(item.href!, item.exact) && "active")}
            >
              <item.icon size={16} />
              {!collapsed && <span className="nav-item__label">{item.label}</span>}
            </Link>
          )
        })}

        <hr className="hr" style={{ margin: "8px 0" }} />

        <Link
          href="/planes"
          className="nav-item"
        >
          <CreditCard size={16} />
          {!collapsed && <span className="nav-item__label">Plan y suscripción</span>}
        </Link>

        <button className="nav-item" style={{ color: "var(--c-danger-fg)" }} onClick={handleSignOut}>
          <LogOut size={16} />
          {!collapsed && <span className="nav-item__label">Cerrar sesión</span>}
        </button>
      </nav>

      {/* Plan bar */}
      {!collapsed && (
        <div className="sidebar__plan-bar">
          <div className="plan-bar">
            {diasRestantes !== null && (
              <div className="plan-bar__label" style={{ marginBottom: 8 }}>
                <span style={{ color: "var(--c-warning-fg)", fontWeight: 600 }}>
                  {diasRestantes} días de prueba restantes
                </span>
              </div>
            )}
            <div className="plan-bar__label">
              {planLabel(consultorio.plan)} · {pacientes}/{maxPac} pac.
            </div>
            <div className="plan-bar__track">
              <div className="plan-bar__fill" style={{ width: `${fillPct}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* User */}
      <div className="sidebar__user">
        <div
          className="avatar"
          style={{
            width: 28,
            height: 28,
            background: "var(--c-brand)",
            fontSize: 10,
          }}
        >
          {consultorio.medico_nombre
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase()}
        </div>
        {!collapsed && (
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{consultorio.medico_nombre}</div>
            <div className="sidebar__user-role">{consultorio.especialidad}</div>
          </div>
        )}
        <button
          className="iconbtn"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          style={{ marginLeft: "auto" }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
    </aside>
  )
}
