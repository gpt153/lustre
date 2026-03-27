import { type Page } from '@playwright/test'

/**
 * Sets auth tokens in localStorage using the useAuthStore Zustand persist format.
 * The store persists: accessToken, refreshToken, userId, displayName, isAuthenticated, tempRegistrationToken
 * Call this before navigating to any auth-protected page.
 */
export async function mockAuth(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const authState = JSON.stringify({
      state: {
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        userId: 'test-user-1',
        displayName: 'TestUser',
        isAuthenticated: true,
        tempRegistrationToken: null,
      },
      version: 0,
    })
    localStorage.setItem('lustre-auth', authState)

    // Also set the mode store so the app doesn't error
    const modeState = JSON.stringify({
      state: { mode: 'vanilla' },
      version: 0,
    })
    localStorage.setItem('lustre-mode', modeState)
  })
}

/**
 * Navigates to a path with auth already mocked via localStorage.
 * Waits for the page to be network idle so React hydration completes.
 */
export async function goToApp(page: Page, path: string): Promise<void> {
  await mockAuth(page)
  await page.goto(path)
  await page.waitForLoadState('domcontentloaded')
}

type Breakpoint = 'wide' | 'desktop' | 'tablet' | 'mobile' | 'mobile-small'

const BREAKPOINT_WIDTHS: Record<Breakpoint, number> = {
  'wide': 1440,
  'desktop': 1200,
  'tablet': 900,
  'mobile': 600,
  'mobile-small': 375,
}

const BREAKPOINT_HEIGHT = 900

/**
 * Sets the viewport to a named breakpoint.
 */
export async function setViewport(page: Page, breakpoint: Breakpoint): Promise<void> {
  await page.setViewportSize({
    width: BREAKPOINT_WIDTHS[breakpoint],
    height: BREAKPOINT_HEIGHT,
  })
}
