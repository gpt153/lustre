import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL ?? 'http://localhost:3333'

const routes = [
  { path: '/auth', name: 'Auth / Login' },
  { path: '/register', name: 'Register' },
  { path: '/register/swish', name: 'Register Swish' },
  { path: '/', name: 'Landing page' },
  { path: '/home', name: 'Home / Feed' },
  { path: '/discover', name: 'Discover' },
  { path: '/discover/matches', name: 'Matches' },
  { path: '/discover/search', name: 'Search' },
  { path: '/chat', name: 'Chat' },
  { path: '/groups', name: 'Groups' },
  { path: '/learn', name: 'Learn' },
  { path: '/coach', name: 'Coach' },
  { path: '/profile', name: 'Profile' },
  { path: '/settings/gatekeeper', name: 'Gatekeeper Settings' },
  { path: '/settings/spicy', name: 'Spicy Settings' },
  { path: '/shop', name: 'Shop' },
  { path: '/shop/business', name: 'Business Shop' },
  { path: '/orgs', name: 'Organizations' },
  { path: '/learn/achievements', name: 'Achievements' },
  { path: '/learn/sexual-health', name: 'Sexual Health' },
  { path: '/ads', name: 'Ads Manager' },
]

for (const route of routes) {
  test(`${route.name} (${route.path}) loads without server error`, async ({ page }) => {
    const errors: string[] = []

    page.on('pageerror', (err) => {
      errors.push(`PAGE ERROR: ${err.message}`)
    })

    const response = await page.goto(`${BASE}${route.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    const status = response?.status() ?? 0

    // Should not be a 500 server error
    expect(status, `${route.path} returned HTTP ${status}`).toBeLessThan(500)

    // Page should have some content (not blank)
    const bodyText = await page.textContent('body')
    expect(bodyText?.length, `${route.path} has empty body`).toBeGreaterThan(0)
  })
}
