import { test, expect } from "@playwright/test"
import { loginAs, TEST_USER, expectToast } from "./helpers"
import { LoginPage } from "./pages/LoginPage"

test.describe("Autenticación", () => {

  test("login correcto → redirige a /panel", async ({ page }) => {
    await loginAs(page)
    // Señal 1: URL
    await expect(page).toHaveURL(/\/panel/)
    // Señal 2: saludo visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("login con contraseña incorrecta → toast de error + permanece en /login", async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login(TEST_USER.email, "contraseña-incorrecta-xyz")
    // Señal 1: toast de error
    await login.expectError()
    // Señal 2: no redirigió
    await expect(page).toHaveURL(/\/login/)
  })

  test("login con email vacío → no hace submit", async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await page.getByRole("button", { name: /iniciar sesión/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test("usuario logueado que va a /login → redirige a /panel", async ({ page }) => {
    await loginAs(page)
    await page.goto("/login")
    await expect(page).toHaveURL(/\/panel/)
  })

  test("logout → sale del panel", async ({ page }) => {
    await loginAs(page)
    await page.getByRole("button", { name: /cerrar sesión/i }).click()
    // Señal 1: URL fuera del panel
    await expect(page).toHaveURL(/\/login|\/planes/)
    // Señal 2: botón de login visible
    await expect(page.getByRole("button", { name: /iniciar sesión/i }).or(
      page.getByRole("link", { name: /iniciar sesión/i })
    )).toBeVisible({ timeout: 5_000 })
  })

  test("acceder a /panel sin sesión → redirige a /login", async ({ page }) => {
    await page.goto("/panel")
    await expect(page).toHaveURL(/\/login/)
  })

  test("acceder a /panel/pacientes sin sesión → redirige a /login", async ({ page }) => {
    await page.goto("/panel/pacientes")
    await expect(page).toHaveURL(/\/login/)
  })

  test("acceder a /panel/recetas sin sesión → redirige a /login", async ({ page }) => {
    await page.goto("/panel/recetas")
    await expect(page).toHaveURL(/\/login/)
  })

  test("API /api/pdf/receta sin sesión → 401", async ({ request }) => {
    const res = await request.get("/api/pdf/receta/00000000-0000-0000-0000-000000000000")
    expect(res.status()).toBe(401)
  })

  test("API /api/whatsapp/receta sin sesión → 401", async ({ request }) => {
    const res = await request.post("/api/whatsapp/receta", {
      data: { recetaId: "00000000-0000-0000-0000-000000000000" },
    })
    expect(res.status()).toBe(401)
  })

  test("recuperación de contraseña — solicitud exitosa", async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await page.locator('input[type="email"]').fill(TEST_USER.email)
    await login.clickForgotPassword()
    // Señal 1: toast de éxito
    const toast = await expectToast(page)
    await expect(toast).toBeVisible({ timeout: 5_000 })
    // Señal 2: permanece en /login (no redirige hasta que use el link del email)
    await expect(page).toHaveURL(/\/login/)
  })

  test.skip("página /auth/reset-password existe y carga", async ({ page }) => {
    // Skip hasta hacer deploy — la página existe en código pero no en producción
    await page.goto("/auth/reset-password")
    // Señal 1: carga sin error 404
    await expect(page).not.toHaveTitle(/404|not found/i)
    // Señal 2: hay un input de contraseña visible
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

})
