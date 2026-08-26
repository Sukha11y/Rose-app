import { levelAnalyze, levelSetup } from "@level-ci/a11y-playwright"
import { test as base, expect, type Locator, type Page, type TestInfo } from "@playwright/test"

/**
 * Shared fixture + locator helpers for the Pétale storefront specs.
 *
 * Every interactive element in the app already carries a descriptive
 * `aria-label`, so these helpers resolve by role/accessible name rather than
 * test ids. That keeps the specs readable *and* makes them fail if the
 * accessibility labelling regresses.
 */

/** Product imagery is remote; none of these specs assert on it. */
const REMOTE_IMAGES = /images\.unsplash\.com/

/** Where Level CI writes its accessibility reports. Gitignored. */
export const LEVEL_CI_REPORT_PATH = "./level-ci-reports"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Playwright's documented shape for "no extra test-scoped fixtures".
export const test = base.extend<{}, { levelCi: void }>({
  // Worker-scoped and automatic: Playwright has no Cypress-style support file,
  // so this is the equivalent hook — it runs once per worker process before any
  // test in that worker.
  levelCi: [
    async ({}, use) => {
      levelSetup({ reportPath: LEVEL_CI_REPORT_PATH })
      await use()
    },
    { scope: "worker", auto: true },
  ],

  page: async ({ page }, use) => {
    await page.route(REMOTE_IMAGES, (route) => route.abort())
    await page.goto("/")
    await use(page)
  },
})

export { expect }

/**
 * Runs a Level CI static accessibility analysis of the page's current state.
 *
 * Call it at the end of a test (or at any interesting intermediate state —
 * each call writes its own report). Passing `testInfo` labels the report with
 * the spec/describe/test titles so the reports are distinguishable in the
 * Level CI dashboard; `label` distinguishes multiple analyses within one test.
 */
export async function analyzeA11y(page: Page, testInfo: TestInfo, label?: string) {
  const testPath = [...testInfo.titlePath, label].filter(
    (segment): segment is string => typeof segment === "string" && segment.length > 0,
  )
  return levelAnalyze(page, { testPath })
}

export { levelAnalyze }

export const money = (amount: number) => `$${amount.toFixed(2)}`

export const PRODUCTS = {
  croissant: { name: "Butter Croissant", price: 4.5, category: "Viennoiserie" },
  miche: { name: "Sourdough Miche", price: 12.0, category: "Breads" },
  tart: { name: "Raspberry Rose Tart", price: 8.5, category: "Pastries" },
} as const

/* ── Menu grid ───────────────────────────────────────────────────────────── */

export const productGrid = (page: Page) => page.getByRole("list", { name: "Bakery products" })

export const productCards = (page: Page) => productGrid(page).getByRole("listitem")

export const productCard = (page: Page, name: string) => page.getByRole("article", { name })

export const categoryPill = (page: Page, label: string) =>
  page.getByRole("button", { name: label, exact: true })

/** The visually-hidden live region that announces the filter result count. */
export const filterAnnouncement = (page: Page) => page.getByText(/^\d+ products? shown$/)

/** Clicks the card's "Add to Order" CTA (only present while qty is 0). */
export async function addToOrder(page: Page, name: string) {
  await productCard(page, name).getByRole("button", { name: `Add ${name} to order` }).click()
}

/** The +/− stepper that replaces the CTA once the product is in the basket. */
export const cardStepper = (page: Page, name: string) =>
  productCard(page, name).getByRole("group", { name: `${name} quantity` })

/* ── Header / order bar ──────────────────────────────────────────────────── */

export const cartTrigger = (page: Page) => page.getByRole("button", { name: "Open order cart" })

export const floatingOrderBar = (page: Page) => page.getByRole("button", { name: /^View order,/ })

/* ── Cart drawer ─────────────────────────────────────────────────────────── */

export const cartDrawer = (page: Page) => page.getByRole("dialog", { name: "Your order" })

export async function openCart(page: Page) {
  await cartTrigger(page).click()
  const drawer = cartDrawer(page)
  await expect(drawer).toBeVisible()
  return drawer
}

export const cartLine = (drawer: Locator, name: string) =>
  drawer.getByRole("listitem").filter({ hasText: name })

export const closeCartButton = (drawer: Locator) => drawer.getByRole("button", { name: "Close cart" })

export const placeOrderButton = (drawer: Locator) => drawer.getByRole("button", { name: /^Place Order/ })

export const clearBasketButton = (drawer: Locator) =>
  drawer.getByRole("button", { name: "Clear basket" })

/**
 * The subtotal row renders as two sibling spans, so its own text content is
 * exactly `Subtotal$21.00`. Anchoring the regex keeps ancestors from matching.
 */
export const subtotalRow = (drawer: Locator, total: number) => {
  const amount = money(total).replace(/[$.]/g, (char) => `\\${char}`)
  return drawer.locator("div").filter({ hasText: new RegExp(`^Subtotal${amount}$`) })
}

/** Adds `qty` of a product from the menu grid without opening the drawer. */
export async function stockBasket(page: Page, name: string, qty: number) {
  await addToOrder(page, name)
  for (let i = 1; i < qty; i++) {
    await cardStepper(page, name).getByRole("button", { name: `Add another ${name}` }).click()
  }
  await expect(cardStepper(page, name).getByText(String(qty), { exact: true })).toBeVisible()
}
