# Epic: E06 — Intentions Sub-view

## Stitch Source
Convert: `html/intentions-view.html`
Reference: `screenshots/stitch-reference/intentions-view.png`

## Description
Build the Intentions sub-view accessible from the Upptäck hub. Shows horizontal scrollable filter pills (Alla, Dejt, Relation, Vänskap, Öppet, Event) and a filtered stack of intention profile cards below. Reuse existing IntentionProfileCard component and useIntentions hook.

## Acceptance Criteria
1. Screen header with back arrow + "Intentioner" title
2. Horizontal scrollable filter pill row below header
3. Active pill: copper gradient bg, white text, shadow
4. Inactive pill: border outline-variant, bg surface-container-lowest, dark text
5. Pills have emoji prefix + text label (e.g. "💕 Dejt", "👫 Vänskap")
6. Pill shape: rounded-full (9999px)
7. Filtered card stack below pills using IntentionProfileCard
8. Tapping a pill filters the cards by IntentionSeeking type
9. Cards show score badge, tags, bio, photo per existing IntentionProfileCard
10. Back arrow navigates to Upptäck hub via router.back()

## File Paths
- `apps/mobile/app/(tabs)/discover/intentions.tsx`
- `packages/ui/src/IntentionProfileCard.tsx` (reuse)

## Design Tokens (from Stitch)
- Active pill: bg copper-glow gradient, text white, shadow polaroid-shadow
- Inactive pill: border 1px outline-variant (#d8c3b4), bg surface-container-lowest (#ffffff)
- Pill padding: 12px horizontal, 8px vertical
- Pill radius: 9999px (full)
- Pill text: 14px medium Manrope
- Pill gap: 8px
- Card stack: vertical scroll, 16px gap between cards
- Screen padding: 24px horizontal
