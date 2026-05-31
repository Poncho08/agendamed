import { type Page } from "@playwright/test"

export const TEST_USER = {
  email: process.env.E2E_EMAIL ?? "test@agendamed.dev",
  password: process.env.E2E_PASSWORD ?? "Test1234!",
}

export const TEST_SLUG = process.env.E2E_SLUG ?? "consultorio-prueba"

export async function loginAs(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  await page.goto("/login")
  await page.waitForLoadState("networkidle")
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole("button", { name: /iniciar sesión/i }).click()
  await page.waitForURL("**/panel", { timeout: 12_000 })
}

export async function expectToast(page: Page) {
  // Usar solo data-sonner-toast para evitar match con el route-announcer de Next.js
  return page.locator("[data-sonner-toast]").first()
}
