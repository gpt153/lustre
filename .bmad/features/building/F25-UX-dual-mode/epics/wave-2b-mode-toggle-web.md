# Epic: wave-2b-mode-toggle-web

**Wave:** 2
**Model:** haiku
**Status:** NOT_STARTED
**Depends on:** Wave 1 complete (parallel with wave-2a)

## Goal
Add the vanilla/spicy mode toggle to the Next.js web app: use the shared `ModeToggle` component in the settings nav, update the `/settings/spicy` page to use `useMode`, and add mode-conditional rendering on the learn page.

## Context

### Existing web structure
- App layout: `apps/web/app/(app)/layout.tsx` — main nav layout
- Settings: `apps/web/app/(app)/settings/layout.tsx` — settings nav
- Settings spicy: `apps/web/app/(app)/settings/spicy/page.tsx` — already exists from F17
- Learn page: `apps/web/app/(app)/learn/page.tsx` — module grid with spicy section
- Shared components: `packages/app/src/components/` — `ModeToggle` created in wave-2a
- `useMode` hook: `packages/app/src/hooks/useMode.ts` (created in wave-1a)

### Import patterns on web
Web uses `@lustre/app` for shared components/hooks. Look at existing web pages for import patterns.
Example: `import { LearnModuleListScreen } from '@lustre/app'` or direct from `packages/app/src/`.

## Acceptance Criteria
1. `apps/web/app/(app)/settings/spicy/page.tsx` — updated to use `useMode` hook; displays `ModeToggle` component prominently; shows description of what each mode does
2. `apps/web/app/(app)/settings/layout.tsx` — settings nav shows current mode badge (🌿 or 🌶️) next to the "Spicy/Mode" nav link
3. `apps/web/app/(app)/learn/page.tsx` — spicy modules section uses `ModeWrapper` or direct `useMode()` check; shows `SpicyGateBanner` when vanilla, shows spicy modules when spicy
4. No layout.tsx or provider changes needed — `useMode` fetches from tRPC directly
5. All web UI in Swedish (same as rest of app)

## File Paths
1. `apps/web/app/(app)/settings/spicy/page.tsx` — EDIT
2. `apps/web/app/(app)/settings/layout.tsx` — EDIT (add mode badge to nav link)
3. `apps/web/app/(app)/learn/page.tsx` — EDIT (use ModeWrapper for spicy section)

## Implementation Notes

### settings/spicy/page.tsx
Read the existing file first. It likely has a toggle for `profile.toggleSpicyMode`. Replace with `useMode` pattern:

```typescript
'use client'
import { ModeToggle } from '@lustre/app'  // or relative path
import { useMode } from '@lustre/app'

export default function SpicySettingsPage() {
  const { mode, isSpicy } = useMode()

  return (
    <div className="...">
      <h1>Läge</h1>
      <p>
        {isSpicy
          ? '🌶️ Spicy-läge aktiverat — du ser allt innehåll'
          : '🌿 Vanilla-läge aktiverat — appen ser ut som Hinge/Bumble'}
      </p>
      <ModeToggle />
    </div>
  )
}
```

IMPORTANT: Check whether web uses Tailwind CSS or Tamagui for styling. Read existing web settings pages to match the exact styling pattern used. Use whatever pattern matches the existing codebase.

### settings/layout.tsx
Read the existing file. Find the settings nav links. Add a small mode indicator next to the "Spicy" / "Läge" link:

```tsx
// After reading the file, find the nav items array/JSX and add mode indicator
// Something like: <span>{isSpicy ? '🌶️' : '🌿'}</span> next to the spicy settings link
```

### learn/page.tsx
Read the existing file. Find where spicy modules are rendered. Replace manual spicyModeEnabled check with `useMode()`:

```typescript
const { isSpicy } = useMode()
// ...
{!isSpicy ? <SpicyGateBanner onSettings={() => router.push('/settings/spicy')} /> : /* spicy modules */}
```

IMPORTANT: Read each file before editing to understand the existing pattern. Do NOT rewrite whole files — only update the mode-related sections.
