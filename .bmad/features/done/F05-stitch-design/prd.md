# F05 — Stitch Design System: PRD

## 1. Problemformulering

Lustres mobilapp ser ut som en generisk prototyp. Nuvarande UI saknar alla stitch-designsystemets kärnprinciper:

**Nuläge (prototyp):**
- Platt färgpalett med `copper: #B87333` som primär — saknar stitch-systemets rika `primary: #894d0d` + `primary_container: #a76526`
- Inga gradienter (copper-gold gradient saknas helt)
- Standard borders (1px solid) — bryter mot stitch "No-Line Rule"
- Saknar glassmorphism på navigation och modals
- Typografi: General Sans + Inter — ska vara Noto Serif (headlines) + Manrope (body)
- Standard tab bar med borderTop — ska vara floating glassmorphic dock
- Komponenter har hårda hörn (12px) istället för full roundness (9999px/3rem)
- Shadows med 10-20% opacity — ska vara ultra-diffused (6% opacity charcoal-baserad)
- Inga tonal layering-nivåer (surface → surface-container → surface-container-high)
- Saknar editorial asymmetri och "boutique hotel"-känsla
- Input-fält har box-borders istället för no-box stitch-stil

**Mål (stitch-design):**
Transformera appen till "The Digital Boutique Hotel" — en high-end editorial-upplevelse som känns som en lyxig lifestyle-tidning, inte en app-mall.

## 2. Framgångskriterier

| Kriterie | Mätning |
|----------|---------|
| Stitch-färgpalett implementerad | Alla 48 stitch-tokens mappade i tokens.ts |
| No-Line Rule | 0 synliga 1px-borders i appen (verifieras via screenshot) |
| Typografi | Noto Serif på alla headlines, Manrope på all body text |
| Navigation | Glassmorphic floating dock med 5 tabs, backdrop-blur |
| Gradienter | Copper-gold gradient på primära CTAs |
| Shadows | Ultra-diffused (max 0.06 opacity, charcoal-baserad) |
| Roundness | Full roundness (9999px) på knappar, xl (24px) på kort |
| Tonal layering | Min 3 surface-nivåer synliga per skärm |
| UI-test | Maestro-flöden på odin9 validerar varje skärm |

## 3. Scope

### Inkluderat
- Design tokens (färger, typografi, spacing, shadows, gradienter, ghost borders)
- Tamagui theme-konfiguration med stitch-tokens
- Navigation: glassmorphic floating dock med 5 tabs
- Alla core-komponenter: LustreButton, LustreInput, CardBase, ModalBase, BottomSheetBase
- Skärmar: Discover, Connect/Chat, Explore, Profile
- Typografisystem: Noto Serif + Manrope
- UI-testning med Maestro på odin9

### Exkluderat
- Web-appen (Next.js — egen feature)
- Backend-ändringar
- Nya features/funktionalitet
- Darkmode (fokus på lightmode först, dark-tokens definieras men implementeras ej)
- Animationer och micro-interactions (hanteras av F32-UX-design-excellence)

## 4. Designspecifikationer från Stitch

### 4.1 Färgpalett (stitch-tokens)

```
primary:                 #894d0d   (koppar, mörkare än nuvarande #B87333)
primary_container:       #a76526   (koppar-kontrast)
secondary:               #795900   (guld)
secondary_container:     #fece65   (guld-highlight)
tertiary:                #9f3c1e   (ember/varning)
tertiary_container:      #bf5334

surface:                 #fef8f3   (primär canvas)
surface_container_low:   #f8f3ee   (sekundära sektioner)
surface_container:       #f2ede8   (kort-bakgrund)
surface_container_high:  #ece7e2   (interaktiva kort)
surface_container_highest: #e6e2dd (aktiva element)
surface_container_lowest: #ffffff  (upphöjda kort)

on_surface:              #1d1b19   (text, ALDRIG #000000)
on_surface_variant:      #524439   (sekundär text)
outline:                 #857467   (toned ned)
outline_variant:         #d8c3b4   (ghost borders vid 20% opacity)

error:                   #ba1a1a
on_error:                #ffffff
```

### 4.2 Typografi

| Roll | Font | Användning |
|------|------|-----------|
| Display/Headlines | Noto Serif | Profilnamn, skärmtitlar, editorial-texter |
| Body/Labels | Manrope | Meddelanden, bios, UI-text, knappar |

**Typografiskala:**
- display-lg: 3.5rem (56px) — hero-skärmar, tight letter-spacing (-0.02em)
- display-md: 2.5rem (40px)
- headline-lg: 2rem (32px)
- headline-md: 1.75rem (28px)
- headline-sm: 1.5rem (24px)
- body-lg: 1.125rem (18px)
- body-md: 1rem (16px)
- body-sm: 0.875rem (14px)
- label-lg: 0.875rem (14px) — versaler, spärrad
- label-md: 0.75rem (12px)

### 4.3 Navigation

**Glassmorphic Floating Dock:**
- Position: floating, centrerad i botten
- Bakgrund: surface (#fef8f3) @ 80% opacity
- Backdrop-blur: 20px
- Roundness: xl (3rem / 48px)
- 5 synliga tabs: Discover, Connect, Explore, Learn, Profile
- Aktiv tab: primary (#894d0d) ikon
- Inaktiv tab: outline (#857467) ikon
- Inga borders på tab bar

### 4.4 Komponenter

**Knappar:**
- Primär: gradient primary → primary_container, full roundness (9999px), scale 0.95 vid press
- Sekundär: transparent bg, ghost border (outline_variant @ 20%), primary text
- Roundness: full (9999px) eller xl (3rem)

**Input:**
- Ingen box-border
- Bakgrund: surface-container-low
- Full roundness
- Focus: övergång till surface-container-highest + primary cursor/glow
- Ingen tjock border vid focus

**Kort:**
- Ingen 1px border (No-Line Rule)
- Tonal layering: surface-container-lowest kort på surface-container bakgrund
- Ultra-diffused shadow: 0 12px 40px rgba(44, 36, 33, 0.06)
- Min roundness: 16px (DEFAULT), profil-bilder 32px (xl)

**Modals/Bottom Sheets:**
- Glassmorphism: surface-variant @ 40% opacity, 24px backdrop-blur
- Organisk handle i toppen
- Spring-animation (300-500ms, ease-out)

### 4.5 Regler

1. **No-Line Rule:** Inga 1px solid borders. Använd bakgrundsfärgskiften.
2. **No Hard Black:** Aldrig #000000. Använd on_surface (#1d1b19).
3. **Tonal Layering:** Djup genom bakgrundsfärg-hierarki, inte skuggor.
4. **Ghost Borders:** Om border krävs: outline_variant (#d8c3b4) @ 20% opacity.
5. **Intentional Asymmetry:** Bilder som blöder utanför, överlappande element.
6. **Whitespace as Luxury:** Generöst spacing (2rem+) mellan sektioner.
7. **Slow Ease-Out:** Animationer 300-500ms, inga "snappy/bouncy" animationer.
8. **Copper/Gold Sparingly:** Använd primary och secondary sparsamt som highlights.
