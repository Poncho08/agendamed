import { type Page, expect } from "@playwright/test"

export class BookingPublicoPage {
  constructor(private page: Page) {}

  async goto(slug: string) {
    await this.page.goto(`/agendar/${slug}`)
    await this.page.waitForLoadState("networkidle")
  }

  async expectCargado() {
    await expect(this.page.getByText("Agenda tu cita")).toBeVisible()
  }

  async seleccionarPrimerServicio() {
    await this.page.locator("button").filter({ hasText: /min/ }).first().click()
    await expect(
      this.page.getByText(/enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i).first()
    ).toBeVisible({ timeout: 8_000 })
  }

  async seleccionarPrimerDiaHabil() {
    // Si el mes actual no tiene días hábiles disponibles (ej. final de mes),
    // avanzar al mes siguiente hasta encontrar uno
    let intentos = 0
    while (intentos < 3) {
      const diasHabiles = this.page.locator("button:not([disabled])").filter({ hasText: /^\d{1,2}$/ })
      const count = await diasHabiles.count()
      if (count > 0) break
      // Avanzar al siguiente mes (botón chevron derecho)
      await this.page.locator("button.iconbtn").last().click()
      await this.page.waitForTimeout(300)
      intentos++
    }
    const diaHabil = this.page.locator("button:not([disabled])").filter({ hasText: /^\d{1,2}$/ }).first()
    await expect(diaHabil).toBeVisible({ timeout: 15_000 })
    await diaHabil.click()
    // Esperar a que aparezcan los slots (paso 3) — timeout generoso para API de disponibilidad
    await expect(
      this.page.locator("button").filter({ hasText: /^\d{2}:\d{2}$/ }).first()
    ).toBeVisible({ timeout: 20_000 })
  }

  async seleccionarPrimerSlot() {
    // Esperar a que haya al menos un slot habilitado
    const slot = this.page.locator("button:not([disabled])").filter({ hasText: /^\d{2}:\d{2}$/ }).first()
    await expect(slot).toBeVisible({ timeout: 20_000 })
    await slot.click()
    // .first() — "Tus datos" aparece en el progress bar Y en el heading del paso 4
    await expect(this.page.getByText("Tus datos").first()).toBeVisible({ timeout: 8_000 })
  }

  async llenarDatosPaciente(data: { nombre: string; telefono: string; email?: string }) {
    // El input no tiene aria-label — usar el placeholder "Dr. / Sra. / Sr. Tu nombre"
    await this.page.locator('input[placeholder*="Tu nombre" i]').fill(data.nombre)
    await this.page.locator('input[type="tel"]').fill(data.telefono)
    if (data.email) {
      await this.page.locator('input[type="email"]').fill(data.email)
    }
    // Primer checkbox = Aviso de Privacidad (obligatorio)
    await this.page.locator(".checkbox__box").first().click()
  }

  async confirmar() {
    await this.page.getByRole("button", { name: /confirmar cita/i }).click()
  }

  async expectExitoso() {
    await expect(this.page.getByText("¡Cita agendada!")).toBeVisible({ timeout: 15_000 })
    await expect(this.page.getByRole("button", { name: /confirmar cita/i })).not.toBeVisible()
  }

  async flujoCompleto(slug: string, paciente: { nombre: string; telefono: string }) {
    await this.goto(slug)
    await this.expectCargado()
    await this.seleccionarPrimerServicio()
    await this.seleccionarPrimerDiaHabil()
    await this.seleccionarPrimerSlot()
    await this.llenarDatosPaciente(paciente)
    await this.confirmar()
    await this.expectExitoso()
  }
}
