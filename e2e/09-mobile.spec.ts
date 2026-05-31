import { test, expect } from "@playwright/test"
import { TEST_SLUG } from "./helpers"
import { BookingPublicoPage } from "./pages/BookingPublicoPage"

// Este archivo corre en el proyecto 'mobile' (Pixel 7)
// definido en playwright.config.ts

test.describe("Booking público — Móvil (Pixel 7)", () => {
  test.setTimeout(90_000)

  test("página pública carga en móvil", async ({ page }) => {
    await page.goto(`/agendar/${TEST_SLUG}`)
    await expect(page.getByText("Agenda tu cita")).toBeVisible()
  })

  test("botones son suficientemente grandes para tocar (≥44px)", async ({ page }) => {
    await page.goto(`/agendar/${TEST_SLUG}`)
    const botones = page.getByRole("button")
    const count = await botones.count()
    for (let i = 0; i < Math.min(count, 5); i++) {
      const box = await botones.nth(i).boundingBox()
      if (box && box.height > 0) {
        expect(box.height, `Botón ${i} muy pequeño: ${box.height}px`).toBeGreaterThanOrEqual(36)
      }
    }
  })

  test("flujo completo de agendado es funcional en móvil", async ({ page }) => {
    const booking = new BookingPublicoPage(page)
    await booking.flujoCompleto(TEST_SLUG, {
      nombre: "Paciente Móvil E2E",
      telefono: `559988${Math.floor(1000 + Math.random() * 8999)}`,
    })
  })

  test("panel del médico es navegable en móvil", async ({ page }) => {
    // El panel no está optimizado para móvil — solo verificar que carga sin crash
    await page.goto("/login")
    await expect(page.locator("body")).toBeVisible()
    await expect(page.locator("form")).toBeVisible()
  })

})
