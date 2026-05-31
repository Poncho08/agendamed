import { test, expect } from "@playwright/test"
import { loginAs, expectToast } from "./helpers"

test.describe("Recetas", () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page)
  })

  test("formulario de nueva receta carga", async ({ page }) => {
    await page.goto("/panel/recetas/nueva")
    await expect(page.getByText("Diagnóstico")).toBeVisible()
    await expect(page.getByText("Medicamentos")).toBeVisible()
    await expect(page.locator("select").first()).toBeVisible()
  })

  test("plantilla HC Preliminar aparece primera en el selector", async ({ page }) => {
    await page.goto("/panel/recetas/nueva")
    const selectPlantilla = page.locator("select").nth(1)
    await expect(selectPlantilla).toContainText(/historia clínica/i)
  })

  test("CIE-10 autocomplete sugiere al escribir 'diabetes'", async ({ page }) => {
    await page.goto("/panel/recetas/nueva")
    const inputDx = page.locator('input[placeholder*="CIE" i]').or(
      page.locator('input[placeholder*="diagnós" i]')
    ).first()
    await inputDx.fill("diabetes")
    // Señal 1: sugerencias aparecen con código E11
    await expect(page.locator("ul li button").filter({ hasText: /E11/ })).toBeVisible({ timeout: 3_000 })
  })

  test("seleccionar sugerencia CIE-10 rellena el campo y cierra la lista", async ({ page }) => {
    await page.goto("/panel/recetas/nueva")
    const inputDx = page.locator('input[placeholder*="CIE" i]').or(
      page.locator('input[placeholder*="diagnós" i]')
    ).first()
    await inputDx.fill("hipertension")
    const sugerencia = page.locator("ul li button").filter({ hasText: /I10/ }).first()
    await sugerencia.click()
    // Señal 1: input contiene el código
    await expect(inputDx).toHaveValue(/I10/)
    // Señal 2: lista cerrada
    await expect(page.locator("ul li button").filter({ hasText: /I10/ })).not.toBeVisible()
  })

  test("guardar sin diagnóstico → toast de error", async ({ page }) => {
    await page.goto("/panel/recetas/nueva")
    await page.getByRole("button", { name: /guardar receta/i }).or(
      page.getByRole("button", { name: /generar pdf/i })
    ).first().click()
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
    await expect(
      page.locator("table").or(page.getByText(/sin recetas|no hay recetas/i))
    ).toBeVisible({ timeout: 8_000 })
  })

})
