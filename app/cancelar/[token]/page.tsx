import { createServiceClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CancelarBtn } from "./cancelar-btn"

interface Props { params: { token: string } }

export default async function CancelarPage({ params }: Props) {
  const supabase = createServiceClient()

  const { data: cita } = await supabase
    .from("citas")
    .select("*, paciente:pacientes(nombre), servicio:servicios(nombre), consultorio:consultorios(nombre, medico_nombre)")
    .eq("cancelacion_token", params.token)
    .neq("estado", "cancelada")
    .neq("estado", "completada")
    .single()

  if (!cita) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontSize: "var(--fs-xl)", marginBottom: 8 }}>Esta cita ya no está disponible</h1>
          <p className="muted" style={{ fontSize: "var(--fs-sm)" }}>
            Puede que ya haya sido cancelada o completada.
          </p>
        </div>
      </div>
    )
  }

  const pac = cita.paciente as { nombre: string } | null
  const svc = cita.servicio as { nombre: string } | null
  const cons = cita.consultorio as { nombre: string; medico_nombre: string } | null
  const inicio = new Date(cita.inicio)

  // Verificar ventana de cancelación (3h mínimo)
  const diffHoras = (inicio.getTime() - Date.now()) / (1000 * 60 * 60)
  const puedeCangelar = diffHoras >= 3

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--c-bg)", padding: 24 }}>
      <div className="card" style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>📅</div>
        <h1 style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-semibold)", marginBottom: 8 }}>
          Cancelar cita
        </h1>
        <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 24 }}>
          Estás a punto de cancelar la siguiente cita:
        </p>

        <div
          style={{
            background: "var(--c-surface-2)",
            borderRadius: "var(--r-md)",
            padding: "16px",
            textAlign: "left",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "var(--fs-sm)" }}>
            <div><strong>Paciente:</strong> {pac?.nombre}</div>
            <div><strong>Médico:</strong> {cons?.medico_nombre}</div>
            <div><strong>Servicio:</strong> {svc?.nombre ?? "Consulta"}</div>
            <div>
              <strong>Fecha:</strong>{" "}
              <span style={{ textTransform: "capitalize" }}>
                {format(inicio, "EEEE d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
              </span>
            </div>
          </div>
        </div>

        {puedeCangelar ? (
          <CancelarBtn token={params.token} citaId={cita.id} />
        ) : (
          <div>
            <div
              style={{
                background: "var(--c-danger-soft)",
                border: "1px solid oklch(0.82 0.08 25)",
                borderRadius: "var(--r-md)",
                padding: "12px 16px",
                marginBottom: 16,
                fontSize: "var(--fs-sm)",
                color: "var(--c-danger-fg)",
              }}
            >
              Ya no es posible cancelar en línea. La cita empieza en menos de 3 horas.
              Para cancelar, comunícate directamente con el consultorio.
            </div>
            <p className="muted" style={{ fontSize: "var(--fs-xs)" }}>
              {cons?.nombre}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
