import { type Page, expect } from "@playwright/test"

export class RegisterPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/registro")
    await this.page.waitForLoadState("networkidle")
  }

  async fillForm(data: {
    consultorio: string
    nombre: string
    especialidad: string
    email: string
    password: string
  }) {
    await this.page.getByRole("textbox", { name: /nombre del consultorio/i }).fill(data.consultorio)
    await this.page.getByRole("textbox", { name: /tu nombre completo/i }).fill(data.nombre)
    await this.page.getByRole("combobox", { name: /especialidad/i }).selectOption(data.especialidad)
    await this.page.getByRole("textbox", { name: /email/i }).fill(data.email)

    const inputs = this.page.locator('input[type="password"]')
    await inputs.nth(0).fill(data.password)
    await inputs.nth(1).fill(data.password)
  }

  async acceptTerms() {
    // Clic en los dos checkboxes de términos y privacidad
    const checkboxes = this.page.locator(".checkbox__box")
    for (let i = 0; i < 2; i++) {
      if (!(await checkboxes.nth(i).getAttribute("class"))?.includes("checked")) {
        await checkboxes.nth(i).click()
      }
    }
  }

  async submit() {
    await this.page.getByRole("button", { name: /crear cuenta/i }).click()
  }

  async expectSuccess() {
    // Éxito = redirige a onboarding (señal 1) + toast de éxito (señal 2)
    await expect(this.page).toHaveURL(/\/onboarding/, { timeout: 10_000 })
  }

  async expectError(msg?: string | RegExp) {
    const toast = this.page.locator("[data-sonner-toast]").or(this.page.getByRole("alert"))
    await expect(toast).toBeVisible({ timeout: 5_000 })
    if (msg) await expect(toast).toContainText(msg)
  }
}
