"use client"

import { useState, useRef, useEffect } from "react"
import { buscarCIE10, type CodigoCIE10 } from "@/lib/cie10"

interface Props {
  value: string
  onChange: (valor: string) => void
  placeholder?: string
}

export function Cie10Input({ value, onChange, placeholder = "Ej: Hipertensión esencial, J00, diabetes…" }: Props) {
  const [sugerencias, setSugerencias] = useState<CodigoCIE10[]>([])
  const [abierto, setAbierto] = useState(false)
  const [idx, setIdx] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)
    const resultados = buscarCIE10(val)
    setSugerencias(resultados)
    setAbierto(resultados.length > 0)
    setIdx(-1)
  }

  function seleccionar(item: CodigoCIE10) {
    onChange(`${item.descripcion} (${item.codigo})`)
    setSugerencias([])
    setAbierto(false)
    setIdx(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!abierto) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setIdx((i) => Math.min(i + 1, sugerencias.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && idx >= 0) {
      e.preventDefault()
      seleccionar(sugerencias[idx])
    } else if (e.key === "Escape") {
      setAbierto(false)
    }
  }

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        className="input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (sugerencias.length > 0) setAbierto(true)
        }}
        placeholder={placeholder}
        autoComplete="off"
      />
      {abierto && sugerencias.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--r-md)",
            boxShadow: "var(--sh-md)",
            zIndex: 50,
            overflow: "hidden",
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {sugerencias.map((item, i) => (
            <li key={item.codigo}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  seleccionar(item)
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  textAlign: "left",
                  background: i === idx ? "var(--c-brand-soft)" : "transparent",
                  borderBottom: i < sugerencias.length - 1 ? "1px solid var(--c-border-faint)" : "none",
                  transition: "background var(--t-fast)",
                }}
                onMouseEnter={() => setIdx(i)}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: "var(--fs-xs)",
                    color: "var(--c-brand-fg)",
                    background: "var(--c-brand-soft)",
                    padding: "1px 5px",
                    borderRadius: "var(--r-sm)",
                    flexShrink: 0,
                  }}
                >
                  {item.codigo}
                </span>
                <span style={{ fontSize: "var(--fs-sm)" }}>{item.descripcion}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
