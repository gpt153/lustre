# Epic: E05 — Swipe Sub-view

## Stitch Source
Convert: `html/swipe-view.html`
Reference: `screenshots/stitch-reference/swipe-view.png`

## Description
Build the Swipe sub-view accessible from the Upptäck hub. Shows a Polaroid card deck with profile photos, name/age, location, match percentage, and intent badge. Five action buttons at the bottom: rewind, pass, super-like, like, boost. Reuse existing PolaroidCard and useDiscovery/useSwipeGesture hooks.

## Acceptance Criteria
1. Screen header with back arrow + "Swipe" title
2. Polaroid card frame: 12px padding, 40px bottom padding, -1.5deg rotation
3. Photo inside card: aspect-ratio 4/5
4. Name + age in 24px extrabold Manrope below photo
5. Location with pin icon in 14px medium Manrope
6. Match % badge (top-right of photo): copper bg, white text, rounded-full
7. Intent pill badge (bottom-right): copper bg, white text
8. 5 action buttons: rewind (40px), pass (52px), super-like (64px copper), like (52px copper), boost (40px)
9. Swipe gesture handling via existing useSwipeGesture hook
10. Back arrow navigates to Upptäck hub via router.back()

## File Paths
- `apps/mobile/app/(tabs)/discover/swipe.tsx`
- `packages/ui/src/PolaroidCard.tsx` (extend if needed)

## Design Tokens (from Stitch)
- Card padding: 12px sides/top, 40px bottom (pb-10)
- Photo aspect: 4/5
- Card rotation: -1.5deg
- Name: 24px weight 800
- Match badge: bg primary-container, text white, rounded-full
- Intent pill: bg primary-container, text white
- Action buttons: circular, centered row
  - rewind: 40px, outline border
  - pass: 52px, outline border
  - super-like: 64px, copper gradient bg
  - like: 52px, copper gradient bg
  - boost: 40px, outline border
- Button shadow: polaroid-shadow
