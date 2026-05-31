import { type Page, expect } from "@playwright/test"

export class CitasPage {
  constructor(private page: Page) {}

  async gotoNueva() {
    await this.page.goto("/panel/citas/nueva")
    await this.page.waitForLoadState("networkidle")
  }

  async gotoLista() {
    await this.page.goto("/panel/citas")
    await this.page.waitForLoadState("networkidle")
  }

  async selectPaciente(nombre: string) {
    await this.page.getByPlaceholder(/buscar por nombre/i).fill(nombre)
    await this.page.getByText(nombre).first().click()
  }

  async selectPrimerServicio() {
    // Selecciona el primer servicio disponible en la grilla
    await this.page.locator(".card button[style*='border']").first().click()
  }

  async selectFechaHoy() {
    // Selecciona el día de hoy en el mini calendario
    const hoy = new Date().getDate().toString()
    const botonesDia = this.page.locator(".card button").filter({ hasText: new RegExp(`^${hoy}$`) })
    await botonesDia.first().click()
  }

  async selectSlot(hora = "09:00") {
    await this.page.getByRole("button", { name: hora }).click()
  }

  async confirmar() {
    await this.page.getByRole("button", { name: /confirmar cita/i }).click()
  }

  async expectExitoso() {
    // Señal 1: redirige a /panel/citas
    await expect(this.page).toHaveURL(/\/panel\/citas$/, { timeout: 8_000 })
    // Señal 2: toast de éxito
    await expect(
      this.page.locator("[data-sonner-toast]").or(this.page.getByRole("status"))
    ).toBeVisible({ timeout: 5_000 })
  }

  async expectError() {
    await expect(
      this.page.locator("[data-sonner-toast]").or(this.page.getByRole("alert"))
    ).toBeVisible({ timeout: 5_000 })
  }
}
