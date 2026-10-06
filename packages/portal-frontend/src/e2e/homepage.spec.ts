import { expect, test } from '@playwright/test'

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

test.describe('Homepage', () => {
  test('loads and renders hero section', async ({ page }) => {
    await page.goto(baseUrl)

    await expect(page).toHaveTitle(/.+/)
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('search bar is present and interactive', async ({ page }) => {
    await page.goto(baseUrl)

    const searchInput = page.getByRole('combobox').first()
    await expect(searchInput).toBeVisible()
    await searchInput.click()
    await searchInput.fill('Toronto')
  })

  test('navigation links are present', async ({ page }) => {
    await page.goto(baseUrl)

    const nav = page.getByRole('banner')
    await expect(nav).toBeVisible()

    // At least one nav link should be present
    const links = nav.getByRole('link')
    await expect(links.first()).toBeVisible()
  })

  test('footer is present', async ({ page }) => {
    await page.goto(baseUrl)

    await expect(page.getByRole('contentinfo')).toBeVisible()
  })
})
