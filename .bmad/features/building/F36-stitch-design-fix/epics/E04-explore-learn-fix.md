# E04 — Explore & Learn Screen Fix

**Wave:** 4
**Model:** sonnet
**Depends on:** E01

## Beskrivning

Screenshot Explore och Learn med INNEHÅLL synligt (kategorikort, modullista). Jämför mot stitch-spec. Fixa alla visuella problem.

## Acceptance Criteria

1. Explore visar kategorikort med tonal layering: surfaceContainer bakgrund, surfaceContainerLowest kort
2. Explore kort: borderRadius 16+, INGA borders, ultra-diffused shadow
3. Explore titlar i Noto Serif, body i Manrope
4. Svenska etiketter (Grupper, Evenemang, Organisationer, Shop)
5. Learn visar modullista med badges, framsteg
6. Learn modulkort: tonal layering, ghost borders, serif titlar
7. Learn streak widget och achievement-knappar med copper accents
8. Floating dock synlig på båda skärmar

## File Paths

- `apps/mobile/app/(tabs)/explore/index.tsx`
- `apps/mobile/app/(tabs)/explore/_layout.tsx`
- `apps/mobile/app/(tabs)/learn/_layout.tsx`
- `packages/app/src/screens/LearnModuleListScreen.tsx`

## Testgate

**BLOCKING: Visual verification MUST pass with real data on screen.**

**Explore:**
- [ ] Glassmorphic floating nav → PASS/FAIL
- [ ] Typografi (serif titlar) → PASS/FAIL
- [ ] No-line rule → PASS/FAIL
- [ ] Tonal layering (kort mot bakgrund) → PASS/FAIL
- [ ] Ghost borders → PASS/FAIL
- [ ] Ultra-diffused shadows → PASS/FAIL
- [ ] Copper accents → PASS/FAIL

**Learn:**
- [ ] Typografi → PASS/FAIL
- [ ] Tonal layering → PASS/FAIL
- [ ] No-line rule → PASS/FAIL
- [ ] Copper accents (badges, progress) → PASS/FAIL
