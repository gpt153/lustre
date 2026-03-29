# E02 — Feed & Discover Screen Fix

**Wave:** 2
**Model:** sonnet
**Depends on:** E01

## Beskrivning

Deploya APK till odin9 med backend+seed data körande. Ta screenshots av Feed och Discover med DATA synlig. Jämför mot stitch-spec. Fixa ALLA visuella problem.

## Acceptance Criteria

1. Feed (Flöde) visar PostCards med profilbilder, namn (serif), body text (sans), copper like-hjärtan
2. Feed har tonal layering: surfaceContainer bakgrund, surfaceContainerLowest kort
3. Feed har INGA 1px borders eller dividers — separation via spacing/tonal shift
4. Discover visar fullskärms SwipeCard med profilfoto, namn i Noto Serif, 3-stop copper-charcoal gradient
5. Discover action buttons: copper gradient Like (pill), charcoal Pass (pill), ultra-diffused shadows
6. Floating dock synlig på båda skärmar med copper active indicator
7. Alla tab-pills/chips använder ghost borders, inte solid borders
8. Empty state (om den triggas) har serif heading, warm tone, copper CTA — inte generisk emoji

## File Paths

- `packages/app/src/screens/FeedScreen.tsx`
- `packages/app/src/screens/DiscoverScreen.tsx`
- `packages/app/src/components/PostCard.tsx`
- `packages/app/src/components/SwipeCard.tsx`
- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/app/(tabs)/discover/_layout.tsx`

## Testgate

**BLOCKING: Visual verification MUST pass with real data on screen.**

Per-skärm checklist (ALLA måste PASS):

**Feed:**
- [ ] Glassmorphic floating nav → [beskriv vad du ser] → PASS/FAIL
- [ ] Typografi (serif headlines, sans body) → PASS/FAIL
- [ ] No-line rule (noll 1px borders) → PASS/FAIL
- [ ] Tonal layering (3+ surface-nivåer) → PASS/FAIL
- [ ] Ultra-diffused shadows (0.06 max) → PASS/FAIL
- [ ] Ghost borders only → PASS/FAIL
- [ ] Copper accents (#894d0d) → PASS/FAIL

**Discover:**
- [ ] Glassmorphic floating nav → PASS/FAIL
- [ ] Typografi → PASS/FAIL
- [ ] No-line rule → PASS/FAIL
- [ ] Copper-gold gradient → PASS/FAIL
- [ ] Tonal layering → PASS/FAIL
- [ ] Ghost borders → PASS/FAIL
- [ ] Ultra-diffused shadows → PASS/FAIL
