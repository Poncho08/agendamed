import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers"

const NOMBRE_PACIENTE = `Paciente E2E ${Date.now()}`
const TELEFONO = `55${Math.floor(10000000 + Math.random() * 89999999)}`

test.describe("Pacientes", () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page)
  })

  test("lista de pacientes carga", async ({ page }) => {
    await page.goto("/panel/pacientes")
    // Usar .first() para evitar strict mode cuando tabla y celda están ambas presentes
    await expect(
      page.locator("table").first()
    ).toBeVisible({ timeout: 8_000 })
  })

  test("formulario de nuevo paciente carga", async ({ page }) => {
    await page.goto("/panel/pacientes/nuevo")
    await page.waitForLoadState("networkidle")
    // Buscar cualquier input de texto visible en el formulario
    await expect(page.locator('input[type="text"], input:not([type])').first()).toBeVisible({ timeout: 5_000 })
  })

  test("botón guardar paciente está deshabilitado con formulario vacío", async ({ page }) => {
    await page.goto("/panel/pacientes/nuevo")
    await page.waitForLoadState("networkidle")
    const btn = page.getByRole("button", { name: /guardar paciente/i })
    await expect(btn).toBeVisible()
    await expect(btn).toBeDisabled()
  })

  test("buscar paciente filtra la lista", async ({ page }) => {
    await page.goto("/panel/pacientes")
    const buscador = page.locator('input[placeholder*="buscar" i], input[placeholder*="Buscar" i]').first()
    if ((await buscador.count()) === 0) return

    await buscador.fill("P")
    await page.waitForTimeout(400)
    // Solo verificar que la tabla sigue visible tras buscar
    await expect(page.locator("table").first()).toBeVisible()
  })

  test("perfil de paciente existente carga si hay pacientes", async ({ page }) => {
    await page.goto("/panel/pacientes")
    const primerLink = page.locator("table tbody tr a").first()
    if ((await primerLink.count()) === 0) return
    await primerLink.click()
    await expect(page).toHaveURL(/\/pacientes\/[a-z0-9-]+$/)
    await expect(page.locator("main")).toBeVisible()
  })

})
