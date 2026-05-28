"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { fmtDate, fmtEdad } from "@/lib/utils"

interface Paciente {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  fecha_nacimiento: string | null
  total_citas: number
  no_shows_contador: number
  ultima_cita: string | null
  consentimiento_whatsapp: boolean
}

export function PacientesClient({ pacientes }: { pacientes: Paciente[] }) {
  const [busqueda, setBusqueda] = useState("")

  const filtrados = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.telefono?.includes(busqueda)
  )

  return (
    <div className="stack">
      <div className="card" style={{ padding: "12px 16px" }}>
        <div style={{ position: "relative", maxWidth: 360 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--c-text-faint)" }} />
          <input
            className="input"
            style={{ paddingLeft: 32 }}
            placeholder="Buscar por nombre, email o teléfono…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Contacto</th>
              <th>Edad</th>
              <th style={{ textAlign: "right" }}>Citas</th>
              <th style={{ textAlign: "right" }}>No shows</th>
              <th>Última cita</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--c-text-faint)" }}>
                  {busqueda ? "Sin resultados para la búsqueda" : "No hay pacientes registrados"}
                </td>
              </tr>
            ) : (
              filtrados.map((p) => (
                <tr key={p.id} style={{ cursor: "pointer" }}>
                  <td>
                    <Link href={`/panel/pacientes/${p.id}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        className="avatar"
                        style={{ width: 32, height: 32, background: "var(--c-brand)", fontSize: 11, flexShrink: 0 }}
                      >
                        {p.nombre.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: "var(--fs-sm)" }}>{p.nombre}</div>
                        {p.consentimiento_whatsapp && (
                          <span
                            style={{
                              fontSize: 10,
                              background: "var(--c-success-soft)",
                              color: "var(--c-success-fg)",
                              padding: "1px 5px",
                              borderRadius: 99,
                            }}
                          >
                            WA ✓
                          </span>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-muted)" }}>
                      {p.email && <div>{p.email}</div>}
                      {p.telefono && <div>{p.telefono}</div>}
                    </div>
                  </td>
                  <td style={{ fontSize: "var(--fs-sm)" }}>
                    {p.fecha_nacimiento ? `${fmtEdad(p.fecha_nacimiento)} años` : "—"}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)" }}>
                    {p.total_citas}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {p.no_shows_contador > 0 ? (
                      <span
                        className="badge badge-danger"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {p.no_shows_contador}
                      </span>
                    ) : (
                      <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-muted)" }}>
                    {p.ultima_cita ? fmtDate(p.ultima_cita) : "—"}
                  </td>
                  <td>
                    <Link href={`/panel/pacientes/${p.id}`} className="btn btn-ghost btn-sm">
                      Ver perfil
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
