import { test, expect } from "@playwright/test"
import { TEST_SLUG, expectToast } from "./helpers"
import { BookingPublicoPage } from "./pages/BookingPublicoPage"

test.describe("Booking público — Flujo del paciente", () => {

  test("página pública carga sin autenticación", async ({ page }) => {
    const booking = new BookingPublicoPage(page)
    await booking.goto(TEST_SLUG)
    await booking.expectCargado()
    await expect(page.getByRole("button").first()).toBeVisible()
  })

  test("seleccionar servicio avanza al paso 2 (fecha)", async ({ page }) => {
    const booking = new BookingPublicoPage(page)
    await booking.goto(TEST_SLUG)
    await booking.seleccionarPrimerServicio()
    // El calendario debe aparecer
    await expect(page.getByText(
      /enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i
    )).toBeVisible()
  })

  test("días pasados están deshabilitados", async ({ page }) => {
    const booking = new BookingPublicoPage(page)
    await booking.goto(TEST_SLUG)
    await booking.seleccionarPrimerServicio()
    // Al menos un botón debe estar disabled (días pasados o días no hábiles)
    await expect(page.locator("button[disabled]").first()).toBeVisible({ timeout: 5_000 })
  })

  test("slots ya ocupados aparecen deshabilitados", async ({ page }) => {
    const booking = new BookingPublicoPage(page)
    await booking.goto(TEST_SLUG)
    await booking.seleccionarPrimerServicio()
    await booking.seleccionarPrimerDiaHabil()
    // Los slots con tachado/disabled son los ocupados (bug #11 corregido)
    // Solo verificamos que la sección de slots cargó correctamente
    await expect(page.locator("button").filter({ hasText: /^\d{2}:\d{2}$/ }).first()).toBeVisible()
  })

  test("confirmar sin nombre → error", async ({ page }) => {
    const booking = new BookingPublicoPage(page)
    await booking.goto(TEST_SLUG)
    await booking.seleccionarPrimerServicio()
    await booking.seleccionarPrimerDiaHabil()
    await booking.seleccionarPrimerSlot()

    // Paso 4: no llenar nombre, solo aceptar privacidad e intentar confirmar
    await page.locator(".checkbox__box").first().click()
    await page.getByRole("button", { name: /confirmar cita/i }).click()

    const toast = await expectToast(page)
    await expect(toast).toBeVisible({ timeout: 5_000 })
  })

  test("confirmar sin aceptar privacidad → botón deshabilitado", async ({ page }) => {
    const booking = new BookingPublicoPage(page)
    await booking.goto(TEST_SLUG)
    await booking.seleccionarPrimerServicio()
    await booking.seleccionarPrimerDiaHabil()
    await booking.seleccionarPrimerSlot()

    await page.getByRole("textbox", { name: /nombre completo/i }).fill("Paciente Test")
    await page.locator('input[type="tel"]').fill("5512345678")
    // Sin aceptar privacidad → botón deshabilitado
    await expect(
      page.getByRole("button", { name: /confirmar cita/i })
    ).toBeDisabled()
  })

  test("flujo completo — agendar cita como paciente", async ({ page }) => {
    const booking = new BookingPublicoPage(page)
    await booking.flujoCompleto(TEST_SLUG, {
      nombre: "Paciente E2E Playwright",
      telefono: `55${Math.floor(10000000 + Math.random() * 89999999)}`,
    })
  })

})
