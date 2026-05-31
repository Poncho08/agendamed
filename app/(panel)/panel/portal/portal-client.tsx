"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Copy, Check, ExternalLink, MessageCircle, Share2, QrCode } from "lucide-react"

interface Props {
  bookingUrl: string | null
  consultorio: {
    nombre: string
    medico_nombre: string
    especialidad: string
    slug: string | null
    direccion: string | null
    ciudad: string | null
    telefono: string | null
  }
}

export function PortalClient({ bookingUrl, consultorio }: Props) {
  const [copied, setCopied] = useState(false)

  function copiarUrl() {
    if (!bookingUrl) return
    navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    toast.success("Enlace copiado")
    setTimeout(() => setCopied(false), 2500)
  }

  function compartirWhatsApp() {
    if (!bookingUrl) return
    const msg = encodeURIComponent(
      `Hola, puedes agendar tu cita con ${consultorio.medico_nombre} directamente desde aquí:\n\n${bookingUrl}`
    )
    window.open(`https://wa.me/?text=${msg}`, "_blank")
  }

  if (!bookingUrl) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
        <Share2 size={32} style={{ margin: "0 auto 12px", color: "var(--c-text-faint)" }} />
        <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: 600, marginBottom: 8 }}>
          Configura tu URL pública
        </h2>
        <p className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 20 }}>
          Tu consultorio aún no tiene un slug asignado. Ve a Configuración para completar tu perfil.
        </p>
        <a href="/panel/configuracion" className="btn btn-primary">Ir a Configuración</a>
      </div>
    )
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookingUrl)}`

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16, alignItems: "start" }}>
      {/* Columna principal */}
      <div className="stack">
        {/* URL card */}
        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title">Tu enlace de agendado</div>
              <div className="card__sub">Comparte este link por WhatsApp, Instagram, tarjeta de presentación o donde quieras.</div>
            </div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--c-brand-soft)",
            border: "1px solid var(--c-brand-border)",
            borderRadius: "var(--r-md)",
            padding: "12px 14px",
            marginBottom: 16,
          }}>
            <span style={{
              flex: 1,
              fontFamily: "var(--font-mono)",
              fontSize: "var(--fs-sm)",
              color: "var(--c-brand-fg)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {bookingUrl}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={copiarUrl} style={{ flexShrink: 0 }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={compartirWhatsApp}>
              <MessageCircle size={14} /> Compartir por WhatsApp
            </button>
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <ExternalLink size={14} /> Ver página
            </a>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="card">
          <div className="card__title" style={{ marginBottom: 16 }}>¿Cómo usar este enlace?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { n: "1", titulo: "WhatsApp personal o de consultorio", desc: "Pega el link en tu estado de WhatsApp o envíalo directamente a los pacientes que quieren agendar." },
              { n: "2", titulo: "Instagram o redes sociales", desc: 'Agrega el link en tu bio de Instagram con el texto "Agenda tu cita aquí".' },
              { n: "3", titulo: "Tarjeta de presentación digital", desc: "Imprime el código QR (a la derecha) en tu tarjeta física o compártelo digitalmente." },
              { n: "4", titulo: "Firma de correo", desc: 'Agrega el link al pie de tus emails con el texto "Agenda en línea".' },
            ].map((item) => (
              <div key={item.n} style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 24, height: 24, background: "var(--c-brand)", borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0, marginTop: 1 }}>
                  {item.n}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "var(--fs-sm)", marginBottom: 2 }}>{item.titulo}</div>
                  <div className="muted" style={{ fontSize: "var(--fs-xs)", lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR + preview */}
      <div className="stack">
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <QrCode size={15} style={{ color: "var(--c-text-muted)" }} />
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Código QR</span>
          </div>
          <div style={{ border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", padding: 12, display: "inline-block", margin: "0 auto" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR Code para agendar cita" width={176} height={176} style={{ display: "block" }} />
          </div>
          <p className="muted" style={{ fontSize: "var(--fs-xs)", lineHeight: 1.5, marginTop: 12 }}>
            Tus pacientes pueden escanearlo con la cámara de su celular.
          </p>
          <a href={qrUrl} download={`qr-${consultorio.slug ?? "agendamed"}.png`} className="btn btn-ghost btn-sm btn-full" target="_blank" rel="noopener noreferrer" style={{ marginTop: 8 }}>
            Descargar QR
          </a>
        </div>

        <div className="card" style={{ background: "var(--c-surface-2)" }}>
          <div className="muted" style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Vista previa
          </div>
          <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{consultorio.medico_nombre}</div>
          <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 2 }}>{consultorio.especialidad}</div>
          {consultorio.ciudad && <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 4 }}>📍 {consultorio.ciudad}</div>}
          {consultorio.telefono && <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 4 }}>📞 {consultorio.telefono}</div>}
        </div>
      </div>
    </div>
  )
}
