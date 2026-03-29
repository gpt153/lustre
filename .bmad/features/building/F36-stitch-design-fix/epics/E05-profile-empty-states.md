# E05 — Profile & Empty States Fix

**Wave:** 5
**Model:** sonnet
**Depends on:** E01

## Beskrivning

Screenshot Profile med FULL profildata synlig (foto, bio, tags). Redesigna ALLA empty states i appen till editorial stil. Fixa alla visuella problem.

## Acceptance Criteria

1. Profile visar profilfoto med copper-to-surface hero gradient overlay
2. Profile foto-grid med ghost borders, inte solid borders
3. Profile tag-pills med ghost borders
4. Profile bio i Manrope, namn i Noto Serif
5. Edit-knapp: pill shape (9999), copper accent
6. ALLA empty states i appen redesignade: serif heading, warm tone text, copper gradient CTA, tonal background — INTE emoji+text
7. Specifika empty states att fixa: Feed "Inga inlägg", Discover "Inga fler profiler", Chat "Inga konversationer", Explore "Inget innehåll"
8. Empty states ska ha illustration-plats (warm SVG/icon, inte Unicode emoji)

## File Paths

- `packages/app/src/screens/ProfileViewScreen.tsx`
- `packages/app/src/screens/FeedScreen.tsx` (empty state)
- `packages/app/src/screens/DiscoverScreen.tsx` (empty state)
- `packages/app/src/screens/ConversationListScreen.tsx` (empty state)
- `apps/mobile/app/(tabs)/explore/index.tsx` (empty state)
- `apps/mobile/components/EmptyState.tsx`

## Testgate

**BLOCKING: Visual verification MUST pass with real data on screen.**

**Profile (med data):**
- [ ] Glassmorphic floating nav → PASS/FAIL
- [ ] Typografi (serif namn, sans bio) → PASS/FAIL
- [ ] No-line rule → PASS/FAIL
- [ ] Copper-gold hero gradient → PASS/FAIL
- [ ] Tonal layering → PASS/FAIL
- [ ] Ghost borders (foto-grid, tags) → PASS/FAIL
- [ ] Ultra-diffused shadows → PASS/FAIL

**Empty states (trigger genom att filtrera bort data):**
- [ ] Serif headings → PASS/FAIL
- [ ] Warm tonal background → PASS/FAIL
- [ ] Copper gradient CTA knapp → PASS/FAIL
- [ ] Ingen generisk emoji — warm illustration/icon → PASS/FAIL
