"use client"

import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Building2, Clock, Pill, MessageSquare, Video, Download, FileText } from "lucide-react"
import type { Consultorio, Servicio, Horario, ConfiguracionMensajes } from "@/types/database"
import { fmtMxn } from "@/lib/utils"
import { getZoomAuthUrl } from "@/lib/zoom"

const SECCIONES = [
  { id: "consultorio", label: "Consultorio", icon: Building2 },
  { id: "horarios", label: "Horarios", icon: Clock },
  { id: "servicios", label: "Servicios", icon: Pill },
  { id: "mensajes", label: "Mensajes & recordatorios", icon: MessageSquare },
  { id: "zoom", label: "Integración Zoom", icon: Video },
  { id: "exportar", label: "Exportar datos", icon: Download },
  { id: "legal", label: "Documentos legales", icon: FileText },
]

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const DIAS_MAP = [1, 2, 3, 4, 5, 6, 0]

interface Props {
  consultorio: Consultorio
  servicios: Servicio[]
  horarios: Horario[]
  configMsg: ConfiguracionMensajes | null
}

export function SettingsClient({ consultorio, servicios, horarios, configMsg }: Props) {
  const [seccion, setSeccion] = useState("consultorio")
  const [form, setForm] = useState({
    nombre: consultorio.nombre,
    medico_nombre: consultorio.medico_nombre,
    especialidad: consultorio.especialidad,
    telefono: consultorio.telefono ?? "",
    email: consultorio.email,
    direccion: consultorio.direccion ?? "",
    ciudad: consultorio.ciudad ?? "",
    codigo_postal: consultorio.codigo_postal ?? "",
  })

  async function guardarConsultorio() {
    const supabase = createClient()
    const { error } = await supabase
      .from("consultorios")
      .update(form)
      .eq("id", consultorio.id)
    if (error) toast.error("Error al guardar")
    else toast.success("Cambios guardados")
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, alignItems: "start" }}>
      {/* Sidebar nav */}
      <div className="card" style={{ padding: "8px 0" }}>
        <nav>
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              className={`nav-item ${seccion === s.id ? "active" : ""}`}
              onClick={() => setSeccion(s.id)}
              style={{ width: "calc(100% - 16px)", borderRadius: "var(--r-sm)", margin: "1px 8px" }}
            >
              <s.icon size={15} />
              <span>{s.label}</span>
            </button>
          ))}
          <hr className="hr" style={{ margin: "8px 16px" }} />
          <a href="/planes" className="nav-item" style={{ margin: "1px 8px", width: "calc(100% - 16px)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <span>Plan y suscripción</span>
            </span>
          </a>
        </nav>
      </div>

      {/* Contenido */}
      <div className="stack">
        {/* Consultorio */}
        {seccion === "consultorio" && (
          <>
            <div className="card">
              <div className="card__head">
                <div>
                  <div className="card__title">Información del consultorio</div>
                  <div className="card__sub">Aparece en recetas, recordatorios y la página pública.</div>
                </div>
              </div>
              <div className="grid-2">
                {[
                  { key: "nombre", label: "Nombre del consultorio", required: true },
                  { key: "medico_nombre", label: "Nombre del médico responsable", required: true },
                  { key: "especialidad", label: "Especialidad" },
                  { key: "telefono", label: "Teléfono" },
                  { key: "email", label: "Email del consultorio" },
                  { key: "ciudad", label: "Ciudad / Estado" },
                  { key: "codigo_postal", label: "Código postal" },
                ].map(({ key, label, required }) => (
                  <div key={key} className="field">
                    <label className="field__label">{label}{required && " *"}</label>
                    <input
                      className="input"
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="field" style={{ gridColumn: "1/-1" }}>
                  <label className="field__label">Dirección</label>
                  <input
                    className="input"
                    value={form.direccion}
                    onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                  />
                </div>
                {/* Cédula profesional comentada hasta deploy final */}
                {/* <div className="field">
                  <label className="field__label">Cédula profesional</label>
                  <input className="input" defaultValue={consultorio.cedula_profesional ?? ""} />
                </div> */}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setForm({
                nombre: consultorio.nombre,
                medico_nombre: consultorio.medico_nombre,
                especialidad: consultorio.especialidad,
                telefono: consultorio.telefono ?? "",
                email: consultorio.email,
                direccion: consultorio.direccion ?? "",
                ciudad: consultorio.ciudad ?? "",
                codigo_postal: consultorio.codigo_postal ?? "",
              })}>Descartar</button>
              <button className="btn btn-primary" onClick={guardarConsultorio}>Guardar cambios</button>
            </div>
          </>
        )}

        {/* Horarios */}
        {seccion === "horarios" && (
          <div className="card">
            <div className="card__head">
              <div>
                <div className="card__title">Horarios de atención</div>
                <div className="card__sub">Define cuándo aceptas citas. Aplica a la página pública.</div>
              </div>
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {DIAS.map((dia, i) => {
                const h = horarios.find((x) => x.dia_semana === DIAS_MAP[i])
                return (
                  <li
                    key={dia}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "10px 0",
                      borderBottom: i < 6 ? "1px solid var(--c-border-faint)" : "none",
                      opacity: h?.activo === false ? 0.5 : 1,
                    }}
                  >
                    <span style={{ width: 40, fontSize: "var(--fs-sm)", fontWeight: 500 }}>{dia}</span>
                    <span className="mono muted" style={{ fontSize: "var(--fs-sm)", flex: 1 }}>
                      {h?.activo === false
                        ? "Cerrado"
                        : h
                        ? `${h.inicio_1 ?? "—"} — ${h.fin_1 ?? "—"}${h.inicio_2 ? ` · ${h.inicio_2} — ${h.fin_2}` : ""}`
                        : "—"}
                    </span>
                    <button className={`toggle ${h?.activo !== false ? "on" : ""}`}>
                      <div className="toggle__thumb" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Servicios */}
        {seccion === "servicios" && (
          <div className="card">
            <div className="card__head">
              <div className="card__title">Servicios y duraciones</div>
              <button className="btn btn-secondary btn-sm">+ Nuevo servicio</button>
            </div>
            <ul>
              {servicios.map((s, i) => (
                <li
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: i < servicios.length - 1 ? "1px solid var(--c-border-faint)" : "none",
                  }}
                >
                  <span style={{ flex: 1, fontSize: "var(--fs-sm)", fontWeight: 500 }}>{s.nombre}</span>
                  <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>{s.duracion_min} min</span>
                  <span className="mono" style={{ fontSize: "var(--fs-sm)" }}>{fmtMxn(s.precio_mxn)}</span>
                  <button className={`toggle ${s.activo ? "on" : ""}`}><div className="toggle__thumb" /></button>
                  <button className="iconbtn">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mensajes */}
        {seccion === "mensajes" && (
          <>
            <div className="card">
              <div className="card__head">
                <div>
                  <div className="card__title">Recordatorios automáticos</div>
                  <div className="card__sub">WhatsApp y/o email — ajusta tiempos y plantillas.</div>
                </div>
              </div>
              <ul>
                {[
                  { key: "recordatorio_24h", label: "Recordatorio 24h antes", desc: "WhatsApp · plantilla \"rec_24h_es\"" },
                  { key: "recordatorio_2h", label: "Recordatorio 2h antes", desc: "WhatsApp · permite cancelar" },
                  { key: "cumpleanos", label: "Felicitación de cumpleaños", desc: "Enviar el día — 9:00 hrs" },
                  { key: "encuesta_post_consulta", label: "Encuesta post-consulta", desc: "Email · 1 hora después" },
                ].map((item, i, arr) => (
                  <li
                    key={item.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid var(--c-border-faint)" : "none",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "var(--fs-sm)" }}>{item.label}</div>
                      <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>{item.desc}</div>
                    </div>
                    <button
                      className={`toggle ${configMsg?.[item.key as keyof ConfiguracionMensajes] !== false ? "on" : ""}`}
                    >
                      <div className="toggle__thumb" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <div className="card__head"><div className="card__title">Ventana de cancelación</div></div>
              <div className="field">
                <label className="field__label">Tiempo mínimo antes de la cita para cancelar</label>
                <span className="field__hint">Pasado este plazo, el paciente deberá llamar al consultorio.</span>
                <select className="select">
                  {[3, 6, 12, 24].map((h) => (
                    <option key={h} value={h} selected={configMsg?.ventana_cancelacion_horas === h}>{h} horas</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Zoom */}
        {seccion === "zoom" && (
          <div className="card">
            <div className="card__head">
              <div>
                <div className="card__title">Integración con Zoom</div>
                <div className="card__sub">Genera links automáticos para tus teleconsultas.</div>
              </div>
            </div>
            {consultorio.zoom_account_email ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
                  <div style={{ width: 36, height: 36, background: "var(--c-success-soft)", borderRadius: "var(--r-sm)", display: "grid", placeItems: "center" }}>
                    <Video size={18} style={{ color: "var(--c-success)" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>Conectado · {consultorio.zoom_account_email}</div>
                    <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>Zoom integrado</div>
                  </div>
                  <span className="badge badge-success" style={{ marginLeft: "auto" }}>Activo</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="btn btn-ghost">Desconectar</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 24px" }}>
                <Video size={32} style={{ margin: "0 auto 12px", color: "var(--c-text-faint)" }} />
                <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 16 }}>
                  Conecta tu cuenta de Zoom para generar links automáticamente al agendar teleconsultas.
                </p>
                <a href="/api/zoom/auth" className="btn btn-primary">
                  Conectar con Zoom
                </a>
              </div>
            )}
          </div>
        )}

        {/* Exportar */}
        {seccion === "exportar" && (
          <div className="card">
            <div className="card__head">
              <div>
                <div className="card__title">Exportar datos</div>
                <div className="card__sub">Descarga toda tu información en formato CSV o JSON.</div>
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label className="field__label">¿Qué exportar?</label>
                <select className="select">
                  <option>Todo (pacientes, citas, recetas)</option>
                  <option>Solo pacientes</option>
                  <option>Solo citas</option>
                  <option>Solo recetas</option>
                </select>
              </div>
              <div className="field">
                <label className="field__label">Formato</label>
                <select className="select">
                  <option>CSV (.zip)</option>
                  <option>JSON</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => toast.info("Exportación iniciada", { description: "Recibirás un correo cuando esté listo (~5 min)" })}>
                <Download size={14} /> Generar exportación
              </button>
              <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>Recibirás un correo cuando esté listo (~5 min)</span>
            </div>
          </div>
        )}

        {/* Legal */}
        {seccion === "legal" && (
          <div className="card">
            <div className="card__head">
              <div>
                <div className="card__title">Documentos legales</div>
                <div className="card__sub">Personaliza los textos que firman tus pacientes.</div>
              </div>
            </div>
            <ul>
              {[
                { label: "Aviso de privacidad", sub: "Actualizado 12 ene 2024", accion: "Editar" },
                { label: "Consentimiento informado", sub: "Plantilla estándar", accion: "Editar" },
                { label: "Términos y condiciones", sub: "Provisto por AgendaMed", accion: "Ver" },
              ].map((doc, i, arr) => (
                <li
                  key={doc.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--c-border-faint)" : "none",
                  }}
                >
                  <FileText size={15} style={{ color: "var(--c-text-faint)", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: "var(--fs-sm)" }}>{doc.label}</div>
                    <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>{doc.sub}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm">{doc.accion}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
