import { test, expect } from "@playwright/test"
import { loginAs, expectToast } from "./helpers"
import { CitasPage } from "./pages/CitasPage"

test.describe("Citas — Panel del médico", () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page)
  })

  test("formulario de nueva cita carga con todas las secciones", async ({ page }) => {
    const citas = new CitasPage(page)
    await citas.gotoNueva()
    // Usar selectores de card__title para evitar strict mode con "Paciente" en la página
    await expect(page.locator(".card__title").filter({ hasText: /^Paciente$/ }).first()).toBeVisible()
    await expect(page.locator(".card__title").filter({ hasText: /^Servicio$/ }).first()).toBeVisible()
    await expect(page.locator(".card__title").filter({ hasText: /Fecha/ }).first()).toBeVisible()
    await expect(page.getByRole("button", { name: /confirmar cita/i })).toBeVisible()
  })

  test("botón confirmar está deshabilitado sin paciente seleccionado", async ({ page }) => {
    const citas = new CitasPage(page)
    await citas.gotoNueva()
    // El botón existe pero está disabled (correcto — no se puede confirmar sin paciente)
    const btn = page.getByRole("button", { name: /confirmar cita/i })
    await expect(btn).toBeVisible()
    await expect(btn).toBeDisabled()
  })

  test("lista de citas carga", async ({ page }) => {
    const citas = new CitasPage(page)
    await citas.gotoLista()
    await expect(page).toHaveURL(/\/panel\/citas$/)
    await expect(
      page.locator("table").first().or(page.getByText(/sin citas|no hay citas/i).first())
    ).toBeVisible({ timeout: 8_000 })
  })

  test("mini calendario navega al mes siguiente", async ({ page }) => {
    await page.goto("/panel/citas/nueva")
    const mesActual = await page.locator(".card span").filter({
      hasText: /enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i,
    }).first().textContent()

    await page.locator("button.iconbtn").last().click()

    const mesSiguiente = await page.locator(".card span").filter({
      hasText: /enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i,
    }).first().textContent()

    expect(mesActual).not.toBe(mesSiguiente)
  })

  test("detalle de cita existente carga si hay citas", async ({ page }) => {
    await page.goto("/panel/citas")
    const primerLink = page.locator("table tbody tr a").first()
    if ((await primerLink.count()) === 0) return
    await primerLink.click()
    await expect(page).toHaveURL(/\/panel\/citas\/[a-z0-9-]+$/)
  })

  test("/panel/agenda carga la vista de calendario", async ({ page }) => {
    await page.goto("/panel/agenda")
    await expect(page).toHaveURL(/\/panel\/agenda/)
    await expect(page.locator("main")).toBeVisible()
  })

})
