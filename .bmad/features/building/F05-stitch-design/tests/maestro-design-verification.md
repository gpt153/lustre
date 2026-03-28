# Maestro Design Verification — Stitch Design System

## Översikt

Denna spec definierar alla Maestro-flöden som verifierar att stitch-designsystemet är korrekt implementerat i Lustre-appen. Testerna körs på odin9 (Android emulator, port emulator-5570).

## Miljö

| Parameter | Värde |
|-----------|-------|
| Emulator | odin9 |
| Port | emulator-5570 |
| Maestro | `~/.maestro/bin/maestro` |
| App-paket | com.lovelustre.app |
| Screenshots | `~/lustre/e2e/screenshots/stitch/` |
| Baseline | `~/lustre/e2e/screenshots/stitch/baseline/` |

## Maestro-flöden

### 1. stitch-discover.yaml
**Verifierar:** Discover-skärmens stitch-implementation
**Screenshots:**
- `discover_default` — huvudvy med fotokort
- `discover_intentions` — Intentioner sub-tab
- `discover_browse` — Bläddra sub-tab
- `discover_matches` — Matchningar sub-tab
- `discover_search` — Sök sub-tab

**Stitch-regler att kontrollera:**
- [ ] Fullskärms-fotokort med gradient overlay
- [ ] Copper/charcoal gradient i botten av fotot
- [ ] Profilnamn i Noto Serif
- [ ] 3 action-knappar med rätt färger (copper, charcoal, gold)
- [ ] Floating dock synlig med 5 tabs
- [ ] Sub-tabs utan border-underline (färgskifte istället)
- [ ] Bakgrund: warm white (#fef8f3)

### 2. stitch-connect.yaml
**Verifierar:** Chat-lista och chat-rum
**Screenshots:**
- `connect_list` — konversationslista
- `connect_chat_room` — aktivt chattrum (om data finns)

**Stitch-regler att kontrollera:**
- [ ] Inga horisontella dividers mellan konversationer
- [ ] Varje konversation i rounded surface-container-low pod
- [ ] 32px gap mellan konversationer
- [ ] Egna bubblor: copper gradient
- [ ] Mottagarens bubblor: surface-container-low
- [ ] Profilbilder: xl roundness (32px)
- [ ] Header visar "Connect" (inte "connect/index")

### 3. stitch-explore.yaml
**Verifierar:** Explore-skärmen med kategori-kort
**Screenshots:**
- `explore_main` — huvudvy
- `explore_groups` — Grupper
- `explore_events` — Evenemang
- `explore_shop` — Shop

**Stitch-regler att kontrollera:**
- [ ] Kategori-kort utan borders
- [ ] Tonal layering: vita kort på beige bakgrund
- [ ] Rounded corners (24px) på alla kort
- [ ] Ultra-diffused shadows (knappt synliga)
- [ ] Korrekta headers ("Grupper", "Evenemang", etc.)

### 4. stitch-learn.yaml
**Verifierar:** Learn-skärmen med moduler
**Screenshots:**
- `learn_main` — modullista
- `learn_module_detail` — moduldetalj (om data finns)

**Stitch-regler att kontrollera:**
- [ ] Modul-kort utan borders
- [ ] Tonal layering
- [ ] Typografi: modultitlar i serif, beskrivningar i sans-serif
- [ ] Header visar "Learn"

### 5. stitch-profile.yaml
**Verifierar:** Profil-vy och redigering
**Screenshots:**
- `profile_view` — profilvy
- `profile_edit` — redigeringsläge (om tillgängligt)

**Stitch-regler att kontrollera:**
- [ ] Asymmetrisk hero-foto med gradient fade
- [ ] Namn i Noto Serif, overlappande foto
- [ ] Bio i Manrope
- [ ] Sektioner separerade med bakgrundsfärgskiften (inte linjer)
- [ ] Input-fält: no-box stil, surface-container-low bakgrund
- [ ] Inga horisontella dividers

### 6. stitch-components.yaml
**Verifierar:** Individuella komponenters stitch-efterlevnad
**Screenshots:**
- `component_buttons` — knapp-varianter
- `component_inputs` — input-fält med/utan focus
- `component_cards` — kort-varianter
- `component_bottom_sheet` — öppen bottom sheet
- `component_modal` — öppen modal

**Stitch-regler att kontrollera:**
- [ ] Primär knapp: copper-gold gradient, full roundness
- [ ] Sekundär knapp: ghost border (outline_variant @ 20%)
- [ ] Input: ingen border, surface-container-low bakgrund
- [ ] Kort: ingen border, ultra-diffused shadow
- [ ] Bottom sheet: glassmorphism (blurrad bakgrund)
- [ ] Modal: glassmorphism backdrop

### 7. stitch-full-suite.yaml
**Kör alla flöden i sekvens:**
```yaml
appId: com.lovelustre.app
---
- runFlow: stitch-discover.yaml
- runFlow: stitch-connect.yaml
- runFlow: stitch-explore.yaml
- runFlow: stitch-learn.yaml
- runFlow: stitch-profile.yaml
- runFlow: stitch-components.yaml
```

## Hur man kör

### Full svit:
```bash
ssh odin9 "~/.maestro/bin/maestro test ~/lustre/e2e/maestro/stitch-full-suite.yaml --device emulator-5570"
```

### Enskilt flöde:
```bash
ssh odin9 "~/.maestro/bin/maestro test ~/lustre/e2e/maestro/stitch-discover.yaml --device emulator-5570"
```

### Spara screenshots lokalt:
```bash
scp -r odin9:~/lustre/e2e/screenshots/stitch/ ~/lustre/e2e/screenshots/stitch/
```

## Visuella kriterier per skärm

### Övergripande (alla skärmar):
| Kriterie | Förväntat | Metod |
|----------|-----------|-------|
| Inga 1px borders | Noll synliga linjer | Visuell granskning |
| Typografi | Serif headlines, sans body | Font-kontroll |
| Färgpalett | Copper=#894d0d, inte #B87333 | Pixel-sampling |
| Floating dock | 5 tabs, rounded, blur-effekt | Screenshot |
| Shadows | Knappt synliga, diffused | Visuell granskning |
| Roundness | Min 16px på kort, 9999px på knappar | Visuell granskning |
| No hard black | Aldrig #000000 | Pixel-sampling |
| Whitespace | Generöst (32px+) mellan sektioner | Layout-kontroll |

### Per-skärm specifikt:
| Skärm | Unikt kriterie |
|-------|---------------|
| Discover | Fullskärms-foto, gradient overlay, 3 action-knappar |
| Connect | Konversationer i rounded pods, copper chat-bubblor |
| Explore | Tonal layering-kort, bakgrundsfärgskiften |
| Learn | Modul-kort med tonal layering |
| Profile | Asymmetrisk hero, overlappande namn, sektionsgrupper |

## Regressions-strategi

1. **Baseline-screenshots:** Spara godkända screenshots i `baseline/`
2. **Diff-kontroll:** Efter varje ändring, kör sviten och jämför med baseline
3. **Manuell review:** Stitch-regler som inte kan automatiseras granskas manuellt
4. **CI-integration:** Framtida integration med bildanalys (pixelmatch/resemblejs)

## Snotra-notifikationer

Efter testkörning:
```bash
# Om alla tester passerar:
~/bin/notify-snotra.sh wave_complete F05-stitch-design --wave 8 --total 8 --message "UI-testsvit klar, alla screenshots godkända"

# Om avvikelser hittas:
~/bin/notify-snotra.sh error F05-stitch-design --status failed --message "UI-test: N avvikelser hittade — se screenshots"
```
