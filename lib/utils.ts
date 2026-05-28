import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtMxn(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function fmtDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "d MMM yyyy", { locale: es })
}

export function fmtTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "HH:mm", { locale: es })
}

export function fmtDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  if (isToday(d)) return `Hoy · ${format(d, "HH:mm")}`
  if (isTomorrow(d)) return `Mañana · ${format(d, "HH:mm")}`
  return format(d, "EEE d MMM · HH:mm", { locale: es })
}

export function fmtRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

export function fmtEdad(fechaNacimiento: string): number {
  const hoy = new Date()
  const nac = parseISO(fechaNacimiento)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
}

// Color estable para avatar dado un nombre
const AVATAR_COLORS = [
  "oklch(0.72 0.12 232)", // brand
  "oklch(0.72 0.12 158)", // green
  "oklch(0.72 0.12 75)",  // yellow
  "oklch(0.72 0.12 25)",  // orange
  "oklch(0.72 0.12 320)", // purple
  "oklch(0.72 0.12 180)", // teal
]

export function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function diaLabel(dia: number): string {
  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  return dias[dia] ?? ""
}

export function planLabel(plan: string): string {
  const labels: Record<string, string> = {
    prueba: "Prueba gratuita",
    base: "Plan Base",
    pro: "Plan Pro",
  }
  return labels[plan] ?? plan
}

export function diasHastaPrueba(terminaEn: string): number {
  const diff = new Date(terminaEn).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
