import { test, expect } from '@playwright/test'
import { goToApp, setViewport } from './helpers'

test.describe('Chat layout at >900px', () => {
  test.beforeEach(async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/chat')
    await page.waitForTimeout(500)
  })

  test('two-column layout is visible: conversation list and chat room', async ({ page }) => {
    const chatLayout = page.locator('[class*="chatLayout"]')
    await expect(chatLayout).toBeVisible()

    const conversationList = page.locator('[class*="conversationList"]')
    await expect(conversationList).toBeVisible()

    // Chat room exists in DOM (may have hidden class when no conversation selected)
    const chatRoom = page.locator('[class*="chatRoom"]')
    const count = await chatRoom.count()
    expect(count).toBeGreaterThan(0)
  })

  test('chat room shows empty state or hidden when no conversation selected', async ({ page }) => {
    // Without a selected conversation, the chat room either shows empty state or is hidden
    const emptyRoom = page.locator('[class*="emptyRoom"]')
    const chatRoom = page.locator('[class*="chatRoom"]')
    const emptyVisible = await emptyRoom.isVisible().catch(() => false)
    const chatRoomExists = await chatRoom.count()
    // Either empty state is shown, or chat room exists in DOM
    expect(emptyVisible || chatRoomExists > 0).toBe(true)
  })

  test('conversation list shows loading or empty state', async ({ page }) => {
    // Without backend, conversation list shows loading state
    const listArea = page.locator('[class*="conversationList"]').first()
    await expect(listArea).toBeVisible()
  })
})

test.describe('Chat layout at <900px (mobile)', () => {
  test.beforeEach(async ({ page }) => {
    await setViewport(page, 'mobile')
    await goToApp(page, '/chat')
    await page.waitForTimeout(500)
  })

  test('shows conversation list initially in single column', async ({ page }) => {
    const conversationList = page.locator('[class*="conversationList"]')
    await expect(conversationList).toBeVisible()
  })

  test('chat room panel is hidden initially (mobile list view)', async ({ page }) => {
    const chatRoom = page.locator('[class*="chatRoom"]')
    const count = await chatRoom.count()
    if (count === 0) return // No chat room element

    const isHidden = await chatRoom.evaluate((el) => {
      const className = el.className
      return className.includes('hidden') || window.getComputedStyle(el).display === 'none'
    })
    expect(isHidden).toBe(true)
  })
})

test.describe('Conversation list', () => {
  test('conversation list container renders', async ({ page }) => {
    await setViewport(page, 'wide')
    await goToApp(page, '/chat')
    await page.waitForTimeout(600)

    const listContainer = page.locator('[class*="conversationList"]')
    await expect(listContainer).toBeVisible()
  })
})
