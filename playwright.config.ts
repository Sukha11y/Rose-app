import { defineConfig, devices } from "@playwright/test"

/**
 * Functional e2e suite for the Pétale storefront.
 *
 * The app is a client-only SPA with no backend, so the whole suite runs against
 * a single Vite dev server. We pin it to its own port (not the 8443 the Figma
 * Make preview uses) so a running preview and a test run can coexist.
 */
const PORT = Number(process.env.E2E_PORT || 5199)
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],

  expect: { timeout: 5_000 },

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "pnpm exec vite --config vite.e2e.config.ts",
    url: BASE_URL,
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
