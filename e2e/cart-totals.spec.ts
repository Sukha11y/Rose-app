import {
  addToOrder,
  cartLine,
  expect,
  money,
  openCart,
  placeOrderButton,
  PRODUCTS,
  stockBasket,
  subtotalRow,
  test,
} from "./fixtures"

const { croissant, miche } = PRODUCTS

const LINE_CROISSANT = croissant.price * 2 // 2 × $4.50 = $9.00
const LINE_MICHE = miche.price // 1 × $12.00
const SUBTOTAL = LINE_CROISSANT + LINE_MICHE // $21.00

test.describe("Cart drawer pricing", () => {
  test("lists every line with its unit price, line total and a correct subtotal", async ({ page }) => {
    await stockBasket(page, croissant.name, 2)
    await addToOrder(page, miche.name)

    const drawer = await openCart(page)
    await expect(drawer.getByRole("listitem")).toHaveCount(2)

    const croissantLine = cartLine(drawer, croissant.name)
    await expect(croissantLine.getByText(`${money(croissant.price)} each`)).toBeVisible()
    await expect(croissantLine.getByText("2", { exact: true })).toBeVisible()
    await expect(croissantLine.getByText(money(LINE_CROISSANT), { exact: true })).toBeVisible()

    const micheLine = cartLine(drawer, miche.name)
    await expect(micheLine.getByText(`${money(miche.price)} each`)).toBeVisible()
    await expect(micheLine.getByText("1", { exact: true })).toBeVisible()
    await expect(micheLine.getByText(money(LINE_MICHE), { exact: true })).toBeVisible()

    await expect(subtotalRow(drawer, SUBTOTAL)).toHaveCount(1)
    await expect(placeOrderButton(drawer)).toContainText(money(SUBTOTAL))
  })

  test("re-totals when a quantity changes inside the drawer", async ({ page }) => {
    await stockBasket(page, croissant.name, 2)
    await addToOrder(page, miche.name)

    const drawer = await openCart(page)
    await expect(subtotalRow(drawer, SUBTOTAL)).toHaveCount(1)

    await cartLine(drawer, croissant.name)
      .getByRole("button", { name: `Add another ${croissant.name}` })
      .click()

    const updated = SUBTOTAL + croissant.price // $25.50
    await expect(cartLine(drawer, croissant.name).getByText(money(croissant.price * 3), { exact: true }))
      .toBeVisible()
    await expect(subtotalRow(drawer, updated)).toHaveCount(1)
    await expect(placeOrderButton(drawer)).toContainText(money(updated))
  })
})
