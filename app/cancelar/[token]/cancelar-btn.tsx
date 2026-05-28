"use client"

import { useState } from "react"
import { toast } from "sonner"

export function CancelarBtn({ token, citaId }: { token: string; citaId: string }) {
  const [loading, setLoading] = useState(false)
  const [cancelada, setCancelada] = useState(false)

  async function handleCancelar() {
    setLoading(true)
    const res = await fetch("/api/public/cancelar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })

    setLoading(false)
    if (!res.ok) {
      toast.error("Error al cancelar. Intenta de nuevo o contacta al consultorio.")
      return
    }
    setCancelada(true)
  }

  if (cancelada) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>Cita cancelada correctamente</p>
        <p className="muted" style={{ fontSize: "var(--fs-sm)" }}>
          El consultorio ha sido notificado. Puedes agendar una nueva cita cuando lo desees.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button
        className="btn btn-danger btn-full btn-lg"
        onClick={handleCancelar}
        disabled={loading}
      >
        {loading ? "Cancelando…" : "Confirmar cancelación"}
      </button>
      <p className="muted" style={{ fontSize: "var(--fs-xs)" }}>
        Esta acción no se puede deshacer. El consultorio recibirá una notificación.
      </p>
    </div>
  )
}
