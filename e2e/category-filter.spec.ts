import {
  addToOrder,
  analyzeA11y,
  cardStepper,
  cartTrigger,
  categoryPill,
  expect,
  filterAnnouncement,
  productCard,
  productCards,
  PRODUCTS,
  test,
} from "./fixtures"

const { croissant, miche } = PRODUCTS

test.describe("Filtering the menu by category", () => {
  test("narrows the grid and announces the new count", async ({ page }, testInfo) => {
    await expect(productCards(page)).toHaveCount(8)
    await expect(filterAnnouncement(page)).toHaveText("8 products shown")
    await expect(categoryPill(page, "All")).toHaveAttribute("aria-pressed", "true")

    await categoryPill(page, "Breads").click()

    await expect(categoryPill(page, "Breads")).toHaveAttribute("aria-pressed", "true")
    await expect(categoryPill(page, "All")).toHaveAttribute("aria-pressed", "false")
    await expect(productCards(page)).toHaveCount(3)
    await expect(filterAnnouncement(page)).toHaveText("3 products shown")
    await expect(productCard(page, miche.name)).toBeVisible()
    await expect(productCard(page, croissant.name)).toHaveCount(0)

    await categoryPill(page, "Pastries").click()

    await expect(productCards(page)).toHaveCount(2)
    await expect(filterAnnouncement(page)).toHaveText("2 products shown")
    await expect(productCard(page, PRODUCTS.tart.name)).toBeVisible()
    await expect(productCard(page, miche.name)).toHaveCount(0)

    // A filtered grid is a distinct rendering — analyse it before resetting.
    await analyzeA11y(page, testInfo, "filtered to Pastries")

    await categoryPill(page, "All").click()

    await expect(productCards(page)).toHaveCount(8)
    await expect(filterAnnouncement(page)).toHaveText("8 products shown")

    await analyzeA11y(page, testInfo, "unfiltered grid")
  })

  test("keeps basket quantities when a filtered-out card comes back", async ({ page }, testInfo) => {
    await addToOrder(page, croissant.name)
    await expect(cartTrigger(page)).toHaveAccessibleName("Open order cart, 1 item")

    // Croissant is Viennoiserie, so this filter unmounts its card entirely.
    await categoryPill(page, "Breads").click()
    await expect(productCard(page, croissant.name)).toHaveCount(0)
    await expect(cartTrigger(page)).toHaveAccessibleName("Open order cart, 1 item")

    await categoryPill(page, "Viennoiserie").click()
    await expect(cardStepper(page, croissant.name).getByText("1", { exact: true })).toBeVisible()

    await analyzeA11y(page, testInfo)
  })
})
