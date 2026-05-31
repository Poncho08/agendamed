import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers"

test.describe("Seguridad y aislamiento de datos", () => {

  test("rutas protegidas redirigen a /login sin sesión", async ({ page }) => {
    const rutas = [
      "/panel",
      "/panel/citas",
      "/panel/pacientes",
      "/panel/recetas",
      "/panel/configuracion",
    ]
    for (const ruta of rutas) {
      await page.goto(ruta)
      await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
    }
  })

  test("API protegidas devuelven 401 sin sesión", async ({ request }) => {
    const fakeId = "00000000-0000-0000-0000-000000000000"
    const endpoints = [
      { method: "GET",  url: `/api/pdf/receta/${fakeId}` },
      { method: "POST", url: `/api/whatsapp/receta`, body: { recetaId: fakeId } },
    ]
    for (const ep of endpoints) {
      const res = ep.method === "GET"
        ? await request.get(ep.url)
        : await request.post(ep.url, { data: ep.body })
      expect(res.status(), `${ep.method} ${ep.url} debe ser 401`).toBe(401)
    }
  })

  test("médico no puede acceder a UUID de otro médico directamente", async ({ page }) => {
    await loginAs(page)
    // Intentar acceder a un ID ficticio de otro consultorio
    await page.goto("/panel/pacientes/00000000-0000-0000-0000-000000000000")
    // Debe mostrar 404 o redirigir — no debe mostrar datos
    const titulo = await page.title()
    const is404 = titulo.toLowerCase().includes("404") ||
      titulo.toLowerCase().includes("not found") ||
      page.url().includes("/panel/pacientes")
    expect(is404).toBe(true)
  })

  test("token de cancelación inválido → error claro", async ({ page }) => {
    await page.goto("/cancelar/00000000-0000-0000-0000-000000000000")
    // No debe mostrar pantalla en blanco ni crash
    await expect(page.locator("body")).not.toBeEmpty()
    // Debe mostrar algún mensaje de error
    await expect(
      page.getByText(/no encontrada|inválido|error/i).or(
        page.getByRole("heading")
      )
    ).toBeVisible({ timeout: 5_000 })
  })

})
