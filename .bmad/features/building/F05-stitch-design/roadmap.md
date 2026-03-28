# F05 — Stitch Design System: Roadmap

## Översikt

Åtta epics som transformerar Lustre-appen från generisk prototyp till stitch-designsystemet ("The Digital Boutique Hotel"). Varje epic är en wave i `/bygg`.

## Epic-ordning & Beroenden

```
E01 Design Foundation ────────┐
                               ├── E04 Component Redesign
E03 Typography System ────────┘         │
                                        ├── E05 Discover Screen
E02 Navigation Overhaul ────────────────├── E06 Chat & Feed
                                        ├── E07 Explore & Profile
                                        │
                                        └── E08 UI Testing (odin9)
```

## Waves

### Wave 1: E01 — Design Foundation (Tokens & Theme)
- **Status:** VERIFIED (2026-03-28T22:15:00Z)
- **Mål:** Alla stitch-tokens definierade, Tamagui theme uppdaterat
- **Beroenden:** Inga
- **Verifiering:** Token-filer exporterar korrekt, TypeScript passerar
- **UI-checkpoint:** Nej (inga synliga ändringar ännu)
- **Resultat:** 48 stitch-tokens, surface-hierarki, gradients, ghost borders, ultra-diffused shadows, roundness-tokens

### Wave 2: E03 — Typography System
- **Mål:** Noto Serif + Manrope installerade och konfigurerade
- **Beroenden:** E01 (tokens refererar typografi-tokens)
- **Verifiering:** Fonter laddas korrekt i Expo, screenshot visar serif-headlines
- **UI-checkpoint:** Ja — verifiera typografi på en skärm via odin9

### Wave 3: E02 — Navigation Overhaul
- **Mål:** Glassmorphic floating dock med 5 tabs, inga debug-rubriker
- **Beroenden:** E01 (tokens för färger/opacity)
- **Verifiering:** Screenshot visar floating dock med backdrop-blur
- **UI-checkpoint:** Ja — verifiera navigation via odin9

### Wave 4: E04 — Component Redesign
- **Mål:** Alla core-komponenter omdesignade enligt stitch
- **Beroenden:** E01 (tokens), E03 (typografi)
- **Verifiering:** Komponenter renderar korrekt, inga borders synliga
- **UI-checkpoint:** Ja — verifiera komponenter via test-skärm

### Wave 5: E05 — Discover Screen
- **Mål:** Fullskärms-fotokort, copper-gradient overlay, action buttons
- **Beroenden:** E01, E02, E03, E04
- **Verifiering:** Screenshot matchar stitch-design
- **UI-checkpoint:** Ja — komplett Discover-skärm på odin9

### Wave 6: E06 — Chat & Feed Screens
- **Mål:** Editorial chat-lista, private sanctuary feed
- **Beroenden:** E01, E02, E03, E04
- **Verifiering:** Inga horisontella dividers, copper spinners
- **UI-checkpoint:** Ja — Chat och Feed på odin9

### Wave 7: E07 — Explore & Profile Screens
- **Mål:** Tonal layering-kort, asymmetrisk profilhero
- **Beroenden:** E01, E02, E03, E04
- **Verifiering:** Screenshot matchar stitch-design
- **UI-checkpoint:** Ja — Explore och Profile på odin9

### Wave 8: E08 — UI Testing on odin9
- **Mål:** Komplett Maestro-testsvit, automatisk screenshot-verifiering
- **Beroenden:** E01-E07 (alla visuella epics)
- **Verifiering:** Alla Maestro-flöden passerar, screenshots dokumenterade
- **UI-checkpoint:** Ja — fullständig regression

## Tidsuppskattning

| Wave | Epic | Estimat |
|------|------|---------|
| 1 | E01 Design Foundation | 2-3h |
| 2 | E03 Typography System | 1-2h |
| 3 | E02 Navigation Overhaul | 2-3h |
| 4 | E04 Component Redesign | 3-4h |
| 5 | E05 Discover Screen | 3-4h |
| 6 | E06 Chat & Feed | 2-3h |
| 7 | E07 Explore & Profile | 2-3h |
| 8 | E08 UI Testing | 2-3h |
| **Total** | | **17-25h** |

## Risker

1. **Backdrop-filter på Android:** `backdrop-filter: blur()` fungerar ej nativt i React Native. Kräver `expo-blur` (BlurView) eller solid fallback.
2. **Gradient-knappar:** LinearGradient i Tamagui-knappar kräver wrapper med `expo-linear-gradient`.
3. **Noto Serif-laddning:** Expo-fonts kan ta tid — behöver skelett-laddare under font-load.
4. **Asymmetrisk layout:** React Native's Flexbox stöder inte "bleed off-screen" lika enkelt — kräver negative margins och overflow.
5. **Ghost borders på Android:** `borderColor` med opacity kan rendera annorlunda på Android vs iOS.

## Checkpoints

Efter varje wave körs:
```bash
~/bin/notify-snotra.sh wave_complete F05-stitch-design --wave N --total 8 --message "Wave N klar"
```

Vid slutförande:
```bash
~/bin/notify-snotra.sh build_complete F05-stitch-design --message "Stitch-design fullt implementerat"
```
