# Epic: E11 — Jag Profile Screen

## Stitch Source
Convert: `html/jag-profil.html`
Reference: `screenshots/stitch-reference/jag-profil.png`

## Description
Rewrite the Jag (Profile) tab screen to match Stitch design. Shows hero avatar with copper ring, name/age/location, bio in italic, edit button, stats row, posts grid as Polaroid thumbnails, collections list, and quick links. Reuse existing useProfile hook and profile data.

## Acceptance Criteria
1. Hero section: 96px avatar with copper ring (3px) + verified badge overlay
2. Name + age centered in 20px extrabold Manrope
3. Location with pin icon in 14px medium, on-surface-variant color
4. Bio in italic Manrope, primary color
5. "Redigera profil" outlined button: border primary-container, rounded-full
6. Stats row: 3 stats in surface-container-low card with dividers
7. Posts grid: 3-column Polaroid thumbnail grid with slight tilt
8. Collections section: list items with 40px icon circles + count badges
9. Quick links: icon + text button list (Gatekeeper, SafeDate, Inställningar)
10. Logout button in error color (#ba1a1a) at bottom

## File Paths
- `apps/mobile/app/(tabs)/profile/index.tsx` (rewrite)
- `apps/mobile/app/(tabs)/profile/_layout.tsx` (update)
- `packages/ui/src/PolaroidAvatar.tsx` (reuse)

## Design Tokens (from Stitch)
- Hero avatar: 96px, copper ring 3px primary-container (#894D0D)
- Verified badge: 24px, positioned bottom-right of avatar
- Name: 20px weight 800, on-surface (#211a17)
- Location: 14px weight 500, on-surface-variant (#524439)
- Bio: 16px italic, color primary (#6a3800)
- Edit button: border 1px primary-container, text primary-container, rounded-full, padding 12px 24px
- Stats card: bg surface-container-low (#fff1eb), rounded-xl, 3 items with dividers
- Stat number: 20px bold, primary-container color
- Stat label: 12px medium, on-surface-variant
- Posts grid: 3 columns, 8px gap, Polaroid frames with ±1-3deg rotation
- Collection icon circle: 40px, bg surface-container (#faebe5)
- Collection count badge: secondary-container bg (#fdad67), 10px bold text
- Logout: color error (#ba1a1a), 14px medium
