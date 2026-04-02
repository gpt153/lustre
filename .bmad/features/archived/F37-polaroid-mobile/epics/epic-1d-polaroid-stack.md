# Epic 1d: PolaroidStack Component

**Model:** sonnet
**Wave:** 1
**Depends on:** 1c (PolaroidCard)

## Description
Create PolaroidStack that shows up to 3 PolaroidCards with the front card on top and behind cards at varied angles.

## Acceptance Criteria
1. File `packages/ui/src/PolaroidStack.tsx` exists
2. Props: `images: ImageSourcePropType[]`, `cardWidth: number`, `captions?: string[]`, `onCardPress?: (index: number) => void`
3. Renders up to 3 cards: front at 0° rotation, behind cards at ±2-4° with 0.95/0.90 scale
4. Front card has highest zIndex
5. Tap advances stack with spring animation (SPRING.default)
6. Behind-card edges visibly peek from behind front card

## Codebase Context
- PolaroidCard at `packages/ui/src/PolaroidCard.tsx`
- Animation: `SPRING.default = { damping: 20, stiffness: 90, mass: 1 }` from `apps/mobile/constants/animations.ts`
- Use react-native-reanimated for spring transitions

## File Paths
- `packages/ui/src/PolaroidStack.tsx` (CREATE)
