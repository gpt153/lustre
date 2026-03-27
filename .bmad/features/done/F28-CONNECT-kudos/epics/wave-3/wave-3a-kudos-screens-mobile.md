# Epic: wave-3a-kudos-screens-mobile

**Model:** haiku
**Wave:** 3
**Group:** A (parallel with 3b)

## Description

Build the mobile UI for the kudos system: a kudos prompt bottom sheet (triggered after conversation archive), badge selection screen with AI suggestions and manual browse, and a profile section displaying kudos count and top badges. Shared hooks and components in packages/app.

## Acceptance Criteria

1. `KudosPromptSheet` component in `packages/app/src/components/KudosPromptSheet.tsx` — bottom sheet asking "Vill du lamna kudos till [namn]?" with Accept/Dismiss buttons.
2. `BadgeSelectionScreen` in `packages/app/src/screens/BadgeSelectionScreen.tsx` — shows free-text input field, "Foreslagna badges" section (from AI), and full badge catalog organized by category for manual selection. Max 6 badges selectable.
3. `ProfileKudosSection` component in `packages/app/src/components/ProfileKudosSection.tsx` — displays total kudos count and top badges as styled tags with counts. Spicy badges only shown if viewer is in Spicy mode.
4. `useKudos` hook in `packages/app/src/hooks/useKudos.ts` — wraps tRPC calls for listBadges, suggestBadges, give, getPendingPrompts, dismissPrompt, getProfileKudos.
5. Kudos prompt sheet auto-appears on chat tab when pending prompts exist (polls on tab focus).
6. ProfileKudosSection integrated into the existing profile view screen.
7. Badge categories displayed as collapsible sections with badge chips.

## File Paths

- `packages/app/src/components/KudosPromptSheet.tsx`
- `packages/app/src/screens/BadgeSelectionScreen.tsx`
- `packages/app/src/components/ProfileKudosSection.tsx`
- `packages/app/src/hooks/useKudos.ts`
- `apps/mobile/app/(tabs)/profile/index.tsx` (integrate ProfileKudosSection)
