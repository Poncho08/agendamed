// Emails con acceso al panel de administración de AgendaMed.
// Se leen desde la variable de entorno ADMIN_EMAILS (separados por coma).
// Ejemplo en .env.local:
//   ADMIN_EMAILS=admin@agendamed.mx,silvaalfonso381@gmail.com
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? ""
  return raw.split(",").map((e) => e.trim()).filter(Boolean)
}

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(email)
}
