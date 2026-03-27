# Epic: Wave 2f — Landing Page & Auth Flows

**Epic ID:** F33-W2f
**Wave:** 2 — Core Pages
**Size:** haiku
**Depends On:** W1a (CSS tokens), W1c (core components)
**Status:** VERIFIED

---

## Goal

Build the public landing page (SSG for maximum performance and SEO) and authentication flows (login, register, forgot password). The landing page is the first impression of Lustre on web and must convey warmth, quality, and sex-positivity.

## Acceptance Criteria

1. Landing page statically generated (SSG) via Next.js `generateStaticParams`; Lighthouse performance score >95; includes Open Graph meta tags, structured data (Organization schema), and SEO-optimized heading structure
2. Landing hero section: full-width warm gradient background (copper -> gold at 15deg), hero text ("Dejta på dina villkor" or equivalent) in General Sans 48px/56px, CTA button "Skapa konto" (primary copper), app store badges
3. Feature sections (3-4): alternating layout with illustration + text, each highlighting a unique Lustre feature (ConsentVault, Modes, SafeDate, Coach); uses `text-section` typography, separated by subtle warm dividers
4. Social proof section: user testimonials in Card components, count of users/matches, trust badges
5. Login page: centered card (max-width 400px) with email input, password input, "Logga in" button (primary), "Glömt lösenord?" link, "Skapa konto" secondary link, divider with "eller", social login buttons (Google, Apple)
6. Register page: multi-step flow (email -> profile basics -> photo upload -> preferences); step indicator with copper progress bar; each step validates before advancing
7. Forgot password: email input, submit sends reset email, success state with confirmation message
8. Auth state managed via shared `useAuthStore` (Zustand); successful login redirects to `/discover`; auth pages redirect to `/discover` if already authenticated

## File Paths

- `apps/web/app/(landing)/page.tsx`
- `apps/web/app/(landing)/page.module.css`
- `apps/web/app/(auth)/login/page.tsx`
- `apps/web/app/(auth)/register/page.tsx`
- `apps/web/app/(auth)/forgot-password/page.tsx`
- `apps/web/components/landing/HeroSection.tsx`
- `apps/web/components/auth/AuthCard.tsx`
- `apps/web/components/auth/AuthCard.module.css`

## Technical Notes

### Landing Hero CSS
```css
.hero {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(
    15deg,
    var(--color-warm-white) 0%,
    rgba(184, 115, 51, 0.06) 40%,
    rgba(212, 168, 67, 0.08) 100%
  );
  padding: var(--space-16) var(--space-6);
  position: relative;
  overflow: hidden;
}
.heroTitle {
  font-family: var(--font-heading);
  font-size: 56px;
  line-height: 64px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  max-width: 600px;
  margin: 0 auto var(--space-6);
}
.heroSubtitle {
  font-family: var(--font-body);
  font-size: 18px;
  line-height: 28px;
  color: var(--text-secondary);
  max-width: 480px;
  margin: 0 auto var(--space-8);
}
.heroCta {
  font-size: 17px;
  padding: 14px 32px;
}
/* Ambient glow behind hero */
.hero::after {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(184, 115, 51, 0.08) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
```

### Landing Responsive
```css
@media (max-width: 900px) {
  .heroTitle {
    font-size: 36px;
    line-height: 44px;
  }
  .heroSubtitle {
    font-size: 16px;
  }
}
@media (max-width: 600px) {
  .heroTitle {
    font-size: 28px;
    line-height: 36px;
  }
  .hero {
    min-height: 60vh;
    padding: var(--space-10) var(--space-4);
  }
}
```

### Auth Card CSS
```css
.authCard {
  max-width: 400px;
  width: 100%;
  margin: var(--space-16) auto;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-10) var(--space-8);
}
.authTitle {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin-bottom: var(--space-8);
  color: var(--text-primary);
}
.divider {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin: var(--space-6) 0;
  color: var(--text-muted);
  font-size: 13px;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
}
.socialButton {
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-medium);
  background: var(--bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: background 200ms ease, box-shadow 200ms ease;
}
.socialButton:hover {
  background: rgba(184, 115, 51, 0.04);
  box-shadow: var(--shadow-sm);
}
```

### Register Step Indicator
```css
.stepIndicator {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
}
.step {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: var(--border-subtle);
  transition: background 300ms ease;
}
.stepComplete {
  background: var(--color-copper);
}
.stepActive {
  background: var(--color-copper);
  opacity: 0.6;
}
```

### RSC Strategy
- `(landing)/page.tsx` — Server Component (SSG): static HTML, no client interactivity in initial render
- `HeroSection.tsx` — Server Component (static content)
- `(auth)/login/page.tsx` — Server Component shell, renders `<AuthCard />` client component
- `AuthCard.tsx` — Client Component: form state, validation, API calls

### SEO Metadata
```typescript
// app/(landing)/page.tsx
export const metadata: Metadata = {
  title: 'Lustre — Dejta på dina villkor',
  description: 'Sex-positiv dejtingapp med ConsentVault, säkra dejter och AI-coach.',
  openGraph: {
    title: 'Lustre — Dejta på dina villkor',
    description: 'Sex-positiv dejtingapp med ConsentVault, säkra dejter och AI-coach.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
};
```

## Definition of Done
- Landing page loads as static HTML, Lighthouse >95
- Hero section with warm gradient, title, subtitle, CTA
- Feature sections render with alternating layout
- Login form submits, validates, shows errors inline
- Register multi-step flow advances with validation
- Forgot password sends reset email and shows confirmation
- Social login buttons for Google and Apple
- Auth state redirects correctly (logged-in -> /discover, logged-out -> /login)
- Open Graph tags render in page source
- Responsive at all breakpoints (56px hero title -> 28px at mobile)
