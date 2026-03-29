# E03 — Chat & Connect Screen Fix

**Wave:** 3
**Model:** sonnet
**Depends on:** E01

## Beskrivning

Screenshot ConversationList och ChatRoom med KONVERSATIONER OCH MEDDELANDEN synliga. Jämför mot stitch-spec. Fixa alla visuella problem.

## Acceptance Criteria

1. ConversationList visar konversationspods med avatar, namn (serif), senaste meddelande (sans)
2. Konversationspods: surfaceContainerLow bakgrund, borderRadius 16, INGA borders
3. Avatarer har ghost border ring, inte solid gold
4. Pill-formad sökfält utan borders, copper focus glow
5. FAB (ny konversation) pill-formad med ultra-diffused shadow
6. ChatRoom: copper gradient sent bubbles (#894d0d → #a76526), surfaceContainerLow received
7. ChatRoom header: ingen borderBottom, surface bakgrund
8. Floating dock synlig med copper active indicator

## File Paths

- `packages/app/src/screens/ConversationListScreen.tsx`
- `packages/app/src/screens/ChatRoomScreen.tsx`
- `apps/mobile/app/(tabs)/connect/_layout.tsx`

## Testgate

**BLOCKING: Visual verification MUST pass with real data on screen.**

**ConversationList:**
- [ ] Glassmorphic floating nav → PASS/FAIL
- [ ] Typografi (serif namn, sans meddelanden) → PASS/FAIL
- [ ] No-line rule (inga dividers) → PASS/FAIL
- [ ] Tonal layering (pods mot bakgrund) → PASS/FAIL
- [ ] Ghost borders only (avatarer) → PASS/FAIL
- [ ] Ultra-diffused shadows → PASS/FAIL
- [ ] Copper accents → PASS/FAIL

**ChatRoom:**
- [ ] Copper gradient sent bubbles → PASS/FAIL
- [ ] No header border → PASS/FAIL
- [ ] Surface tonal backgrounds → PASS/FAIL
- [ ] Typografi → PASS/FAIL
