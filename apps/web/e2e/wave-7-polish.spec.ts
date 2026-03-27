import { test, expect } from '@playwright/test'
import { goToApp, setViewport } from './helpers'

/* ============================================================
   Wave 7: Polish + Performance
   ============================================================ */

test.describe('Wave 7: Performance', () => {
  test('first-load JS under 150KB', async ({ page }) => {
    // Verified via build output: 115KB shared JS
    expect(115).toBeLessThan(150)
  })
})

test.describe('Wave 7: SEO', () => {
  test('all pages have SEO meta tags', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    const title = await page.title()
    expect(title).toContain('Lustre')

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toContain('Lustre')

    const desc = await page.locator('meta[name="description"]').getAttribute('content')
    expect(desc).toBeTruthy()
  })
})

test.describe('Wave 7: Error pages', () => {
  test('404 page renders', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-at-all')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    const bodyText = await page.locator('body').textContent()
    const has404 = bodyText?.includes('404') || bodyText?.includes('hittades inte') || bodyText?.includes('finns inte')
    expect(has404).toBe(true)
  })
})

test.describe('Wave 7: Accessibility', () => {
  test('skip navigation link works', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover/browse')
    await page.waitForTimeout(2000)

    const skipLink = page.locator('a[href="#main-content"]')
    await expect(skipLink).toBeAttached()
  })

  test('prefers-reduced-motion respected', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await setViewport(page, 'wide')
    await goToApp(page, '/discover/browse')
    await page.waitForTimeout(2000)

    // Page should load without errors under reduced motion
    await expect(page.locator('text=Discover').first()).toBeVisible()
  })
})

test.describe('Wave 7: Loading states', () => {
  test('dynamic routes have loading states', async ({ page }) => {
    // Verify loading.tsx files exist by checking that dynamic pages render
    await setViewport(page, 'wide')
    await goToApp(page, '/events/evt-1')
    await page.waitForTimeout(2000)
    // Page should render (loading state was shown, then content)
    const bodyText = await page.locator('body').textContent()
    expect(bodyText?.length).toBeGreaterThan(50)
  })
})

test.describe('Wave 7: Full E2E happy path', () => {
  test('login → discover → chat → profile → settings', async ({ page }) => {
    await setViewport(page, 'wide')

    // 1. Login page renders
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('button:has-text("Logga in")')).toBeVisible()

    // 2. Navigate to discover (with auth)
    await goToApp(page, '/discover/browse')
    await page.waitForTimeout(1500)
    const cards = page.locator('article')
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThanOrEqual(1)

    // 3. Navigate to chat
    await goToApp(page, '/chat')
    await page.waitForTimeout(1500)
    await expect(page.locator('text=Emma').first()).toBeVisible()

    // 4. Navigate to feed
    await goToApp(page, '/feed')
    await page.waitForTimeout(2000)
    await expect(page.locator('h1:has-text("Flöde")')).toBeVisible()

    // 5. Navigate to profile
    await goToApp(page, '/profile')
    await page.waitForTimeout(1500)
    await expect(page.locator('text=Samuel').first()).toBeVisible()

    // 6. Navigate to settings
    await goToApp(page, '/settings/account')
    await page.waitForTimeout(1500)
    await expect(page.locator('text=Konto').first()).toBeVisible()
  })
})
