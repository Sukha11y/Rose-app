import type { Page } from "@playwright/test"

import {
  addToOrder,
  cartLine,
  cartTrigger,
  clearBasketButton,
  closeCartButton,
  expect,
  money,
  openCart,
  placeOrderButton,
  productCard,
  PRODUCTS,
  stockBasket,
  subtotalRow,
  test,
} from "./fixtures"

const { croissant, miche } = PRODUCTS

/** 2 × croissant + 1 × miche, drawer open. */
async function openStockedDrawer(page: Page) {
  await stockBasket(page, croissant.name, 2)
  await addToOrder(page, miche.name)
  return openCart(page)
}

test.describe("Emptying the basket", () => {
  test("decrementing a line to zero removes it, then empties the drawer", async ({ page }) => {
    const drawer = await openStockedDrawer(page)
    const croissantLine = cartLine(drawer, croissant.name)
    const removeCroissant = croissantLine.getByRole("button", { name: `Remove one ${croissant.name}` })

    // 2 → 1: the line stays, quantity and line total both drop.
    await removeCroissant.click()
    await expect(croissantLine.getByText("1", { exact: true })).toBeVisible()
    await expect(croissantLine.getByText(money(croissant.price), { exact: true })).toBeVisible()
    await expect(subtotalRow(drawer, croissant.price + miche.price)).toHaveCount(1)

    // 1 → 0: the line is dropped rather than left showing a zero quantity.
    await removeCroissant.click()
    await expect(cartLine(drawer, croissant.name)).toHaveCount(0)
    await expect(subtotalRow(drawer, miche.price)).toHaveCount(1)
    await expect(cartTrigger(page)).toHaveAccessibleName("Open order cart, 1 item")

    // Last line out: the whole checkout footer is replaced by the empty state.
    await cartLine(drawer, miche.name)
      .getByRole("button", { name: `Remove one ${miche.name}` })
      .click()
    await expect(drawer.getByText("Your basket is empty.")).toBeVisible()
    await expect(placeOrderButton(drawer)).toHaveCount(0)
    await expect(clearBasketButton(drawer)).toHaveCount(0)
    await expect(cartTrigger(page)).toHaveAccessibleName("Open order cart")
  })

  test("clear basket wipes the order and resets the menu cards", async ({ page }) => {
    const drawer = await openStockedDrawer(page)

    await clearBasketButton(drawer).click()

    await expect(drawer.getByText("Your basket is empty.")).toBeVisible()
    await expect(cartLine(drawer, croissant.name)).toHaveCount(0)
    await expect(cartLine(drawer, miche.name)).toHaveCount(0)
    await expect(cartTrigger(page)).toHaveAccessibleName("Open order cart")

    await closeCartButton(drawer).click()
    await expect(
      productCard(page, croissant.name).getByRole("button", { name: `Add ${croissant.name} to order` }),
    ).toBeVisible()
  })
})
