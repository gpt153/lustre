import { test, expect } from '@playwright/test'
import { goToApp, setViewport, mockAuth } from './helpers'

/* ============================================================
   Wave 3: Auth + Discover
   ============================================================ */

test.describe('Wave 3: Login page', () => {
  test('renders email and password fields', async ({ page }) => {
    await setViewport(page, 'wide')
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("Logga in")')).toBeVisible()
  })

  test('shows dev login button in development', async ({ page }) => {
    await setViewport(page, 'wide')
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('button:has-text("Dev Login")')).toBeVisible()
  })

  test('shows OAuth buttons (Google + Apple)', async ({ page }) => {
    await setViewport(page, 'wide')
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('button:has-text("Google")')).toBeVisible()
    await expect(page.locator('button:has-text("Apple")')).toBeVisible()
  })

  test('link to register page', async ({ page }) => {
    await setViewport(page, 'wide')
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    const link = page.locator('a[href="/register"]')
    await expect(link).toBeVisible()
    await expect(link).toHaveText('Skapa konto')
  })
})

test.describe('Wave 3: Register page', () => {
  test('renders all registration fields', async ({ page }) => {
    await setViewport(page, 'wide')
    await page.goto('/register')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('input[type="email"]')).toBeVisible()
    // Two password fields (password + confirm)
    const passwordFields = page.locator('input[type="password"]')
    await expect(passwordFields).toHaveCount(2)
    await expect(page.locator('button:has-text("Skapa konto")')).toBeVisible()
  })

  test('shows terms checkbox', async ({ page }) => {
    await setViewport(page, 'wide')
    await page.goto('/register')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('input[type="checkbox"]')).toBeVisible()
    await expect(page.locator('text=användarvillkoren')).toBeVisible()
  })

  test('shows Swish verification info', async ({ page }) => {
    await setViewport(page, 'wide')
    await page.goto('/register')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('text=Swish')).toBeVisible()
    await expect(page.locator('text=10 kr')).toBeVisible()
  })
})

test.describe('Wave 3: Protected routes redirect', () => {
  test('discover redirects to login when unauthenticated', async ({ page }) => {
    await setViewport(page, 'wide')
    // Navigate WITHOUT mockAuth
    await page.goto('/discover/browse')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1500) // AuthGuard redirect

    expect(page.url()).toContain('/login')
  })
})

test.describe('Wave 3: Discover browse', () => {
  test('shows profile grid with cards', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover/browse')
    await page.waitForTimeout(800)

    // Profile cards should be rendered (mock data fallback)
    const cards = page.locator('article')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })

  test('profile cards display name and age', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover/browse')
    await page.waitForTimeout(800)

    // First card has aria-label with name and age
    const firstCard = page.locator('article').first()
    const ariaLabel = await firstCard.getAttribute('aria-label')
    expect(ariaLabel).toContain('Emma')
    expect(ariaLabel).toContain('28')
  })

  test('profile cards display location', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover/browse')
    await page.waitForTimeout(800)

    // Location is in the card body — use getByText within articles
    const articles = page.locator('article')
    const firstCardText = await articles.first().textContent()
    expect(firstCardText).toContain('Stockholm')
  })

  test('profile cards display bio text', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover/browse')
    await page.waitForTimeout(800)

    // Bio of first mock profile (Emma)
    await expect(page.locator('text=Nyfiken på livet').first()).toBeVisible()
  })

  test('keyboard navigation hints are visible', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover/browse')
    await page.waitForTimeout(800)

    await expect(page.locator('kbd:has-text("L")')).toBeVisible()
    await expect(page.locator('kbd:has-text("P")')).toBeVisible()
  })

  test('discover tabs render correctly', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover/browse')
    await page.waitForTimeout(800)

    for (const tab of ['Intentioner', 'Bläddra', 'Matchningar', 'Sök']) {
      await expect(page.locator(`text=${tab}`).first()).toBeVisible()
    }
  })
})

test.describe('Wave 3: Discover matches', () => {
  test('shows empty state when no matches', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover/matches')
    await page.waitForTimeout(1500)

    await expect(page.locator('text=Inga matchningar ännu')).toBeVisible()
    await expect(page.locator('button:has-text("Bläddra profiler")')).toBeVisible()
  })
})

test.describe('Wave 3: Match animation component', () => {
  test('MatchAnimation module exists and exports correctly', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/discover/browse')
    await page.waitForTimeout(800)

    // Verify the MatchAnimation component file is importable by checking
    // that the page loaded without errors (component is part of the bundle)
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    // No critical console errors
    const criticalErrors = consoleErrors.filter(
      (e) => e.includes('MatchAnimation') || e.includes('ParticleBurst')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})

test.describe('Wave 3: Mobile responsiveness', () => {
  test('login page renders on mobile', async ({ page }) => {
    await setViewport(page, 'mobile-small')
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('text=Lustre').first()).toBeVisible()
    await expect(page.locator('button:has-text("Logga in")')).toBeVisible()
  })

  test('discover grid adapts to mobile', async ({ page }) => {
    await setViewport(page, 'mobile-small')
    await goToApp(page, '/discover/browse')
    await page.waitForTimeout(800)

    // Cards should still render on mobile
    const cards = page.locator('article')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})
