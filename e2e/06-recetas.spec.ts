import { test, expect } from "@playwright/test"
import { loginAs, expectToast } from "./helpers"

test.describe("Recetas", () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page)
  })

  test("formulario de nueva receta carga", async ({ page }) => {
    await page.goto("/panel/recetas/nueva")
    await page.waitForLoadState("networkidle")
    // .first() evita strict mode — "Diagnóstico" aparece en card__title y en preview
    await expect(page.locator(".card__title").filter({ hasText: /^Diagnóstico$/ }).first()).toBeVisible()
    await expect(page.locator(".card__title").filter({ hasText: /^Medicamentos$/ }).first()).toBeVisible()
    await expect(page.locator("select").first()).toBeVisible()
  })

  test("plantilla HC Preliminar aparece primera en el selector", async ({ page }) => {
    await page.goto("/panel/recetas/nueva")
    const selectPlantilla = page.locator("select").nth(1)
    await expect(selectPlantilla).toContainText(/historia clínica/i)
  })

  test("CIE-10 autocomplete sugiere al escribir 'diabetes'", async ({ page }) => {
    await page.goto("/panel/recetas/nueva")
    await page.waitForLoadState("networkidle")
    // Buscar el input de diagnóstico por su placeholder único
    const inputDx = page.locator('input[placeholder*="J00"]').or(
      page.locator('input[placeholder*="diabetes"]')
    ).first()
    await expect(inputDx).toBeVisible({ timeout: 5_000 })
    await inputDx.fill("diabetes")
    // .first() — /E11/ matchea E11.9 y E11.65, ambas válidas
    await expect(page.locator("ul li button").filter({ hasText: /E11/ }).first()).toBeVisible({ timeout: 5_000 })
  })

  test("seleccionar sugerencia CIE-10 rellena el campo", async ({ page }) => {
    await page.goto("/panel/recetas/nueva")
    await page.waitForLoadState("networkidle")
    const inputDx = page.locator('input[placeholder*="J00"]').or(
      page.locator('input[placeholder*="diabetes"]')
    ).first()
    await expect(inputDx).toBeVisible({ timeout: 5_000 })
    await inputDx.fill("diabetes")
    const sugerencia = page.locator("ul li button").filter({ hasText: /E11/ }).first()
    await expect(sugerencia).toBeVisible({ timeout: 5_000 })
    await sugerencia.click()
    await expect(inputDx).toHaveValue(/E11/)
  })

  test("guardar sin diagnóstico → toast de error", async ({ page }) => {
    await page.goto("/panel/recetas/nueva")
    await page.waitForLoadState("networkidle")
    // El botón "Guardar receta" es el último de los botones de acción
    const botonesAccion = page.locator(".card button").filter({ hasText: /guardar receta|generar pdf/i })
    await expect(botonesAccion.first()).toBeVisible({ timeout: 5_000 })
    await botonesAccion.first().click()
    const toast = await expectToast(page)
    await expect(toast).toBeVisible({ timeout: 5_000 })
  })

  test("campo cédula profesional existe en configuración", async ({ page }) => {
    await page.goto("/panel/configuracion")
    await expect(page.getByText(/cédula profesional/i)).toBeVisible({ timeout: 5_000 })
  })

  test("indicaciones tiene atributo maxlength=1500", async ({ page }) => {
    await page.goto("/panel/recetas/nueva")
    const textarea = page.locator("textarea")
    const maxLength = await textarea.getAttribute("maxlength")
    expect(maxLength).toBe("1500")
  })

  test("lista de recetas carga", async ({ page }) => {
    await page.goto("/panel/recetas")
    await expect(page).toHaveURL(/\/panel\/recetas$/)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("main")).toBeVisible({ timeout: 8_000 })
  })

})
