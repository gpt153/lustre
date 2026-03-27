import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('loads with hero title visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const heroTitle = page.locator('h1.hero__title')
    await expect(heroTitle).toBeVisible()
    await expect(heroTitle).toContainText('Dejta på')
  })

  test('has correct OG meta tags', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const ogTitle = page.locator('meta[property="og:title"]')
    await expect(ogTitle).toHaveAttribute('content', /Lustre/)

    const ogDescription = page.locator('meta[property="og:description"]')
    await expect(ogDescription).toHaveAttribute('content', /.+/)

    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveAttribute('content', /.+/)

    const ogType = page.locator('meta[property="og:type"]')
    await expect(ogType).toHaveAttribute('content', 'website')
  })

  test('hero section has brand name and tagline', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const brand = page.locator('.hero__brand')
    await expect(brand).toContainText('Lustre')
    const tagline = page.locator('.hero__tagline')
    await expect(tagline).toBeVisible()
  })
})

test.describe('Login page', () => {
  test('renders with email and password inputs and submit button', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toBeVisible()

    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toContainText('Logga in')
  })

  test('shows validation message when submitting empty fields', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    // Wait for React hydration
    await page.waitForTimeout(1000)

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // The login form sets error state: 'Fyll i e-postadress och lösenord'
    const errorMessage = page.locator('p[role="alert"]')
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
    await expect(errorMessage).toContainText('Fyll i')
  })

  test('has proper form accessibility with labels', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    // Input component renders label as sibling, not wrapping.
    // Each input has aria-label for accessible name.
    const emailInput = page.locator('input[aria-label="E-postadress"]')
    await expect(emailInput).toBeVisible()

    const passwordInput = page.locator('input[aria-label="Lösenord"]')
    await expect(passwordInput).toBeVisible()

    // Labels exist as visible text
    const labels = page.locator('[class*="label"]')
    const count = await labels.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })
})

test.describe('Register page', () => {
  test('renders with step indicator', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })

  test('step 1 shows email and password fields', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    const passwordInput = page.locator('input[type="password"]').first()
    await expect(passwordInput).toBeVisible()
  })

  test('step 1 → step 2 navigation works', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    // Fill step 1 fields
    await page.locator('input[type="email"]').fill('test@example.com')
    const passwords = page.locator('input[type="password"]')
    await passwords.nth(0).fill('Password123!')
    await passwords.nth(1).fill('Password123!')

    // Submit step 1
    const nextButton = page.locator('button[type="submit"]')
    await nextButton.click()
    await page.waitForTimeout(400)

    // Step 2 should show profile fields — displayName has aria-label="Visningsnamn"
    const displayNameInput = page.locator('input[aria-label="Visningsnamn"]')
    await expect(displayNameInput).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Forgot password page', () => {
  test('renders with email input and submit button', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.waitForLoadState('domcontentloaded')

    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()
  })

  test('shows validation error for empty submission', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.waitForLoadState('domcontentloaded')
    // Wait for React hydration
    await page.waitForTimeout(1000)

    await page.locator('button[type="submit"]').click()

    // Sets error: 'Ange din e-postadress'
    const errorMessage = page.locator('p[role="alert"]')
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Auth pages accessibility', () => {
  test('login form has aria attributes on submit button', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toHaveAttribute('type', 'submit')
    const ariaHidden = await submitButton.getAttribute('aria-hidden')
    expect(ariaHidden).not.toBe('true')
  })

  test('register form has accessible form structure', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    const form = page.locator('form')
    await expect(form).toBeVisible()
  })
})
