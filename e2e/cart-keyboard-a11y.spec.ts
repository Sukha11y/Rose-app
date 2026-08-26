import {
  cartDrawer,
  cartTrigger,
  clearBasketButton,
  closeCartButton,
  expect,
  openCart,
  PRODUCTS,
  stockBasket,
  test,
} from "./fixtures"

const { croissant } = PRODUCTS

/**
 * The drawer is the only modal surface in the app, so its keyboard contract —
 * initial focus, focus trap, Escape, focus restore — is a first-class workflow
 * here rather than a nice-to-have.
 */
test.describe("Cart drawer keyboard and focus behaviour", () => {
  test("traps Tab, closes on Escape and returns focus to the trigger", async ({ page }) => {
    await stockBasket(page, croissant.name, 1)

    const trigger = cartTrigger(page)
    await expect(trigger).toHaveAttribute("aria-expanded", "false")

    const drawer = await openCart(page)
    await expect(trigger).toHaveAttribute("aria-expanded", "true")

    // Focus moves into the dialog, onto its first focusable element.
    const close = closeCartButton(drawer)
    await expect(close).toBeFocused()

    // Tab off the last focusable wraps back to the first.
    const clear = clearBasketButton(drawer)
    await clear.focus()
    await expect(clear).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(close).toBeFocused()

    // Shift+Tab off the first wraps to the last.
    await page.keyboard.press("Shift+Tab")
    await expect(clear).toBeFocused()

    await page.keyboard.press("Escape")

    await expect(cartDrawer(page)).toHaveCount(0)
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await expect(trigger).toBeFocused()
  })

  test("clicking the backdrop closes the drawer without discarding the basket", async ({ page }) => {
    await stockBasket(page, croissant.name, 2)
    await openCart(page)

    // The drawer is right-aligned and capped at 380px, so the far left of the
    // viewport is backdrop.
    await page.mouse.click(60, 300)

    await expect(cartDrawer(page)).toHaveCount(0)
    await expect(cartTrigger(page)).toHaveAccessibleName("Open order cart, 2 items")
    await expect(cartTrigger(page)).toBeFocused()
  })
})
