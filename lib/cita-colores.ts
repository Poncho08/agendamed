import type { CitaEstado } from "@/types/database"

export const coloresCita: Record<CitaEstado, { bg: string; border: string; text: string }> = {
  pendiente:  { bg: "#FEF9C3", border: "#EAB308", text: "#713F12" },
  confirmada: { bg: "#DCFCE7", border: "#22C55E", text: "#14532D" },
  completada: { bg: "#F1F5F9", border: "#94A3B8", text: "#475569" },
  cancelada:  { bg: "#FEE2E2", border: "#EF4444", text: "#7F1D1D" },
  noshow:     { bg: "#FED7AA", border: "#F97316", text: "#7C2D12" },
}

export const labelEstado: Record<CitaEstado, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  noshow: "No se presentó",
}
