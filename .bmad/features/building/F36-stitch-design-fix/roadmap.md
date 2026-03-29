# F36 — Stitch Design Fix & Visual Verification: Roadmap

## BLOCKING RULE

> **Visual verification MUST pass with real data on screen before ANY wave can be marked DONE. If a pre-existing issue (missing backend, no data, broken API) prevents correct rendering, it MUST be fixed as part of that wave — not skipped. Loading spinners and empty states are FAILURES, not passes.**

## Stitch Design Rules (verify per screen)

1. Glassmorphic floating nav (pill dock, no borders)
2. Typography (Noto Serif headlines, Manrope body)
3. No-line rule (zero 1px borders)
4. Copper-gold gradients (#894d0d → #a76526)
5. Tonal layering (3+ surface levels)
6. Ghost borders only (rgba(216,195,180,0.20))
7. Ultra-diffused shadows (0.06 max, charcoal)
8. Editorial empty states (serif, warm, copper CTA)

## Epic-ordning & Beroenden

```
E01 Infrastructure & Seed Data ──┬── E02 Feed & Discover Fix
                                  ├── E03 Chat & Connect Fix
                                  ├── E04 Explore & Learn Fix
                                  ├── E05 Profile & Empty States
                                  └── E06 Final Regression (depends on E02-E05)
```

## Waves

### Wave 1: E01 — Infrastructure & Seed Data
- **Status:** DONE (2026-03-29T06:56)
- **Mål:** Backend + DB + seed data körande, API returnerar profiler/posts/konversationer
- **Beroenden:** Inga
- **Testgate:**
  - [x] API health OK — status: "ok", all services ok
  - [x] 22 profiler med foton queryable (20 with photos)
  - [x] 91 posts i feed
  - [x] 5 konversationer med 32 meddelanden
  - [x] 10 matches, 20 swipes — discovery stack populated
- **Learnings:** seed-dev-users.ts extended with social graph (swipes, matches, conversations, messages). seed.ts has pre-existing EducationTopic error (model missing from schema) — does not affect core data.

### Wave 2: E02 — Feed & Discover Screen Fix
- **Status:** VERIFIED (2026-03-29T07:10)
- **Mål:** Feed och Discover renderar med riktig data, alla 8 stitch-regler PASS
- **Beroenden:** E01
- **Testgate:**
  - [ ] Feed screenshot MED DATA: 8/8 stitch-regler PASS
  - [ ] Discover screenshot MED DATA: 8/8 stitch-regler PASS
  - BLOCKING: Inga tomma skärmar godkänns

### Wave 3: E03 — Chat & Connect Screen Fix
- **Status:** VERIFIED (2026-03-29T07:10)
- **Mål:** Chat-lista och ChatRoom renderar med konversationer/meddelanden synliga
- **Beroenden:** E01
- **Testgate:**
  - [ ] ConversationList screenshot MED DATA: 8/8 stitch-regler PASS
  - [ ] ChatRoom screenshot MED DATA: 8/8 stitch-regler PASS
  - BLOCKING: Inga tomma skärmar godkänns

### Wave 4: E04 — Explore & Learn Screen Fix
- **Status:** VERIFIED (2026-03-29T07:10)
- **Mål:** Explore och Learn renderar med kort/moduler synliga
- **Beroenden:** E01
- **Testgate:**
  - [ ] Explore screenshot MED DATA: 8/8 stitch-regler PASS
  - [ ] Learn screenshot MED DATA: 8/8 stitch-regler PASS
  - BLOCKING: Inga tomma skärmar godkänns

### Wave 5: E05 — Profile & Empty States
- **Status:** VERIFIED (2026-03-29T07:10)
- **Mål:** Profile renderar med full data, alla empty states editorial
- **Beroenden:** E01
- **Testgate:**
  - [ ] Profile screenshot MED DATA: 8/8 stitch-regler PASS
  - [ ] Empty states screenshot: editorial serif + copper CTA (inte emoji+text)
  - BLOCKING: Inga generiska empty states godkänns

### Wave 6: E06 — Final Regression & APK Delivery
- **Status:** IN_PROGRESS (2026-03-29T07:15)
- **Mål:** Full regression alla skärmar, release APK, Snotra delivery
- **Beroenden:** E02, E03, E04, E05
- **Testgate:**
  - [ ] ALLA 7 skärmar: 8/8 stitch-regler PASS (fullständig matris)
  - [ ] Release APK byggd
  - [ ] APK deployad till odin9
  - [ ] APK skickad till Snotra
  - BLOCKING: Noll undantag. ALLA skärmar, ALLA regler PASS.

## Parallelisering

- Wave 1: Sekventiell (prerequisite för alla)
- Wave 2-5: KAN köras parallellt (alla beror bara på E01)
- Wave 6: Sekventiell (beror på alla tidigare waves)

## Tidsuppskattning

| Wave | Epic | Estimat |
|------|------|---------|
| 1 | E01 Infrastructure & Seed Data | 1-2h |
| 2 | E02 Feed & Discover Fix | 2-3h |
| 3 | E03 Chat & Connect Fix | 2-3h |
| 4 | E04 Explore & Learn Fix | 2-3h |
| 5 | E05 Profile & Empty States | 2-3h |
| 6 | E06 Final Regression | 1-2h |
| **Total** | | **10-16h** |
