import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers"
import { DashboardPage } from "./pages/DashboardPage"

test.describe("Dashboard", () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page)
  })

  test("carga con las 4 métricas visibles", async ({ page }) => {
    const dash = new DashboardPage(page)
    await dash.goto()
    await dash.expectMetrics()
  })

  test("sidebar contiene todos los módulos", async ({ page }) => {
    const dash = new DashboardPage(page)
    await dash.goto()
    await dash.expectSidebar()
  })

  test("botón '+ Nueva cita' lleva al formulario", async ({ page }) => {
    const dash = new DashboardPage(page)
    await dash.goto()
    await dash.clickNuevaCita()
    await expect(page).toHaveURL(/\/citas\/nueva/)
  })

  test("enlace 'Ver agenda completa' lleva a /panel/agenda", async ({ page }) => {
    await page.goto("/panel")
    await page.getByRole("link", { name: /ver agenda completa/i }).click()
    await expect(page).toHaveURL(/\/panel\/agenda/)
  })

  test("Portal de citas carga desde el sidebar", async ({ page }) => {
    await page.goto("/panel")
    await page.getByRole("link", { name: /portal de citas/i }).click()
    // Señal 1: URL correcta
    await expect(page).toHaveURL(/\/panel\/portal/)
    // Señal 2: contenido del portal visible
    await expect(page.getByText(/comparte tu página/i)).toBeVisible({ timeout: 5_000 })
  })

  test("portal muestra URL pública del consultorio", async ({ page }) => {
    await page.goto("/panel/portal")
    await expect(page.getByText(/\/agendar\//)).toBeVisible({ timeout: 5_000 })
  })

})
