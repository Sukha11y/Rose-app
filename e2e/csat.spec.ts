import { analyzeA11y, expect, test } from "./fixtures"

/**
 * JIRA-123 — post-visit CSAT rating.
 *
 * Note the locators below: the stars have to be reached positionally via
 * `.nth()` because the radios carry no accessible name. Every other control in
 * this app is addressable by role + name. That asymmetry is the accessibility
 * defect showing up in the test code.
 */
test.describe("CSAT rating form", () => {
  test("submits a star rating and confirms it", async ({ page }, testInfo) => {
    const heading = page.getByRole("heading", { name: "How was your experience?" })
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeVisible()

    const stars = page.getByRole("radio")
    await expect(stars).toHaveCount(5)

    // Submission is blocked until a rating is chosen.
    const submit = page.getByRole("button", { name: "Submit rating" })
    await expect(submit).toBeDisabled()

    // Fourth star = 4 out of 5.
    await stars.nth(3).check()
    await expect(stars.nth(3)).toBeChecked()
    await expect(submit).toBeEnabled()

    await analyzeA11y(page, testInfo, "csat form filled")

    await submit.click()

    await expect(page.getByText("Thank you — we recorded your rating of 4 out of 5.")).toBeVisible()
    await expect(page.getByRole("button", { name: "Submit rating" })).toHaveCount(0)

    await analyzeA11y(page, testInfo, "csat form submitted")
  })

  test("keeps the submit button disabled until a star is chosen", async ({ page }) => {
    const submit = page.getByRole("button", { name: "Submit rating" })
    await expect(submit).toBeDisabled()

    await page.getByRole("radio").first().check()
    await expect(submit).toBeEnabled()
  })
})
