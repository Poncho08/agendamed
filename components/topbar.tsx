"use client"

import { Search } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function Topbar() {
  const hoy = format(new Date(), "EEE d MMM yyyy", { locale: es })

  return (
    <header className="topbar">
      <div>
        <button className="topbar__search">
          <Search size={14} />
          <span>Buscar pacientes, citas…</span>
          <kbd
            style={{
              marginLeft: "auto",
              background: "var(--c-surface-3)",
              border: "1px solid var(--c-border)",
              borderRadius: 4,
              padding: "1px 5px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--c-text-faint)",
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>
      <div />
      <div className="topbar__actions">
        <span className="topbar__date-chip">{hoy}</span>
      </div>
    </header>
  )
}
