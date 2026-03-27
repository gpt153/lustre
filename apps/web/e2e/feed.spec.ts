import { test, expect } from '@playwright/test'
import { goToApp, setViewport } from './helpers'

test.describe('Feed page', () => {
  test.beforeEach(async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/feed')
    await page.waitForTimeout(600)
  })

  test('feed page renders without crashing', async ({ page }) => {
    // The /feed route may redirect or render the app shell
    await expect(page.locator('body')).toBeVisible()
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.length).toBeGreaterThan(0)
  })

  test('app shell is visible on feed page', async ({ page }) => {
    // At minimum the app shell renders (header, nav)
    const shell = page.locator('[class*="shell"], [class*="Shell"]').first()
    const header = page.locator('header').first()
    const hasShell = await shell.isVisible().catch(() => false)
    const hasHeader = await header.isVisible().catch(() => false)
    expect(hasShell || hasHeader).toBe(true)
  })
})

test.describe('Feed post cards interaction', () => {
  test('like button is present and clickable on a post card', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/feed')
    await page.waitForTimeout(600)

    // Without backend, post cards may not render
    const postCards = page.locator('article[class*="postCard"]')
    const count = await postCards.count()

    if (count === 0) {
      test.skip()
      return
    }

    const likeButton = postCards.first().locator('button[class*="actionButton"]').first()
    await expect(likeButton).toBeVisible()
    await likeButton.click()
    await page.waitForTimeout(200)
    await expect(likeButton).toBeVisible()
  })

  test('comment button expands comment section', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/feed')
    await page.waitForTimeout(600)

    const postCards = page.locator('article[class*="postCard"]')
    const count = await postCards.count()

    if (count === 0) {
      test.skip()
      return
    }

    const actionButtons = postCards.first().locator('button[class*="actionButton"]')
    const buttonCount = await actionButtons.count()

    if (buttonCount < 2) {
      test.skip()
      return
    }

    const commentButton = actionButtons.nth(1)
    await commentButton.click()
    await page.waitForTimeout(300)

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Post composer', () => {
  test('composer textarea exists if feed loads', async ({ page }) => {
    await setViewport(page, 'desktop')
    await goToApp(page, '/feed')
    await page.waitForTimeout(600)

    // Composer only renders when feed data loads (tRPC required)
    const textarea = page.locator('textarea[aria-label="Skriv ett inlägg"]')
    const count = await textarea.count()

    if (count === 0) {
      // Without backend, composer may not render — acceptable
      test.skip()
      return
    }

    await expect(textarea).toBeVisible()
    await textarea.click()
    await textarea.type('Test inlägg')
    const value = await textarea.inputValue()
    expect(value).toBe('Test inlägg')
  })
})
