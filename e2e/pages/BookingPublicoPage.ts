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
    // Paso 1: primer botón que contenga "min" (servicios tienen duración en minutos)
    await this.page.locator("button").filter({ hasText: /min/ }).first().click()
    // Verificar avance al paso 2 (aparece calendario)
    await expect(
      this.page.getByText(/enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i).first()
    ).toBeVisible({ timeout: 8_000 })
  }

  async seleccionarPrimerDiaHabil() {
    // Paso 2: primer día no deshabilitado del calendario
    // Los días son botones con solo dígitos como texto
    const diaHabil = this.page.locator("button:not([disabled])").filter({ hasText: /^\d{1,2}$/ }).first()
    await diaHabil.click()
    // Verificar avance al paso 3 (aparece selección de hora)
    await expect(
      this.page.getByText(/elige el horario|horario/i).or(
        this.page.locator("button").filter({ hasText: /^\d{2}:\d{2}$/ }).first()
      )
    ).toBeVisible({ timeout: 8_000 })
  }

  async seleccionarPrimerSlot() {
    // Paso 3: primer slot disponible (no deshabilitado)
    const slot = this.page.locator("button:not([disabled])").filter({ hasText: /^\d{2}:\d{2}$/ }).first()
    await expect(slot).toBeVisible({ timeout: 8_000 })
    await slot.click()
    // Verificar avance al paso 4
    await expect(this.page.getByText("Tus datos")).toBeVisible({ timeout: 5_000 })
  }

  async llenarDatosPaciente(data: { nombre: string; telefono: string; email?: string }) {
    await this.page.getByRole("textbox", { name: /nombre completo/i }).fill(data.nombre)
    await this.page.locator('input[type="tel"]').fill(data.telefono)
    if (data.email) {
      await this.page.getByRole("textbox", { name: /email/i }).fill(data.email)
    }
    await this.page.locator(".checkbox__box").first().click()
  }

  async confirmar() {
    await this.page.getByRole("button", { name: /confirmar cita/i }).click()
  }

  async expectExitoso() {
    await expect(this.page.getByText("¡Cita agendada!")).toBeVisible({ timeout: 12_000 })
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
