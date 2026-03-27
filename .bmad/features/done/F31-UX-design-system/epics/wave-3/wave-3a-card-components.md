# Epic: wave-3a-card-components

**Model:** haiku
**Wave:** 3
**Group:** A (parallel with 3b, 3c)

## Description

Redesign all card components (PostCard, ProfileCard, GroupCard, OrgCard) to use the new design system: no borders, copper-tinted shadows for depth, warmCream background, borderRadius 16. Create a shared CardBase component that enforces consistent styling across all card types.

## Acceptance Criteria

1. A `CardBase` component exists in `packages/ui/` with props: children, elevation (1-3, controls shadow intensity), onPress (optional), style (optional). Default: warmCream background, borderRadius 16, copper-tinted shadow, no border.
2. `PostCard` uses `CardBase` — all `borderWidth` and `borderColor` references removed. Avatar size increased from 40px to 48px.
3. `ProfileCard` uses `CardBase` — profile photo has borderRadius 12 with overflow hidden. Text uses charcoal/$color for primary, warmGray for secondary.
4. `GroupCard` uses `CardBase` — consistent with other cards.
5. `OrgCard` uses `CardBase` — consistent with other cards.
6. Shadow values for elevation 1: `shadowOffset: {width:0, height:2}`, `shadowRadius: 8`, `shadowColor: '#C4956A'`, `shadowOpacity: 0.1`. Elevation 2: shadowOffset {0,4}, shadowRadius 12, opacity 0.15. Elevation 3: shadowOffset {0,6}, shadowRadius 16, opacity 0.2.
7. All cards render correctly in both light and dark modes (dark mode uses surface token for background instead of warmCream).

## File Paths

- `packages/ui/src/CardBase.tsx` (new)
- `packages/app/src/components/PostCard.tsx`
- `packages/app/src/components/ProfileCard.tsx`
- `packages/app/src/components/GroupCard.tsx`
- `packages/app/src/components/OrgCard.tsx`
