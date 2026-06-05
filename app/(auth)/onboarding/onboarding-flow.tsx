"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Check, ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react"
import { fmtMxn } from "@/lib/utils"

const PASOS = [
  { n: 1, label: "Datos del consultorio" },
  { n: 2, label: "Horarios de atención" },
  { n: 3, label: "Catálogo de servicios" },
  { n: 4, label: "Mensajes y recordatorios" },
  { n: 5, label: "Página pública" },
  { n: 6, label: "Importar pacientes" },
]

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

interface Servicio {
  id: number
  nombre: string
  duracion: number
  precio: number
}

export function OnboardingFlow() {
  const router = useRouter()
  const [paso, setPaso] = useState(1)

  // Paso 1: datos del consultorio
  const [datos, setDatos] = useState({
    telefono: "",
    ciudad: "",
    direccion: "",
    codigo_postal: "",
  })

  // Paso 2: horarios
  const [horarios, setHorarios] = useState(
    DIAS.map((dia, i) => ({
      dia,
      activo: i < 5,
      inicio1: "08:00",
      fin1: "14:00",
      inicio2: i < 5 ? "15:00" : "",
      fin2: i < 5 ? "19:00" : "",
    }))
  )

  // Paso 3: servicios
  const [servicios, setServicios] = useState<Servicio[]>([
    { id: 1, nombre: "Consulta general", duracion: 30, precio: 500 },
    { id: 2, nombre: "Primera vez", duracion: 60, precio: 800 },
  ])
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevaDuracion, setNuevaDuracion] = useState(30)
  const [nuevoPrecio, setNuevoPrecio] = useState("")

  function agregarServicio() {
    if (!nuevoNombre || !nuevoPrecio) return
    setServicios((s) => [
      ...s,
      { id: Date.now(), nombre: nuevoNombre, duracion: nuevaDuracion, precio: +nuevoPrecio },
    ])
    setNuevoNombre("")
    setNuevoPrecio("")
  }

  async function finalizarOnboarding() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: consultorio } = await supabase
      .from("consultorios")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!consultorio) return
    const consultorioId = (consultorio as unknown as { id: string }).id

    // Guardar datos del consultorio del paso 1
    const datosActualizados: Record<string, string> = {}
    if (datos.telefono) datosActualizados.telefono = datos.telefono
    if (datos.ciudad) datosActualizados.ciudad = datos.ciudad
    if (datos.direccion) datosActualizados.direccion = datos.direccion
    if (datos.codigo_postal) datosActualizados.codigo_postal = datos.codigo_postal
    if (Object.keys(datosActualizados).length > 0) {
      await supabase.from("consultorios").update(datosActualizados).eq("id", consultorioId)
    }

    // Guardar servicios
    if (servicios.length > 0) {
      const svcData = servicios.map((s, i) => ({
        consultorio_id: consultorioId,
        nombre: s.nombre,
        duracion_min: s.duracion,
        precio_mxn: s.precio,
        orden: i,
      }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("servicios") as any).insert(svcData)
    }

    // Guardar horarios (dia_semana: 1=Lun, 6=Sáb, 0=Dom)
    const diasMap = [1, 2, 3, 4, 5, 6, 0]
    const horarioData = horarios.map((h, i) => ({
      consultorio_id: consultorioId,
      dia_semana: diasMap[i],
      activo: h.activo,
      inicio_1: h.activo ? h.inicio1 : null,
      fin_1: h.activo ? h.fin1 : null,
      inicio_2: h.inicio2 || null,
      fin_2: h.fin2 || null,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("horarios") as any).insert(horarioData)

    toast.success("¡Listo! Tu consultorio está configurado.")
    router.push("/panel")
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          height: 64,
          background: "var(--c-surface)",
          borderBottom: "1px solid var(--c-border)",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "var(--c-brand)", borderRadius: 6, display: "grid", placeItems: "center", color: "white", fontSize: 12, fontWeight: 700 }}>
            AM
          </div>
          <span style={{ fontWeight: 600 }}>AgendaMed</span>
        </div>

        {/* Progress steps */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, flex: 1, justifyContent: "center" }}>
          {PASOS.map((p, i) => (
            <div key={p.n} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  borderRadius: 20,
                  background: p.n === paso ? "var(--c-brand-soft)" : "transparent",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    background: p.n < paso ? "var(--c-success)" : p.n === paso ? "var(--c-brand)" : "var(--c-border)",
                    color: p.n <= paso ? "white" : "var(--c-text-faint)",
                  }}
                >
                  {p.n < paso ? <Check size={10} /> : p.n}
                </div>
                <span
                  style={{
                    fontSize: "var(--fs-xs)",
                    fontWeight: p.n === paso ? 600 : 400,
                    color: p.n === paso ? "var(--c-brand-fg)" : "var(--c-text-faint)",
                    display: "none", // hidden on mobile
                  }}
                  className="onb-label"
                >
                  {p.label}
                </span>
              </div>
              {i < PASOS.length - 1 && (
                <div
                  style={{
                    width: 24,
                    height: 2,
                    background: p.n < paso ? "var(--c-success)" : "var(--c-border)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <button
          className="link"
          style={{ fontSize: "var(--fs-sm)", whiteSpace: "nowrap" }}
          onClick={() => router.push("/panel")}
        >
          Continuar después →
        </button>
      </header>

      {/* Body */}
      <main className="col-split" style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 340px", gap: 0, maxWidth: 1000, margin: "0 auto", padding: "40px 24px", width: "100%" }}>
        <div style={{ paddingRight: 40 }}>
          <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--c-text-faint)" }}>
            Paso {paso} de {PASOS.length}
          </span>

          {/* PASO 1: Datos */}
          {paso === 1 && (
            <>
              <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-semibold)", marginTop: 8, marginBottom: 24 }}>
                Datos de tu consultorio
              </h1>
              <div className="card">
                <div className="grid-2">
                  <div className="field">
                    <label className="field__label">Teléfono de contacto</label>
                    <input
                      className="input"
                      placeholder="33 1234 5678"
                      value={datos.telefono}
                      onChange={(e) => setDatos((d) => ({ ...d, telefono: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label className="field__label">Ciudad / Estado</label>
                    <input
                      className="input"
                      placeholder="Guadalajara, Jalisco"
                      value={datos.ciudad}
                      onChange={(e) => setDatos((d) => ({ ...d, ciudad: e.target.value }))}
                    />
                  </div>
                  <div className="field" style={{ gridColumn: "1/-1" }}>
                    <label className="field__label">Dirección del consultorio</label>
                    <input
                      className="input"
                      placeholder="Av. Vallarta 1234, Col. Américas"
                      value={datos.direccion}
                      onChange={(e) => setDatos((d) => ({ ...d, direccion: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label className="field__label">Código postal</label>
                    <input
                      className="input"
                      placeholder="44160"
                      value={datos.codigo_postal}
                      onChange={(e) => setDatos((d) => ({ ...d, codigo_postal: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PASO 2: Horarios */}
          {paso === 2 && (
            <>
              <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-semibold)", marginTop: 8, marginBottom: 24 }}>
                Horarios de atención
              </h1>
              <div className="card">
                <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 16 }}>
                  Define cuándo aceptas citas. Aplica a la página pública y al booking de pacientes.
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {horarios.map((h, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: h.activo ? 1 : 0.45 }}>
                      <span style={{ width: 32, fontSize: "var(--fs-sm)", fontWeight: 500, flexShrink: 0 }}>{h.dia}</span>
                      {h.activo ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, flexWrap: "wrap" }}>
                          <input
                            type="time"
                            className="input"
                            style={{ width: 90, fontSize: "var(--fs-xs)", padding: "4px 8px" }}
                            value={h.inicio1}
                            onChange={(e) => setHorarios((prev) => prev.map((x, j) => j === i ? { ...x, inicio1: e.target.value } : x))}
                          />
                          <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>—</span>
                          <input
                            type="time"
                            className="input"
                            style={{ width: 90, fontSize: "var(--fs-xs)", padding: "4px 8px" }}
                            value={h.fin1}
                            onChange={(e) => setHorarios((prev) => prev.map((x, j) => j === i ? { ...x, fin1: e.target.value } : x))}
                          />
                          {h.inicio2 && (
                            <>
                              <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>·</span>
                              <input
                                type="time"
                                className="input"
                                style={{ width: 90, fontSize: "var(--fs-xs)", padding: "4px 8px" }}
                                value={h.inicio2}
                                onChange={(e) => setHorarios((prev) => prev.map((x, j) => j === i ? { ...x, inicio2: e.target.value } : x))}
                              />
                              <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>—</span>
                              <input
                                type="time"
                                className="input"
                                style={{ width: 90, fontSize: "var(--fs-xs)", padding: "4px 8px" }}
                                value={h.fin2}
                                onChange={(e) => setHorarios((prev) => prev.map((x, j) => j === i ? { ...x, fin2: e.target.value } : x))}
                              />
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="muted" style={{ fontSize: "var(--fs-sm)", flex: 1 }}>Cerrado</span>
                      )}
                      <button
                        className={`toggle ${h.activo ? "on" : ""}`}
                        onClick={() => setHorarios((prev) => prev.map((x, j) => j === i ? { ...x, activo: !x.activo } : x))}
                      >
                        <div className="toggle__thumb" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* PASO 3: Servicios */}
          {paso === 3 && (
            <>
              <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-semibold)", marginTop: 8, marginBottom: 8 }}>
                ¿Qué servicios ofreces?
              </h1>
              <p className="muted" style={{ fontSize: "var(--fs-md)", marginBottom: 24 }}>
                Define tu catálogo. Tus pacientes elegirán uno al agendar.
              </p>

              <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, marginBottom: 12 }}>Agregar un servicio</div>
                <div className="col-formrow" style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px auto", gap: 10, alignItems: "end" }}>
                  <div className="field">
                    <label className="field__label">Nombre</label>
                    <input
                      className="input"
                      placeholder="Ej: Consulta general"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label className="field__label">Duración</label>
                    <select
                      className="select"
                      value={nuevaDuracion}
                      onChange={(e) => setNuevaDuracion(+e.target.value)}
                    >
                      {[15, 20, 30, 45, 60, 90].map((m) => (
                        <option key={m} value={m}>{m} min</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field__label">Precio MXN</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="500"
                      value={nuevoPrecio}
                      onChange={(e) => setNuevoPrecio(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={agregarServicio}
                    disabled={!nuevoNombre || !nuevoPrecio}
                  >
                    <Plus size={14} /> Agregar
                  </button>
                </div>
              </div>

              {servicios.length > 0 && (
                <div className="card" style={{ padding: 0 }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--c-border-faint)", fontSize: "var(--fs-sm)", fontWeight: 600 }}>
                    Tus servicios ({servicios.length})
                  </div>
                  <ul>
                    {servicios.map((s, i) => (
                      <li
                        key={s.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 16px",
                          borderBottom: i < servicios.length - 1 ? "1px solid var(--c-border-faint)" : "none",
                        }}
                      >
                        <span className="mono muted" style={{ fontSize: "var(--fs-xs)", width: 24 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ flex: 1, fontSize: "var(--fs-sm)", fontWeight: 500 }}>{s.nombre}</span>
                        <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>{s.duracion} min</span>
                        <span className="mono" style={{ fontSize: "var(--fs-sm)" }}>{fmtMxn(s.precio)}</span>
                        <button
                          className="iconbtn"
                          onClick={() => setServicios((arr) => arr.filter((x) => x.id !== s.id))}
                        >
                          <Trash2 size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* PASOS 4-6: simplificados */}
          {paso === 4 && (
            <>
              <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-semibold)", marginTop: 8, marginBottom: 24 }}>
                Mensajes y recordatorios
              </h1>
              <div className="card">
                <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 16 }}>
                  Configurarás los detalles desde Configuración una vez dentro del panel. Por ahora activamos los recordatorios predeterminados.
                </p>
                {[
                  { label: "Recordatorio el día anterior", desc: "Email · cada mañana a las 8:00", on: true },
                  { label: "Felicitación de cumpleaños", desc: "Email · el día del cumpleaños", on: true },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--c-border-faint)" }}>
                    <div>
                      <div style={{ fontSize: "var(--fs-sm)", fontWeight: 500 }}>{item.label}</div>
                      <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>{item.desc}</div>
                    </div>
                    <div className={`toggle ${item.on ? "on" : ""}`} style={{ pointerEvents: "none" }}>
                      <div className="toggle__thumb" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {paso === 5 && (
            <>
              <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-semibold)", marginTop: 8, marginBottom: 24 }}>
                Página pública para agendar
              </h1>
              <div className="card">
                <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 16 }}>
                  Tus pacientes podrán agendar citas en:
                </p>
                <div
                  style={{
                    background: "var(--c-brand-soft)",
                    border: "1px solid var(--c-brand-border)",
                    borderRadius: "var(--r-md)",
                    padding: "12px 16px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--fs-sm)",
                    color: "var(--c-brand-fg)",
                    marginBottom: 16,
                  }}
                >
                  agendamed.mx/agendar/<strong>tu-consultorio</strong>
                </div>
                <p className="muted" style={{ fontSize: "var(--fs-xs)" }}>
                  Personalizarás tu URL y apariencia desde Configuración → Página pública.
                </p>
              </div>
            </>
          )}

          {paso === 6 && (
            <>
              <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-semibold)", marginTop: 8, marginBottom: 24 }}>
                Importar pacientes existentes
              </h1>
              <div className="card">
                <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 20 }}>
                  Si tienes una lista de pacientes, puedes importarla en formato CSV. También puedes hacerlo después desde el módulo de Pacientes.
                </p>
                <div
                  style={{
                    border: "2px dashed var(--c-border-strong)",
                    borderRadius: "var(--r-lg)",
                    padding: "40px 24px",
                    textAlign: "center",
                    color: "var(--c-text-faint)",
                    fontSize: "var(--fs-sm)",
                  }}
                >
                  <div style={{ marginBottom: 12 }}>📂</div>
                  <div>Arrastra tu CSV aquí o <span className="link" style={{ cursor: "pointer" }}>selecciona un archivo</span></div>
                  <div style={{ fontSize: "var(--fs-xs)", marginTop: 8 }}>Columnas: nombre, email, teléfono, fecha_nacimiento</div>
                </div>
              </div>
            </>
          )}

          {/* Nav buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
            <button
              className="btn btn-ghost"
              onClick={() => setPaso((p) => p - 1)}
              disabled={paso === 1}
            >
              <ArrowLeft size={14} /> Anterior
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  toast.info("Paso omitido", { description: "Podrás configurarlo después." })
                  if (paso < PASOS.length) setPaso((p) => p + 1)
                  else finalizarOnboarding()
                }}
              >
                Saltar este paso
              </button>
              {paso < PASOS.length ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setPaso((p) => p + 1)}
                >
                  Siguiente <ArrowRight size={14} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={finalizarOnboarding}>
                  Ir al panel <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Aside */}
        <aside style={{ paddingLeft: 0 }}>
          <div
            className="card"
            style={{ background: "var(--c-surface-2)", border: "1px solid var(--c-border-faint)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
              <div style={{ color: "var(--c-brand)", marginTop: 2, flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", marginBottom: 4 }}>
                  {paso === 3 ? "¿No sabes qué incluir?" : "Consejo"}
                </div>
                <p className="muted" style={{ fontSize: "var(--fs-xs)", lineHeight: 1.6 }}>
                  {paso === 1 && "Completa tu dirección para que aparezca en tus recetas y la página pública de booking."}
                  {paso === 2 && "Puedes definir dos turnos por día. La mayoría de consultorios tienen turno mañana y tarde con un descanso de 1 hora."}
                  {paso === 3 && "La mayoría de consultorios empiezan con 3-4 servicios: una consulta inicial más larga, una de seguimiento y opcionalmente una teleconsulta."}
                  {paso === 4 && "Los recordatorios automáticos reducen las inasistencias hasta un 35%. Te recomendamos dejarlos activados."}
                  {paso === 5 && "La página pública es gratuita en todos los planes. Comparte el link en tu WhatsApp o redes sociales."}
                  {paso === 6 && "Puedes agregar pacientes manualmente uno a uno desde el módulo de Pacientes. La importación masiva facilita la migración desde otra herramienta."}
                </p>
              </div>
            </div>

            {paso === 3 && servicios.length > 0 && (
              <div>
                <div className="muted" style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Vista previa — así lo verán tus pacientes:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {servicios.map((s) => (
                    <div
                      key={s.id}
                      className="card"
                      style={{ padding: "10px 12px", marginTop: 0 }}
                    >
                      <div style={{ fontWeight: 500, fontSize: "var(--fs-sm)" }}>{s.nombre}</div>
                      <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 2 }}>
                        {s.duracion} min · {fmtMxn(s.precio)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}
