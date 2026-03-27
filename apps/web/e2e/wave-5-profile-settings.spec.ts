import { test, expect } from '@playwright/test'
import { goToApp, setViewport } from './helpers'

/* ============================================================
   Wave 5: Profile + Settings
   ============================================================ */

test.describe('Wave 5: Own Profile', () => {
  test('displays name and age', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/profile')
    await page.waitForTimeout(2000)

    await expect(page.locator('text=Samuel').first()).toBeVisible()
    await expect(page.locator('text=29').first()).toBeVisible()
  })

  test('displays photo gallery with upload slots', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/profile')
    await page.waitForTimeout(2000)

    await expect(page.locator('text=Lägg till foto')).toBeVisible()
  })

  test('displays bio section', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/profile')
    await page.waitForTimeout(2000)

    // "Om mig" is rendered uppercase via CSS text-transform
    const pageContent = await page.locator('main').textContent()
    expect(pageContent?.toLowerCase()).toContain('om mig')
  })

  test('displays prompt cards', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/profile')
    await page.waitForTimeout(2000)

    // Prompt section heading (CSS text-transform uppercase)
    const pageContent = await page.locator('main').textContent()
    expect(pageContent?.toLowerCase()).toContain('svar på frågor')
  })

  test('has edit profile FAB', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/profile')
    await page.waitForTimeout(2000)

    await expect(page.locator('button:has-text("Redigera profil")')).toBeVisible()
  })

  test('public profile view renders', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/profile/user-123')
    await page.waitForTimeout(2000)

    // Public profile shows action buttons
    const pageContent = await page.locator('body').textContent()
    const hasLikeOrMessage = pageContent?.includes('Gilla') || pageContent?.includes('Skicka meddelande')
    expect(hasLikeOrMessage).toBe(true)
  })
})

test.describe('Wave 5: Settings sidebar', () => {
  test('sidebar navigation renders all sections', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/settings/account')
    await page.waitForTimeout(2000)

    for (const label of ['Konto', 'Integritet', 'Läge', 'Tema', 'Migration', 'Sessioner', 'Farozonen']) {
      await expect(page.locator(`text=${label}`).first()).toBeVisible()
    }
  })

  test('account settings displays profile info', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/settings/account')
    await page.waitForTimeout(2000)

    await expect(page.locator('text=Visningsnamn').first()).toBeVisible()
    await expect(page.locator('text=E-post').first()).toBeVisible()
    await expect(page.locator('button:has-text("Spara ändringar")')).toBeVisible()
  })
})

test.describe('Wave 5: Mode toggle', () => {
  test('vanilla/spicy toggle renders', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/settings/mode')
    await page.waitForTimeout(2000)

    await expect(page.locator('text=Vanilla').first()).toBeVisible()
    await expect(page.locator('text=Spicy').first()).toBeVisible()
  })

  test('content filter presets display', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/settings/mode')
    await page.waitForTimeout(2000)

    for (const preset of ['SOFT', 'OPEN', 'EXPLICIT', 'NO DICK PICS']) {
      await expect(page.locator(`text=${preset}`).first()).toBeVisible()
    }
  })
})

test.describe('Wave 5: Theme toggle', () => {
  test('theme options render (light/dark/system)', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/settings/theme')
    await page.waitForTimeout(2000)

    await expect(page.locator('text=Ljust').first()).toBeVisible()
    await expect(page.locator('text=Mörkt').first()).toBeVisible()
    await expect(page.locator('text=System').first()).toBeVisible()
  })
})

test.describe('Wave 5: Danger zone', () => {
  test('danger zone renders with delete button', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/settings/danger')
    await page.waitForTimeout(2000)

    await expect(page.locator('text=Farozonen').first()).toBeVisible()
    await expect(page.locator('button:has-text("Radera konto")')).toBeVisible()
  })
})

test.describe('Wave 5: Migration', () => {
  test('migration wizard step 1 renders', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/settings/migration')
    await page.waitForTimeout(2000)

    await expect(page.locator('text=BodyContact').first()).toBeVisible()
    await expect(page.locator('button:has-text("Förhandsgranska")')).toBeVisible()
  })
})

test.describe('Wave 5: Mobile', () => {
  test('profile renders on mobile', async ({ page }) => {
    await setViewport(page, 'mobile-small')
    await goToApp(page, '/profile')
    await page.waitForTimeout(2000)

    await expect(page.locator('text=Samuel').first()).toBeVisible()
  })

  test('settings renders on mobile', async ({ page }) => {
    await setViewport(page, 'mobile-small')
    await goToApp(page, '/settings/account')
    await page.waitForTimeout(3000)

    // On mobile, sidebar may be collapsed but content heading shows
    await expect(page.locator('h1:has-text("Konto")')).toBeVisible()
  })
})
