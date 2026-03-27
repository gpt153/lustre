# Epic: Wave 3f — App-Only Feature Prompts

**Epic ID:** F33-W3f
**Wave:** 3 — Secondary Pages & Polish
**Size:** haiku
**Depends On:** Wave 2 (all)
**Status:** NOT STARTED

---

## Goal

Build the "Öppna i appen" (Open in app) prompt system for features that are intentionally blocked on web. These prompts serve dual purpose: explain why the feature requires the app, and drive app downloads.

## Acceptance Criteria

1. `AppOnlyPrompt` reusable component: centered card (max-width 480px) with illustration (feature-specific icon at 80px), title (General Sans 28px), description explaining why the feature requires the mobile app, "Ladda ner appen" primary CTA button linking to app store, "Tillbaka" ghost button
2. ConsentVault route (`/consent-vault`): shows AppOnlyPrompt with lock/shield icon, title "ConsentVault finns i appen", description mentioning screenshot protection requires native app
3. SafeDate route (`/safe-date`): shows AppOnlyPrompt with GPS/location icon, title "SafeDate kräver mobilappen", description about GPS tracking requiring mobile device
4. Spicy content gate: when user navigates to content marked nudity MEDIUM/HIGH, show inline AppOnlyPrompt instead of content, with flame icon, title "Visa i appen", description about content protection
5. Video/voice call gate: when user clicks call button in chat, show modal AppOnlyPrompt with phone icon, title "Samtal görs i appen", description about call quality requiring native app
6. App store links: detect platform (iOS/Android via user agent) and show appropriate store badge; desktop shows both badges side by side
7. QR code: generate QR code on prompt leading to app store listing, so desktop users can scan with phone to download
8. Analytics: each prompt impression and CTA click tracked via shared analytics hook for funnel measurement

## File Paths

- `apps/web/components/common/AppOnlyPrompt.tsx`
- `apps/web/components/common/AppOnlyPrompt.module.css`
- `apps/web/app/(app)/consent-vault/page.tsx`
- `apps/web/app/(app)/safe-date/page.tsx`
- `apps/web/components/chat/CallGateModal.tsx`
- `apps/web/lib/app-store-links.ts`

## Technical Notes

### AppOnlyPrompt CSS
```css
.appOnlyPrompt {
  max-width: 480px;
  margin: var(--space-16) auto;
  padding: var(--space-10) var(--space-8);
  text-align: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}
.icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: rgba(184, 115, 51, 0.08);
  color: var(--color-copper);
}
.title {
  font-family: var(--font-heading);
  font-size: 28px;
  line-height: 36px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}
.description {
  font-size: 15px;
  line-height: 24px;
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
  max-width: 360px;
  margin-left: auto;
  margin-right: auto;
}
.storeButtons {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}
.storeBadge {
  height: 44px;
  cursor: pointer;
  transition: opacity 200ms ease;
}
.storeBadge:hover {
  opacity: 0.85;
}
.qrCode {
  width: 120px;
  height: 120px;
  margin: var(--space-6) auto 0;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  padding: var(--space-2);
}
.qrLabel {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: var(--space-2);
}
.backButton {
  margin-top: var(--space-4);
}
```

### Inline Content Gate
For spicy content that appears inline (e.g., in feed or profile):
```css
.inlineGate {
  padding: var(--space-8) var(--space-6);
  text-align: center;
  background: rgba(184, 115, 51, 0.04);
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-lg);
}
.inlineGateIcon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--space-3);
  color: var(--color-copper);
  opacity: 0.6;
}
.inlineGateText {
  font-size: 15px;
  color: var(--text-muted);
  margin-bottom: var(--space-4);
}
```

### Call Gate Modal
Uses Modal from W1c, with AppOnlyPrompt content inside:
```typescript
// In ChatRoom, when user clicks call button:
const handleCallClick = () => {
  setShowCallGate(true);
  trackEvent('app_only_prompt_impression', { feature: 'call' });
};
```

### App Store Link Detection
```typescript
// apps/web/lib/app-store-links.ts
export const APP_STORE_URL = 'https://apps.apple.com/app/lustre/id...';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=...';

export function getAppStoreLink(): string {
  if (typeof navigator === 'undefined') return APP_STORE_URL;
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return PLAY_STORE_URL;
  if (/iphone|ipad|ipod/i.test(ua)) return APP_STORE_URL;
  return APP_STORE_URL; // Default to iOS for desktop
}

export function isDesktop(): boolean {
  if (typeof navigator === 'undefined') return true;
  return !/android|iphone|ipad|ipod/i.test(navigator.userAgent);
}
```

### RSC Strategy
- `consent-vault/page.tsx` — Server Component (static prompt, no interactivity needed beyond link)
- `safe-date/page.tsx` — Server Component
- `AppOnlyPrompt.tsx` — Server Component (static content, buttons are standard links)
- `CallGateModal.tsx` — Client Component (modal interaction)

## Definition of Done
- ConsentVault route shows app-only prompt with correct copy
- SafeDate route shows app-only prompt with correct copy
- Spicy MEDIUM/HIGH content replaced by inline gate in feed/profile
- Call button in chat shows gate modal
- App store badges link to correct store based on user agent
- Desktop users see both store badges + QR code
- All prompt impressions and CTA clicks tracked
- Prompts match warm UI design language
- Back button returns to previous page
