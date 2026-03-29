# E06 — Final Regression & APK Delivery

**Wave:** 6
**Model:** sonnet
**Depends on:** E02, E03, E04, E05

## Beskrivning

Full regression: screenshota ALLA 5 tabs med data. Dokumentera per-skärm, per-regel PASS/FAIL-matris. Bygg release APK. Deploya till odin9. Skicka till Snotra.

## Acceptance Criteria

1. Screenshot av ALLA 5 huvudtabs med riktig data synlig (inte loading/empty)
2. Per-skärm checklist med ALLA 8 stitch-regler dokumenterade
3. ALLA regler PASS på ALLA skärmar — noll undantag
4. Release APK byggd utan fel
5. APK deployad till odin9 och verifierad
6. APK skickad till Snotra via notify-snotra.sh apk_ready
7. Maestro-flöden uppdaterade och körda på odin9
8. Roadmap uppdaterad till DONE med fullständig resultatmatris

## File Paths

- `e2e/maestro/stitch-discover.yaml`
- `e2e/maestro/stitch-connect.yaml`
- `e2e/maestro/stitch-explore.yaml`
- `e2e/maestro/stitch-learn.yaml`
- `e2e/maestro/stitch-profile.yaml`
- `e2e/maestro/stitch-full-suite.yaml`

## Testgate

**BLOCKING: ALLA skärmar, ALLA regler PASS. Noll undantag.**

Fullständig matris:

| Skärm | Nav | Typo | No-line | Copper | Tonal | Ghost | Shadow | Editorial |
|-------|-----|------|---------|--------|-------|-------|--------|-----------|
| Feed | | | | | | | | |
| Discover | | | | | | | | |
| Chat List | | | | | | | | |
| Chat Room | | | | | | | | |
| Explore | | | | | | | | |
| Learn | | | | | | | | |
| Profile | | | | | | | | |

Varje cell: PASS eller FAIL med kort beskrivning av vad som syns.
