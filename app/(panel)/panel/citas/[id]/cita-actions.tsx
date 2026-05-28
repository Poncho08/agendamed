"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { CitaEstado } from "@/types/database"

const TRANSICIONES: Partial<Record<CitaEstado, CitaEstado[]>> = {
  pendiente: ["confirmada", "cancelada", "noshow"],
  confirmada: ["completada", "cancelada", "noshow"],
}

const LABEL: Partial<Record<CitaEstado, string>> = {
  confirmada: "Confirmar",
  completada: "Marcar completada",
  cancelada: "Cancelar cita",
  noshow: "Marcar no show",
}

const BTN_CLASS: Partial<Record<CitaEstado, string>> = {
  confirmada: "btn-brand",
  completada: "btn-success",
  cancelada: "btn-danger",
  noshow: "btn-ghost",
}

export function CitaActions({
  citaId,
  estadoActual,
}: {
  citaId: string
  estadoActual: CitaEstado
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<CitaEstado | null>(null)

  const siguientes = TRANSICIONES[estadoActual] ?? []
  if (siguientes.length === 0) return null

  async function cambiarEstado(nuevoEstado: CitaEstado) {
    setLoading(nuevoEstado)
    const supabase = createClient()
    const { error } = await (supabase.from("citas") as any).update({ estado: nuevoEstado }).eq("id", citaId)
    if (error) {
      toast.error("Error al actualizar la cita")
    } else {
      toast.success(`Cita marcada como ${nuevoEstado}`)
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div className="card">
      <div className="card__head"><div className="card__title">Acciones</div></div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {siguientes.map((estado) => (
          <button
            key={estado}
            className={`btn ${BTN_CLASS[estado] ?? "btn-ghost"} btn-sm`}
            onClick={() => cambiarEstado(estado)}
            disabled={loading !== null}
          >
            {loading === estado ? "…" : LABEL[estado]}
          </button>
        ))}
      </div>
    </div>
  )
}
