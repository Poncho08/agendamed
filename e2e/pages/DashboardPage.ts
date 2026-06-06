import { type Page, expect } from "@playwright/test"

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/panel")
    await this.page.waitForLoadState("networkidle")
  }

  async expectMetrics() {
    // .first() evita strict mode cuando el texto aparece en múltiples elementos
    await expect(this.page.getByText("Citas hoy").first()).toBeVisible()
    await expect(this.page.getByText("Pacientes activos").first()).toBeVisible()
    await expect(this.page.getByText("Ingresos del mes").first()).toBeVisible()
    await expect(this.page.getByText("Tasa de asistencia").first()).toBeVisible()
  }

  async clickNuevaCita() {
    await this.page.getByRole("link", { name: /nueva cita/i }).first().click()
    await expect(this.page).toHaveURL(/\/citas\/nueva/)
  }

  async expectSidebar() {
    const sidebar = this.page.locator(".sidebar")
    // nav-item__label evita match con "AgendaMed" en el logo
    await expect(sidebar.locator(".nav-item__label").filter({ hasText: /^Agenda$/ }).first()).toBeVisible()
    await expect(sidebar.locator(".nav-item__label").filter({ hasText: /^Pacientes$/ }).first()).toBeVisible()
    await expect(sidebar.locator(".nav-item__label").filter({ hasText: /^Recetas$/ }).first()).toBeVisible()
    await expect(sidebar.locator(".nav-item__label").filter({ hasText: /^Portal de citas$/ }).first()).toBeVisible()
    await expect(sidebar.locator(".nav-item__label").filter({ hasText: /^Configuración$/ }).first()).toBeVisible()
  }

  async logout() {
    await this.page.getByRole("button", { name: /cerrar sesión/i }).click()
  }
}
