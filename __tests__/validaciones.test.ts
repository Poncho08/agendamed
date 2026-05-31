/**
 * Pruebas de validación de formularios críticos y lógica de negocio.
 * Ejecutar con: npx vitest run
 */
import { describe, it, expect } from "vitest"
import { z } from "zod"

// ─────────────────────────────────────────────
// Schemas duplicados de los formularios reales
// ─────────────────────────────────────────────

const schemaRegistro = z
  .object({
    nombreConsultorio: z.string().min(2, "Mínimo 2 caracteres"),
    medicoNombre: z.string().min(2, "Mínimo 2 caracteres"),
    especialidad: z.string().min(1, "Selecciona una especialidad"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
    tyc: z.boolean().refine((v) => v, "Debes aceptar los términos"),
    privacidad: z.boolean().refine((v) => v, "Debes aceptar el aviso de privacidad"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

const schemaBookingPublico = z.object({
  consultorio_id: z.string().uuid(),
  servicio_id: z.string().uuid(),
  inicio: z.string(),
  fin: z.string(),
  duracion_min: z.number(),
  paciente: z.object({
    nombre: z.string().min(2),
    telefono: z.string().min(8),
    email: z.string().email().optional().nullable(),
    consentimiento_privacidad: z.boolean(),
    consentimiento_whatsapp: z.boolean(),
  }),
})

const schemaPacientePublico = z.object({
  nombre: z.string().min(2, "Nombre muy corto"),
  telefono: z.string().min(8, "Teléfono inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  consentimiento: z.boolean().refine((v) => v, "Debes aceptar"),
  consentimientoWA: z.boolean(),
})

// ─────────────────────────────────────────────
// Helpers de lógica de negocio
// ─────────────────────────────────────────────

/** Lógica de solapamiento extraída de api/public/booking/route.ts */
function haySolapamiento(
  inicio: string,
  fin: string,
  citasExistentes: Array<{ inicio: string; fin: string }>
): boolean {
  return citasExistentes.some(
    (c) => c.inicio < fin && c.fin > inicio
  )
}

/** Slugify extraído de lib/utils.ts */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// ─────────────────────────────────────────────
// SUITE 1: Validación de registro
// ─────────────────────────────────────────────

describe("Registro — validación de formulario", () => {
  const datosValidos = {
    nombreConsultorio: "Consultorio Dr. García",
    medicoNombre: "Dr. Roberto García",
    especialidad: "Medicina general",
    email: "roberto@consultorio.com",
    password: "MiPassword123",
    confirmPassword: "MiPassword123",
    tyc: true,
    privacidad: true,
  }

  it("acepta datos completamente válidos", () => {
    expect(schemaRegistro.safeParse(datosValidos).success).toBe(true)
  })

  it("rechaza email inválido", () => {
    const r = schemaRegistro.safeParse({ ...datosValidos, email: "no-es-un-email" })
    expect(r.success).toBe(false)
    expect(r.error?.errors[0].message).toBe("Email inválido")
  })

  it("rechaza contraseña menor a 8 caracteres", () => {
    const r = schemaRegistro.safeParse({ ...datosValidos, password: "1234567", confirmPassword: "1234567" })
    expect(r.success).toBe(false)
    expect(r.error?.errors[0].message).toBe("Mínimo 8 caracteres")
  })

  it("rechaza contraseñas que no coinciden", () => {
    const r = schemaRegistro.safeParse({ ...datosValidos, confirmPassword: "OtraPassword123" })
    expect(r.success).toBe(false)
    const msgs = r.error?.errors.map((e) => e.message)
    expect(msgs).toContain("Las contraseñas no coinciden")
  })

  it("rechaza cuando tyc = false", () => {
    const r = schemaRegistro.safeParse({ ...datosValidos, tyc: false })
    expect(r.success).toBe(false)
  })

  it("rechaza cuando privacidad = false", () => {
    const r = schemaRegistro.safeParse({ ...datosValidos, privacidad: false })
    expect(r.success).toBe(false)
  })

  it("rechaza nombre de consultorio con menos de 2 caracteres", () => {
    const r = schemaRegistro.safeParse({ ...datosValidos, nombreConsultorio: "A" })
    expect(r.success).toBe(false)
  })

  it("rechaza médico sin especialidad seleccionada", () => {
    const r = schemaRegistro.safeParse({ ...datosValidos, especialidad: "" })
    expect(r.success).toBe(false)
  })
})

// ─────────────────────────────────────────────
// SUITE 2: Lógica de solapamiento de citas
// ─────────────────────────────────────────────

describe("Solapamiento de citas (double-booking)", () => {
  const citaExistente = { inicio: "2025-06-10T09:00:00.000Z", fin: "2025-06-10T09:30:00.000Z" }

  it("no hay solapamiento si la nueva cita empieza cuando termina la existente", () => {
    expect(haySolapamiento(
      "2025-06-10T09:30:00.000Z",
      "2025-06-10T10:00:00.000Z",
      [citaExistente]
    )).toBe(false)
  })

  it("no hay solapamiento si la nueva cita termina cuando empieza la existente", () => {
    expect(haySolapamiento(
      "2025-06-10T08:00:00.000Z",
      "2025-06-10T09:00:00.000Z",
      [citaExistente]
    )).toBe(false)
  })

  it("detecta solapamiento exacto (mismo inicio y fin)", () => {
    expect(haySolapamiento(
      "2025-06-10T09:00:00.000Z",
      "2025-06-10T09:30:00.000Z",
      [citaExistente]
    )).toBe(true)
  })

  it("detecta solapamiento parcial al inicio", () => {
    expect(haySolapamiento(
      "2025-06-10T08:45:00.000Z",
      "2025-06-10T09:15:00.000Z",
      [citaExistente]
    )).toBe(true)
  })

  it("detecta solapamiento parcial al final", () => {
    expect(haySolapamiento(
      "2025-06-10T09:15:00.000Z",
      "2025-06-10T09:45:00.000Z",
      [citaExistente]
    )).toBe(true)
  })

  it("detecta cuando la nueva cita envuelve completamente a la existente", () => {
    expect(haySolapamiento(
      "2025-06-10T08:30:00.000Z",
      "2025-06-10T10:00:00.000Z",
      [citaExistente]
    )).toBe(true)
  })

  it("no hay solapamiento con lista vacía de citas", () => {
    expect(haySolapamiento(
      "2025-06-10T09:00:00.000Z",
      "2025-06-10T09:30:00.000Z",
      []
    )).toBe(false)
  })

  it("detecta solapamiento cuando hay múltiples citas y solo una choca", () => {
    const citas = [
      { inicio: "2025-06-10T08:00:00.000Z", fin: "2025-06-10T08:30:00.000Z" },
      { inicio: "2025-06-10T09:00:00.000Z", fin: "2025-06-10T09:30:00.000Z" },
      { inicio: "2025-06-10T10:00:00.000Z", fin: "2025-06-10T10:30:00.000Z" },
    ]
    expect(haySolapamiento(
      "2025-06-10T09:10:00.000Z",
      "2025-06-10T09:40:00.000Z",
      citas
    )).toBe(true)
  })
})

// ─────────────────────────────────────────────
// SUITE 3: Validación del formulario de booking público
// ─────────────────────────────────────────────

describe("Booking público — validación del payload", () => {
  const payloadValido = {
    consultorio_id: "550e8400-e29b-41d4-a716-446655440000",
    servicio_id: "550e8400-e29b-41d4-a716-446655440001",
    inicio: "2025-06-10T15:00:00.000Z",
    fin: "2025-06-10T15:30:00.000Z",
    duracion_min: 30,
    paciente: {
      nombre: "María González",
      telefono: "33 1234 5678",
      email: "maria@email.com",
      consentimiento_privacidad: true,
      consentimiento_whatsapp: false,
    },
  }

  it("acepta payload completamente válido", () => {
    expect(schemaBookingPublico.safeParse(payloadValido).success).toBe(true)
  })

  it("acepta paciente sin email (campo opcional)", () => {
    const r = schemaBookingPublico.safeParse({
      ...payloadValido,
      paciente: { ...payloadValido.paciente, email: null },
    })
    expect(r.success).toBe(true)
  })

  it("rechaza consultorio_id no UUID", () => {
    const r = schemaBookingPublico.safeParse({ ...payloadValido, consultorio_id: "no-es-uuid" })
    expect(r.success).toBe(false)
  })

  it("rechaza nombre de paciente con menos de 2 caracteres", () => {
    const r = schemaBookingPublico.safeParse({
      ...payloadValido,
      paciente: { ...payloadValido.paciente, nombre: "A" },
    })
    expect(r.success).toBe(false)
  })

  it("rechaza teléfono con menos de 8 caracteres", () => {
    const r = schemaBookingPublico.safeParse({
      ...payloadValido,
      paciente: { ...payloadValido.paciente, telefono: "1234" },
    })
    expect(r.success).toBe(false)
  })

  it("rechaza email inválido en el paciente", () => {
    const r = schemaBookingPublico.safeParse({
      ...payloadValido,
      paciente: { ...payloadValido.paciente, email: "no-es-email" },
    })
    expect(r.success).toBe(false)
  })
})

// ─────────────────────────────────────────────
// SUITE 4: Validación del formulario del paciente (UI pública)
// ─────────────────────────────────────────────

describe("Formulario de paciente en booking público", () => {
  const datosValidos = {
    nombre: "Carlos Ramírez",
    telefono: "55 9876 5432",
    email: "",
    consentimiento: true,
    consentimientoWA: false,
  }

  it("acepta datos válidos sin email", () => {
    expect(schemaPacientePublico.safeParse(datosValidos).success).toBe(true)
  })

  it("acepta datos válidos con email", () => {
    const r = schemaPacientePublico.safeParse({ ...datosValidos, email: "carlos@email.com" })
    expect(r.success).toBe(true)
  })

  it("rechaza sin aceptar consentimiento de privacidad", () => {
    const r = schemaPacientePublico.safeParse({ ...datosValidos, consentimiento: false })
    expect(r.success).toBe(false)
  })

  it("rechaza nombre muy corto", () => {
    const r = schemaPacientePublico.safeParse({ ...datosValidos, nombre: "A" })
    expect(r.success).toBe(false)
  })

  it("rechaza teléfono muy corto", () => {
    const r = schemaPacientePublico.safeParse({ ...datosValidos, telefono: "123" })
    expect(r.success).toBe(false)
  })
})

// ─────────────────────────────────────────────
// SUITE 5: Función slugify
// ─────────────────────────────────────────────

describe("slugify — generación de URLs de consultorio", () => {
  it("convierte a minúsculas y reemplaza espacios por guiones", () => {
    expect(slugify("Consultorio García")).toBe("consultorio-garcia")
  })

  it("elimina acentos y caracteres especiales", () => {
    expect(slugify("Dra. Sofía Martínez-López")).toBe("dra-sofia-martinez-lopez")
  })

  it("colapsa múltiples espacios o guiones", () => {
    expect(slugify("Dr.  Roberto   García")).toBe("dr-roberto-garcia")
  })

  it("elimina guiones al inicio y al final", () => {
    expect(slugify("  consultorio  ")).toBe("consultorio")
  })

  it("dos consultorios con el mismo nombre generan el mismo slug — caso de duplicado", () => {
    const a = slugify("Consultorio San Rafael")
    const b = slugify("Consultorio San Rafael")
    expect(a).toBe(b)
    // NOTA: Esto documenta el bug #3. En producción, la DB rechazará
    // el segundo insert por constraint UNIQUE en slug, pero el error
    // no está manejado con un mensaje claro al usuario.
  })
})

// ─────────────────────────────────────────────
// SUITE 6: Ventana de cancelación
// ─────────────────────────────────────────────

describe("Ventana de cancelación de citas", () => {
  function puedeCancel(inicio: Date, ahora: Date, ventanaHoras = 3): boolean {
    const diffHoras = (inicio.getTime() - ahora.getTime()) / (1000 * 60 * 60)
    return diffHoras >= ventanaHoras
  }

  it("permite cancelar cuando quedan más de 3 horas", () => {
    const ahora = new Date("2025-06-10T10:00:00Z")
    const inicio = new Date("2025-06-10T14:00:00Z") // 4h después
    expect(puedeCancel(inicio, ahora)).toBe(true)
  })

  it("permite cancelar exactamente en el límite de 3 horas", () => {
    const ahora = new Date("2025-06-10T10:00:00Z")
    const inicio = new Date("2025-06-10T13:00:00Z")
    expect(puedeCancel(inicio, ahora)).toBe(true)
  })

  it("rechaza cancelar cuando quedan menos de 3 horas", () => {
    const ahora = new Date("2025-06-10T11:00:00Z")
    const inicio = new Date("2025-06-10T13:00:00Z") // solo 2h
    expect(puedeCancel(inicio, ahora)).toBe(false)
  })

  it("rechaza cancelar cuando la cita ya pasó", () => {
    const ahora = new Date("2025-06-10T15:00:00Z")
    const inicio = new Date("2025-06-10T10:00:00Z")
    expect(puedeCancel(inicio, ahora)).toBe(false)
  })

  it("respeta ventana personalizada de 24h", () => {
    const ahora = new Date("2025-06-10T10:00:00Z")
    const inicio = new Date("2025-06-11T09:00:00Z") // 23h después
    expect(puedeCancel(inicio, ahora, 24)).toBe(false)
  })
})
