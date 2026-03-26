# Epic: wave-3a-payment-page

**Wave:** 3
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Add a `/pay` section to the Next.js web app (maps to pay.lovelustre.com via reverse proxy). Shows balance, topup history, daily summaries, and payment settings (auto-topup, card management). Login via one-time code from the app.

## Context

### Web app structure
- `apps/web/app/` — Next.js App Router
- `apps/web/app/(app)/` — authenticated section (has layout.tsx with nav)
- Add new `apps/web/app/(pay)/` route group — separate from (app), with its own simple layout
- tRPC client: `import { trpc } from '@lustre/api'` (already set up in web app)

### tRPC procedures available (after Wave 1 and 2):
- `token.getBalance` — `{ balance: number, balanceDecimal: string }`
- `token.getHistory` — `{ transactions: [{id, amount, type, description, serviceRef, createdAt}], nextCursor }`
- `swishPayment.setupSwishRecurring` — `{ agreementToken, paymentUrl }`
- `swishPayment.cancelSwishRecurring`
- `swishPayment.getSwishRecurringStatus` — `{ status, autoTopupAmount, lowBalanceThreshold }` or null
- `segpay.listCards` — cards
- `segpay.addCard`
- `segpay.topup`
- `segpay.setDefaultCard`
- `segpay.removeCard`

### Login via one-time code
The pay page uses its own simple login: user enters their email, API generates a 6-digit one-time code (OTP), they confirm in the main app or enter code. For MVP: just use existing JWT auth via cookies (if already logged in via `@lustre/api` tRPC client, they're already authenticated). If not logged in, show a message "Please log in via the Lustre app".

### API package
`packages/api/src/` — contains tRPC client config. Check how web app uses it.

## Acceptance Criteria
1. `apps/web/app/(pay)/layout.tsx` — simple layout with Lustre branding, no main app nav
2. `apps/web/app/(pay)/pay/page.tsx` — balance display (large SEK equivalent), topup history list (last 20), daily summary (group by date)
3. `apps/web/app/(pay)/pay/settings/page.tsx` — auto-topup settings (Swish: set amount + threshold, enable/disable), card management (list cards, set default, add card form, remove)
4. `apps/web/app/(pay)/pay/topup/page.tsx` — quick topup via Segpay (select card, enter amount, confirm)
5. All pages: if unauthenticated, show "Logga in i Lustre-appen för att se din betalningsöversikt" (Swedish)
6. NO prices or amounts shown anywhere in the MAIN app (these pages are only on pay subdomain)
7. Daily summaries: group transactions by date, show total spent per day
8. Minimal Swedish UI: "Saldo", "Transaktioner", "Automatisk påfyllning", "Betalkort"
9. No TODO/FIXME

## Files to Create
- `apps/web/app/(pay)/layout.tsx`
- `apps/web/app/(pay)/pay/page.tsx`
- `apps/web/app/(pay)/pay/settings/page.tsx`
- `apps/web/app/(pay)/pay/topup/page.tsx`
