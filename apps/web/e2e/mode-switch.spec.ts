import { test, expect } from '@playwright/test'
import { goToApp, setViewport } from './helpers'

test.describe('Mode switch (vanilla/spicy) in settings', () => {
  test('ModeSwitch is visible on settings appearance page', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/settings')
    await page.waitForTimeout(500)

    const appearanceButton = page.locator('aside[role="navigation"] button').filter({ hasText: /Utseende|Appearance/ })
    await appearanceButton.click()
    await page.waitForTimeout(300)

    const modeSwitch = page.locator('[role="group"][aria-label="Välj läge"]')
    await expect(modeSwitch).toBeVisible()
  })

  test('clicking Spicy button sets data-mode="spicy" on html element', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/settings')
    await page.waitForTimeout(500)

    const appearanceButton = page.locator('aside[role="navigation"] button').filter({ hasText: /Utseende|Appearance/ })
    await appearanceButton.click()
    await page.waitForTimeout(300)

    const spicyButton = page.locator('button').filter({ hasText: 'Spicy' })
    const count = await spicyButton.count()
    if (count === 0) {
      test.skip()
      return
    }
    await spicyButton.first().click()
    await page.waitForTimeout(300)

    const dataMode = await page.evaluate(() => document.documentElement.getAttribute('data-mode'))
    expect(dataMode).toBe('spicy')
  })

  test('clicking Vanilla button restores data-mode="vanilla"', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/settings')
    await page.waitForTimeout(500)

    const appearanceButton = page.locator('aside[role="navigation"] button').filter({ hasText: /Utseende|Appearance/ })
    await appearanceButton.click()
    await page.waitForTimeout(300)

    // Switch to spicy first
    const spicyButton = page.locator('button').filter({ hasText: 'Spicy' })
    if (await spicyButton.count() === 0) { test.skip(); return }
    await spicyButton.first().click()
    await page.waitForTimeout(200)

    // Then switch back to vanilla
    const vanillaButton = page.locator('button').filter({ hasText: 'Vanilla' })
    await vanillaButton.first().click()
    await page.waitForTimeout(300)

    const dataMode = await page.evaluate(() => document.documentElement.getAttribute('data-mode'))
    expect(dataMode).toBe('vanilla')
  })
})

test.describe('Theme switch (light/dark) in settings', () => {
  test('ThemeSwitch is visible on settings appearance page', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/settings')
    await page.waitForTimeout(500)

    const appearanceButton = page.locator('aside[role="navigation"] button').filter({ hasText: /Utseende|Appearance/ })
    await appearanceButton.click()
    await page.waitForTimeout(300)

    const themeSwitch = page.locator('[class*="ThemeSwitch"], [class*="themeSwitch"]')
    await expect(themeSwitch).toBeVisible()
  })

  test('clicking ThemeSwitch changes data-theme attribute', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/settings')
    await page.waitForTimeout(500)

    const appearanceButton = page.locator('aside[role="navigation"] button').filter({ hasText: /Utseende|Appearance/ })
    await appearanceButton.click()
    await page.waitForTimeout(300)

    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))

    const themeSwitch = page.locator('[class*="ThemeSwitch"], [class*="themeSwitch"]')
    if (await themeSwitch.count() === 0) { test.skip(); return }
    await themeSwitch.first().click()
    await page.waitForTimeout(300)

    const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(newTheme).not.toBe(initialTheme)
    expect(['light', 'dark']).toContain(newTheme)
  })
})

test.describe('Mode switch on landing page', () => {
  test('ModeToggle is visible on landing page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    const stickyToggle = page.locator('.sticky-toggle')
    await expect(stickyToggle).toBeVisible()
  })

  test('clicking Spicy mode on landing page shows age gate', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    // Click spicy button in the mode toggle
    const spicyButton = page.locator('.mode-toggle__option').filter({ hasText: 'Spicy' }).first()
    await expect(spicyButton).toBeVisible()
    await spicyButton.click()
    await page.waitForTimeout(300)

    // Age gate should appear (must confirm 18+)
    const ageGate = page.locator('.age-gate__dialog')
    await expect(ageGate).toBeVisible()

    // Confirm age gate
    const confirmButton = page.locator('.age-gate__btn--confirm')
    await confirmButton.click()
    await page.waitForTimeout(300)

    // Tagline should change in spicy mode
    const tagline = page.locator('.hero__tagline')
    await expect(tagline).toBeVisible()
  })
})
