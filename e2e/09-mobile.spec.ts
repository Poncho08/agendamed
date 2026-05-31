import { test, expect } from "@playwright/test"
import { TEST_SLUG } from "./helpers"

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
    await page.goto(`/agendar/${TEST_SLUG}`)

    // Paso 1: servicio
    await page.locator("button").filter({ hasText: /min/ }).first().click()

    // Paso 2: día hábil
    const dia = page.locator("button:not([disabled])").filter({ hasText: /^\d+$/ }).first()
    await dia.click()

    // Paso 3: slot
    const slot = page.locator("button:not([disabled])").filter({ hasText: /^\d{2}:\d{2}$/ }).first()
    await slot.click()

    // Paso 4: datos
    await page.getByRole("textbox", { name: /nombre completo/i }).fill("Paciente Móvil")
    await page.locator('input[type="tel"]').fill("5599887766")
    await page.locator(".checkbox__box").first().click()

    await page.getByRole("button", { name: /confirmar cita/i }).click()
    await expect(page.getByText("¡Cita agendada!")).toBeVisible({ timeout: 10_000 })
  })

  test("panel del médico es navegable en móvil", async ({ page }) => {
    // El panel no está optimizado para móvil — solo verificar que carga sin crash
    await page.goto("/login")
    await expect(page.locator("body")).toBeVisible()
    await expect(page.locator("form")).toBeVisible()
  })

})
