import { test, expect } from '@playwright/test'
import { goToApp, setViewport } from './helpers'

test.describe('Wave 1: Layout renders at all breakpoints', () => {
  for (const bp of [
    { name: 'wide', width: 1440 },
    { name: 'desktop', width: 1200 },
    { name: 'tablet', width: 900 },
    { name: 'mobile', width: 600 },
    { name: 'mobile-small', width: 375 },
  ] as const) {
    test(`renders at ${bp.name} (${bp.width}px) without overflow`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: 900 })
      await goToApp(page, '/discover')
      await page.waitForTimeout(400)

      const main = page.locator('main')
      await expect(main).toBeVisible()

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 50)
    })
  }
})

test.describe('Wave 1: NavRail visible on desktop (>=900px)', () => {
  test('NavRail is visible at 1440px', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    const navRail = page.locator('nav[aria-label="Huvudnavigation"]')
    await expect(navRail).toBeVisible()
  })

  test('NavRail has Discover, Chat, Feed, Profile links', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    const nav = page.locator('nav[aria-label="Huvudnavigation"]')
    for (const label of ['Discover', 'Chat', 'Feed', 'Profile']) {
      await expect(nav.locator(`text=${label}`)).toBeVisible()
    }
  })

  test('NavRail has "Mer" expandable button', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    const nav = page.locator('nav[aria-label="Huvudnavigation"]')
    const merButton = nav.locator('button[aria-label="Mer navigation"]')
    await expect(merButton).toBeVisible()
  })
})

test.describe('Wave 1: BottomNav visible on mobile (<900px)', () => {
  test('BottomNav is visible at 600px', async ({ page }) => {
    await setViewport(page, 'mobile')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    const bottomNav = page.locator('nav[aria-label="Mobilnavigation"]')
    await expect(bottomNav).toBeVisible()
  })

  test('NavRail is not visible at 600px', async ({ page }) => {
    await setViewport(page, 'mobile')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    const navRail = page.locator('nav[aria-label="Huvudnavigation"]')
    await expect(navRail).not.toBeVisible()
  })
})

test.describe('Wave 1: Header renders with glassmorphism', () => {
  test('header is visible with role="banner"', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    const header = page.locator('header[role="banner"]')
    await expect(header).toBeVisible()
  })

  test('header has backdrop-filter for glassmorphism', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    const header = page.locator('header[role="banner"]')
    const backdropFilter = await header.evaluate(el => getComputedStyle(el).backdropFilter)
    expect(backdropFilter).toContain('blur')
  })

  test('header contains Lustre logo text', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    const header = page.locator('header[role="banner"]')
    const logoText = await header.textContent()
    expect(logoText).toContain('Lustre')
  })
})

test.describe('Wave 1: Theme toggle switches between light/dark', () => {
  test('clicking theme toggle changes data-theme attribute', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))

    // Click the theme toggle button (sun/moon icon)
    const themeButton = page.locator('button[aria-label*="tema"]')
    await themeButton.click()
    await page.waitForTimeout(300)

    const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(newTheme).not.toBe(initialTheme)
    expect(['light', 'dark']).toContain(newTheme)
  })
})

test.describe('Wave 1: Mode toggle switches between vanilla/spicy', () => {
  test('clicking mode toggle changes data-mode attribute', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    const initialMode = await page.evaluate(() => document.documentElement.getAttribute('data-mode'))

    // Click the mode toggle button (Vanilla/Spicy pill)
    const modeButton = page.locator('button[aria-label*="läge"]')
    await modeButton.click()
    await page.waitForTimeout(300)

    const newMode = await page.evaluate(() => document.documentElement.getAttribute('data-mode'))
    expect(newMode).not.toBe(initialMode)
    expect(['vanilla', 'spicy']).toContain(newMode)
  })
})

test.describe('Wave 1: CSS custom properties update on theme/mode change', () => {
  test('accent HSL values change when switching to spicy mode', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    // Get vanilla accent hue
    const vanillaH = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent-h').trim()
    )

    // Switch to spicy
    await page.evaluate(() => document.documentElement.setAttribute('data-mode', 'spicy'))
    await page.waitForTimeout(100)

    const spicyH = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent-h').trim()
    )

    expect(vanillaH).not.toBe(spicyH)
  })

  test('background colors change when switching to dark theme', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    // Ensure light mode
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
    await page.waitForTimeout(100)
    const lightBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary').trim()
    )

    // Switch to dark
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
    await page.waitForTimeout(100)
    const darkBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary').trim()
    )

    expect(lightBg).not.toBe(darkBg)
  })
})

test.describe('Wave 1: Navigation links render and are clickable', () => {
  test('nav links navigate to correct routes', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    const nav = page.locator('nav[aria-label="Huvudnavigation"]')

    // Click Chat link
    await nav.locator('a:has-text("Chat")').click()
    await page.waitForURL('**/chat**', { timeout: 5000 })
    expect(page.url()).toContain('/chat')
  })
})

test.describe('Wave 1: Typography classes render correctly', () => {
  test('page title uses correct font family', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    // The discover page has a heading
    const heading = page.locator('h1, h2, [class*="text-section"], [class*="text-hero"]').first()
    const fontFamily = await heading.evaluate(el => getComputedStyle(el).fontFamily)
    // Should contain Inter or General Sans (our configured fonts)
    expect(fontFamily.toLowerCase()).toMatch(/inter|general\s*sans/)
  })
})

test.describe('Wave 1: Page transitions fire on navigation', () => {
  test('page transition container exists with viewTransitionName style', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover')
    await page.waitForTimeout(400)

    const hasViewTransitionName = await page.evaluate(() => {
      const allEls = document.querySelectorAll('*')
      for (const el of allEls) {
        if (el.style.viewTransitionName) return true
      }
      // Also check computed style
      for (const el of allEls) {
        const computed = getComputedStyle(el).viewTransitionName
        if (computed && computed !== 'none' && computed !== '') return true
      }
      return false
    })
    expect(hasViewTransitionName).toBe(true)
  })
})
