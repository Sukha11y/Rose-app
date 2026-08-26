import {
  addToOrder,
  cardStepper,
  cartTrigger,
  expect,
  floatingOrderBar,
  money,
  productCard,
  PRODUCTS,
  test,
} from "./fixtures"

const { croissant, miche } = PRODUCTS

test.describe("Adding products to the order", () => {
  test("swaps the card CTA for a stepper and updates the header and order bar", async ({ page }) => {
    await expect(cartTrigger(page)).toHaveAccessibleName("Open order cart")
    await expect(floatingOrderBar(page)).toHaveCount(0)

    await addToOrder(page, croissant.name)

    // The "Add to Order" CTA is replaced in place by the quantity stepper.
    await expect(
      productCard(page, croissant.name).getByRole("button", { name: `Add ${croissant.name} to order` }),
    ).toHaveCount(0)
    await expect(cardStepper(page, croissant.name).getByText("1", { exact: true })).toBeVisible()

    // Singular wording on the first item.
    await expect(cartTrigger(page)).toHaveAccessibleName("Open order cart, 1 item")
    await expect(floatingOrderBar(page)).toHaveAccessibleName(
      `View order, 1 item, ${money(croissant.price)}`,
    )

    // A second, different product flips the copy to plural and re-totals.
    await addToOrder(page, miche.name)

    await expect(cartTrigger(page)).toHaveAccessibleName("Open order cart, 2 items")
    await expect(floatingOrderBar(page)).toHaveAccessibleName(
      `View order, 2 items, ${money(croissant.price + miche.price)}`,
    )
  })

  test("stepping the quantity back to zero restores the card CTA", async ({ page }) => {
    await addToOrder(page, croissant.name)

    const stepper = cardStepper(page, croissant.name)
    await stepper.getByRole("button", { name: `Add another ${croissant.name}` }).click()
    await expect(stepper.getByText("2", { exact: true })).toBeVisible()

    await stepper.getByRole("button", { name: `Remove one ${croissant.name}` }).click()
    await stepper.getByRole("button", { name: `Remove one ${croissant.name}` }).click()

    await expect(cardStepper(page, croissant.name)).toHaveCount(0)
    await expect(
      productCard(page, croissant.name).getByRole("button", { name: `Add ${croissant.name} to order` }),
    ).toBeVisible()
    await expect(cartTrigger(page)).toHaveAccessibleName("Open order cart")
    await expect(floatingOrderBar(page)).toHaveCount(0)
  })
})
