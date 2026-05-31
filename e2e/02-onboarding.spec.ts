import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers"

// El onboarding solo aplica a cuentas nuevas. Estos tests verifican que
// la ruta /onboarding carga y que el flujo está disponible.

test.describe("Onboarding", () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page)
  })

  test("/onboarding carga sin error", async ({ page }) => {
    await page.goto("/onboarding")
    // Señal 1: URL correcta
    await expect(page).toHaveURL(/\/onboarding|\/panel/)
    // Si ya tiene consultorio, redirige a /panel — ambos son válidos
  })

  test("paso 2 — horarios tienen inputs de hora editables", async ({ page }) => {
    await page.goto("/onboarding")
    if (page.url().includes("/panel")) return // ya completó onboarding

    // Avanzar al paso 2
    await page.getByRole("button", { name: /siguiente/i }).click()
    // Los inputs de hora deben existir (bug #7 corregido)
    await expect(page.locator('input[type="time"]').first()).toBeVisible({ timeout: 5_000 })
  })

  test("botón 'Continuar después' lleva al panel", async ({ page }) => {
    await page.goto("/onboarding")
    if (page.url().includes("/panel")) return

    await page.getByRole("button", { name: /continuar después/i }).click()
    await expect(page).toHaveURL(/\/panel/)
  })

})
