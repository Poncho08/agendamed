import { defineConfig, devices } from "@playwright/test"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "https://agendamed.inovit.mx",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    locale: "es-MX",
    timezoneId: "America/Mexico_City",
    // Headed en desarrollo para ver qué hace el bot (regla B1 del SKILL.md)
    headless: process.env.CI === "true" ? true : false,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: "**/09-mobile.spec.ts",
    },
  ],
})
