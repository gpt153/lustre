import { test, expect } from '@playwright/test'
import { goToApp, setViewport } from './helpers'

/* ============================================================
   Wave 6: Secondary Pages
   ============================================================ */

test.describe('Wave 6: Events', () => {
  test('event list loads with event cards', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/events')
    await page.waitForTimeout(2000)

    await expect(page.locator('text=Evenemang').first()).toBeVisible()
    const cards = page.locator('article')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('event detail page shows RSVP button', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/events/evt-1')
    await page.waitForTimeout(2000)

    const pageText = await page.locator('body').textContent()
    const hasRsvp = pageText?.includes('Anmäl') || pageText?.includes('RSVP') || pageText?.includes('anmäl')
    expect(hasRsvp).toBe(true)
  })
})

test.describe('Wave 6: Groups', () => {
  test('group list loads with group cards', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/groups')
    await page.waitForTimeout(2000)

    await expect(page.locator('text=Grupper').first()).toBeVisible()
    const cards = page.locator('article')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('group detail page shows join button', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/groups/grp-1')
    await page.waitForTimeout(2000)

    const pageText = await page.locator('body').textContent()
    const hasJoin = pageText?.includes('Gå med') || pageText?.includes('Lämna') || pageText?.includes('medlem')
    expect(hasJoin).toBe(true)
  })
})

test.describe('Wave 6: Learn', () => {
  test('module grid displays', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/learn')
    await page.waitForTimeout(2000)

    const pageText = await page.locator('body').textContent()
    const hasLearn = pageText?.toLowerCase().includes('lärande') || pageText?.toLowerCase().includes('modul')
    expect(hasLearn).toBe(true)
  })

  test('lesson page renders content', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/learn/mod-1/lesson/les-1')
    await page.waitForTimeout(2000)

    // Lesson should have some content - persona names or session buttons
    const pageText = await page.locator('body').textContent()
    const hasContent = pageText?.includes('Axel') || pageText?.includes('Sophia') || pageText?.includes('Lektion') || pageText?.includes('session')
    expect(hasContent).toBe(true)
  })

  test('achievements page displays badges', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/learn/achievements')
    await page.waitForTimeout(2000)

    const pageText = await page.locator('body').textContent()
    const hasAchievements = pageText?.toLowerCase().includes('prestation') || pageText?.toLowerCase().includes('badge') || pageText?.toLowerCase().includes('streak')
    expect(hasAchievements).toBe(true)
  })
})

test.describe('Wave 6: Shop', () => {
  test('product grid loads', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/shop')
    await page.waitForTimeout(2000)

    const pageText = await page.locator('body').textContent()
    const hasShop = pageText?.toLowerCase().includes('marknadsplats') || pageText?.toLowerCase().includes('produkt') || pageText?.toLowerCase().includes('shop')
    expect(hasShop).toBe(true)
  })

  test('product detail renders', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/shop/prod-1')
    await page.waitForTimeout(2000)

    const pageText = await page.locator('body').textContent()
    const hasDetail = pageText?.includes('kr') || pageText?.includes('Köp') || pageText?.includes('SEK')
    expect(hasDetail).toBe(true)
  })
})

test.describe('Wave 6: Invite', () => {
  test('invite page renders', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/invite')
    await page.waitForTimeout(2000)

    const pageText = await page.locator('body').textContent()
    const hasInvite = pageText?.includes('Bjud in') || pageText?.includes('invite') || pageText?.includes('token')
    expect(hasInvite).toBe(true)
  })
})

test.describe('Wave 6: Onboarding', () => {
  test('wizard renders first step', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/onboarding')
    await page.waitForTimeout(2000)

    const pageText = await page.locator('body').textContent()
    // Step 1 should show name/birthdate fields or welcome text
    const hasOnboarding = pageText?.includes('Välkommen') || pageText?.includes('Namn') || pageText?.includes('namn') || pageText?.includes('Steg')
    expect(hasOnboarding).toBe(true)
  })

  test('onboarding has progress indicator', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/onboarding')
    await page.waitForTimeout(2000)

    // Should have a progress bar or step indicator
    const progressBar = page.locator('[role="progressbar"], [class*="progress"], [class*="Progress"]')
    const count = await progressBar.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})
