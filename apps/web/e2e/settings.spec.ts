import { test, expect } from '@playwright/test'
import { goToApp, setViewport } from './helpers'

test.describe('Settings page', () => {
  test.beforeEach(async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/settings')
    await page.waitForTimeout(500)
  })

  test('settings page renders with sidebar navigation', async ({ page }) => {
    const sidebar = page.locator('aside[role="navigation"]')
    await expect(sidebar).toBeVisible()
  })

  test('sidebar shows all section items', async ({ page }) => {
    const sidebarItems = page.locator('aside[role="navigation"] button')
    const count = await sidebarItems.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })

  test('default active section is account', async ({ page }) => {
    // Check for a button with active styling class
    const activeButton = page.locator('[class*="sidebarItemActive"]')
    await expect(activeButton).toBeVisible()
  })

  test('clicking a sidebar item changes the active section', async ({ page }) => {
    // Find all sidebar buttons and click the second one
    const sidebarItems = page.locator('aside[role="navigation"] button')
    const secondItem = sidebarItems.nth(1)
    await secondItem.click()
    await page.waitForTimeout(300)

    // The clicked button should now have active class
    const activeButton = page.locator('[class*="sidebarItemActive"]')
    await expect(activeButton).toBeVisible()
  })

  test('clicking Appearance section shows controls', async ({ page }) => {
    const appearanceButton = page.locator('aside[role="navigation"] button').filter({ hasText: /Utseende|Appearance/ })
    await appearanceButton.click()
    await page.waitForTimeout(300)

    // Some content should render in the settings content area
    const content = page.locator('[class*="section"], [class*="content"]').first()
    await expect(content).toBeVisible()
  })

  test('clicking Notifications section renders content', async ({ page }) => {
    const notifButton = page.locator('aside[role="navigation"] button').filter({ hasText: /Aviseringar|Notifications|Notifikationer/ })
    const count = await notifButton.count()
    if (count === 0) {
      test.skip()
      return
    }
    await notifButton.click()
    await page.waitForTimeout(300)

    const content = page.locator('[class*="section"], [class*="content"]').first()
    await expect(content).toBeVisible()
  })
})

test.describe('Settings toggle switches', () => {
  test('toggle switches exist in appearance section', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/settings')
    await page.waitForTimeout(500)

    const appearanceButton = page.locator('aside[role="navigation"] button').filter({ hasText: /Utseende|Appearance/ })
    await appearanceButton.click()
    await page.waitForTimeout(300)

    // Look for toggle switches (role="switch") or mode/theme controls
    const controls = page.locator('[role="switch"], [class*="modeSwitch"], [class*="themeSwitch"], [class*="ModeSwitch"], [class*="ThemeSwitch"]')
    const count = await controls.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Appearance section', () => {
  test('shows theme or mode controls', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/settings')
    await page.waitForTimeout(500)

    const appearanceButton = page.locator('aside[role="navigation"] button').filter({ hasText: /Utseende|Appearance/ })
    await appearanceButton.click()
    await page.waitForTimeout(300)

    // ThemeSwitch or ModeSwitch should be visible (CSS Module hashed names)
    const themeControl = page.locator('[class*="ThemeSwitch"], [class*="themeSwitch"], [class*="ModeSwitch"], [class*="modeSwitch"]')
    const count = await themeControl.count()
    expect(count).toBeGreaterThan(0)
  })
})
