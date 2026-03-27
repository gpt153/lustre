import { test, expect } from '@playwright/test'
import { goToApp, setViewport } from './helpers'

test.describe('App-only feature gates', () => {
  test('/consent-vault shows AppOnlyPrompt', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/consent-vault')
    await page.waitForTimeout(500)

    const prompt = page.locator('[class*="appOnlyPrompt"]').first()
    await expect(prompt).toBeVisible()
  })

  test('/safe-date shows AppOnlyPrompt', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/safe-date')
    await page.waitForTimeout(500)

    const prompt = page.locator('[class*="appOnlyPrompt"]').first()
    await expect(prompt).toBeVisible()
  })

  test('consent-vault prompt has correct title', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/consent-vault')
    await page.waitForTimeout(500)

    const title = page.locator('h1')
    await expect(title).toContainText('ConsentVault')
  })

  test('safe-date prompt has correct title', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/safe-date')
    await page.waitForTimeout(500)

    const title = page.locator('h1')
    await expect(title).toContainText('SafeDate')
  })

  test('AppOnlyPrompt has store badges visible', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/consent-vault')
    await page.waitForTimeout(500)

    const storeBadges = page.locator('[class*="storeBadge"]')
    const count = await storeBadges.count()
    expect(count).toBeGreaterThan(0)
  })

  test('"Tillbaka" button is visible on AppOnlyPrompt', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/consent-vault')
    await page.waitForTimeout(500)

    const backButton = page.locator('button').filter({ hasText: 'Tillbaka' })
    await expect(backButton).toBeVisible()
  })

  test('"Tillbaka" button navigates back when clicked', async ({ page }) => {
    await setViewport(page, 'desktop')
    // First navigate to discover so there's history
    await goToApp(page, '/discover')
    await page.waitForTimeout(300)
    await page.goto('/consent-vault')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    const backButton = page.locator('button').filter({ hasText: 'Tillbaka' })
    await expect(backButton).toBeVisible()
    await backButton.click()
    await page.waitForTimeout(500)

    const url = page.url()
    expect(url).not.toContain('/consent-vault')
  })

  test('AppOnlyPrompt icon is visible', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/consent-vault')
    await page.waitForTimeout(500)

    // The prompt has an icon section (svg or icon class)
    const icon = page.locator('[class*="appOnlyPrompt"] svg, [class*="icon"]').first()
    await expect(icon).toBeVisible()
  })
})
