"use client"

import { useState, useEffect } from "react"
import { X, Download } from "lucide-react"

// Evento beforeinstallprompt (no está en los tipos estándar de TS)
interface BIPEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallBanner() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // No mostrar si ya está instalada o si el usuario la cerró antes
    if (window.matchMedia("(display-mode: standalone)").matches) return
    if (localStorage.getItem("agendamed-install-dismissed") === "1") return

    function onPrompt(e: Event) {
      e.preventDefault()
      setDeferred(e as BIPEvent)
      setVisible(true)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    return () => window.removeEventListener("beforeinstallprompt", onPrompt)
  }, [])

  async function instalar() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setVisible(false)
    setDeferred(null)
  }

  function cerrar() {
    localStorage.setItem("agendamed-install-dismissed", "1")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "var(--c-brand-soft)",
        border: "1px solid var(--c-brand-border)",
        borderRadius: "var(--r-md)",
        padding: "10px 12px",
        marginBottom: 12,
      }}
    >
      <span style={{ fontSize: 18 }}>📱</span>
      <span style={{ flex: 1, fontSize: "var(--fs-sm)", color: "var(--c-brand-fg)", fontWeight: 500 }}>
        Instala AgendaMed en tu celular
      </span>
      <button className="btn btn-primary btn-sm" onClick={instalar}>
        <Download size={14} /> Instalar
      </button>
      <button className="iconbtn" onClick={cerrar} aria-label="Cerrar">
        <X size={16} />
      </button>
    </div>
  )
}
