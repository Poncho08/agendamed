import { type Page, expect } from "@playwright/test"

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login")
    await this.page.waitForLoadState("networkidle")
  }

  async login(email: string, password: string) {
    await this.page.locator('input[type="email"]').fill(email)
    await this.page.locator('input[type="password"]').fill(password)
    await this.page.getByRole("button", { name: /iniciar sesión/i }).click()
  }

  async expectPanel() {
    await expect(this.page).toHaveURL(/\/panel/, { timeout: 10_000 })
  }

  async expectError() {
    await expect(
      this.page.locator("[data-sonner-toast]").or(this.page.getByRole("alert"))
    ).toBeVisible({ timeout: 5_000 })
  }

  async clickForgotPassword() {
    await this.page.getByRole("button", { name: /olvidaste/i }).click()
  }
}
