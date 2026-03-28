# E08 — UI Testing on odin9

## Beskrivning
Skapa en komplett Maestro-testsvit som verifierar att stitch-designen faktiskt ser ut som den ska på Android-emulatorn odin9. Varje skärm ska ha ett dedikerat testflöde med screenshots. Dokumentera expected vs actual för varje stitch-regel.

## Acceptanskriterier
1. [ ] Maestro-flöden skapade för alla 5 tabs (Discover, Connect, Explore, Learn, Profile)
2. [ ] Varje flöde tar screenshots av skärmen i sitt default-state
3. [ ] Screenshot-verifiering av: färgpalett, typografi, inga borders, gradients, rounded corners
4. [ ] Komplett testsvit kan köras med ett enda kommando
5. [ ] Testresultat dokumenterat: pass/fail per stitch-regel per skärm
6. [ ] Regressions-guard: testsviten kan köras om efter framtida ändringar
7. [ ] Screenshots sparade i `e2e/screenshots/stitch/` för manuell review

## Filer att ändra
- `e2e/maestro/stitch-discover.yaml`
- `e2e/maestro/stitch-connect.yaml`
- `e2e/maestro/stitch-explore.yaml`
- `e2e/maestro/stitch-learn.yaml`
- `e2e/maestro/stitch-profile.yaml`
- `e2e/maestro/stitch-full-suite.yaml`
- `e2e/maestro/stitch-components.yaml`

## Tekniska detaljer

### Maestro-konfiguration:
Maestro finns på: `~/.maestro/bin/maestro`
Emulator: odin9, port emulator-5570
App-paket: com.lovelustre.app

### Stitch Discover-test:
```yaml
# e2e/maestro/stitch-discover.yaml
appId: com.lovelustre.app
---
- launchApp:
    clearState: true

# Discover är default-tab
- assertVisible: "Discover"
- takeScreenshot: "stitch/discover_default"

# Sub-tabs
- tapOn: "Intentioner"
- takeScreenshot: "stitch/discover_intentions"
- tapOn: "Bläddra"
- takeScreenshot: "stitch/discover_browse"
- tapOn: "Matchningar"
- takeScreenshot: "stitch/discover_matches"
- tapOn: "Sök"
- takeScreenshot: "stitch/discover_search"
```

### Stitch Connect-test:
```yaml
# e2e/maestro/stitch-connect.yaml
appId: com.lovelustre.app
---
- launchApp
- tapOn: "Connect"
- takeScreenshot: "stitch/connect_list"

# Om konversationer finns, öppna första
- tapOn:
    index: 0
    optional: true
- takeScreenshot: "stitch/connect_chat_room"
```

### Stitch Full Suite:
```yaml
# e2e/maestro/stitch-full-suite.yaml
appId: com.lovelustre.app
---
- runFlow: stitch-discover.yaml
- runFlow: stitch-connect.yaml
- runFlow: stitch-explore.yaml
- runFlow: stitch-learn.yaml
- runFlow: stitch-profile.yaml
- runFlow: stitch-components.yaml
```

### Körning:
```bash
ssh odin9 "~/.maestro/bin/maestro test ~/lustre/e2e/maestro/stitch-full-suite.yaml"
```

### Stitch-regler att verifiera per screenshot:

| Regel | Vad att leta efter | Verifiering |
|-------|-------------------|-------------|
| No-Line Rule | Inga synliga 1px borders | Visuell granskning |
| Typografi | Serif på headlines, sans-serif på body | Font-utseende |
| Färgpalett | Copper #894d0d, ej #B87333 | Pixel-färg |
| Tonal layering | Olika bakgrundsnyanser per nivå | Kontrastskillnad |
| Roundness | Rounded corners på knappar/kort | Visuell granskning |
| Ghost borders | Max 20% opacity om border finns | Subtilitet |
| Gradient | Copper→gold gradient på primära CTAs | Gradient synlig |
| Navigation | Floating dock, 5 tabs, blur | Visuell granskning |
| Shadows | Ultra-diffused (knappt synlig) | Subtil skugga |
| Asymmetri | Editorial offset på profil-hero | Layout-granskning |

### Automatisk verifiering:
Maestro har inte inbyggd pixel-jämförelse, men screenshots kan:
1. Sparas som baseline i `e2e/screenshots/stitch/baseline/`
2. Jämföras manuellt eller med `pixelmatch` / `resemblejs`
3. Dokumenteras i en checklista

## Testning
- Kör hela testsviten på odin9
- Verifiera att alla screenshots sparas korrekt
- Granska varje screenshot mot stitch-reglerna
- Dokumentera avvikelser

## DroidRun/odin9 verifiering
1. SSH till odin9:
```bash
ssh odin9
```

2. Starta emulatorn (om inte redan igång):
```bash
emulator @odin9 -port 5570 &
```

3. Installera appen:
```bash
adb -s emulator-5570 install ~/lustre/apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

4. Kör hela testsviten:
```bash
~/.maestro/bin/maestro test ~/lustre/e2e/maestro/stitch-full-suite.yaml --device emulator-5570
```

5. Granska screenshots:
```bash
ls ~/lustre/e2e/screenshots/stitch/
```

6. Skapa verifieringsrapport:
- Fyll i checklista per skärm per stitch-regel
- Markera pass/fail
- Ta om screenshots efter fix av avvikelser
