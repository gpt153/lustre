# E01 — Design Foundation (Tokens & Theme)

## Beskrivning
Uppdatera alla design tokens till stitch-specifikationen. Lägg till stitch-specifika tokens som saknas: surface-hierarki, gradienter, ghost borders, ultra-diffused shadows. Uppdatera Tamagui theme-konfigurationen så alla teman använder stitch-paletten.

## Acceptanskriterier
1. [ ] Primärfärg uppdaterad från `#B87333` till stitch `primary: #894d0d` med `primary_container: #a76526`
2. [ ] Alla 48 stitch namedColors definierade i tokens (surface-hierarki, on-colors, outline, etc.)
3. [ ] Gradient-tokens definierade: `copperGradient: ['#894d0d', '#a76526']` (135-graders vinkel)
4. [ ] Ghost border-tokens: `ghostBorder: 'rgba(216, 195, 180, 0.20)'` (outline_variant @ 20%)
5. [ ] Shadow-tokens uppdaterade till ultra-diffused: max 0.06 opacity, charcoal-baserad (`rgba(44, 36, 33, 0.06)`)
6. [ ] Typografi-tokens definierade: fontFamily heading (NotoSerif) och body (Manrope) med typografiskala
7. [ ] Tamagui theme (light_vanilla, dark_vanilla, light_spicy, dark_spicy) uppdaterade med stitch-tokens
8. [ ] Roundness-tokens: `full: 9999`, `xl: 48`, `lg: 32`, `md: 16`, `sm: 8`
9. [ ] Build (`pnpm build`) passerar utan fel efter tokenändringar

## Filer att ändra
- `packages/ui/src/tokens.ts`
- `packages/ui/src/themes.ts`
- `packages/ui/src/tamagui.config.ts`
- `apps/mobile/constants/tokens.ts`

## Tekniska detaljer

### Nya token-grupper att lägga till i tokens.ts:

```typescript
// Stitch surface hierarchy
surface: '#fef8f3',
surfaceContainerLowest: '#ffffff',
surfaceContainerLow: '#f8f3ee',
surfaceContainer: '#f2ede8',
surfaceContainerHigh: '#ece7e2',
surfaceContainerHighest: '#e6e2dd',
surfaceDim: '#ded9d4',
surfaceVariant: '#e6e2dd',

// Stitch on-colors (ALDRIG #000000)
onSurface: '#1d1b19',
onSurfaceVariant: '#524439',
onPrimary: '#ffffff',
onSecondary: '#ffffff',

// Stitch outline
outline: '#857467',
outlineVariant: '#d8c3b4',

// Stitch gradients
copperGradient: { start: '#894d0d', end: '#a76526', angle: 135 },

// Stitch ghost borders
ghostBorder: 'rgba(216, 195, 180, 0.20)',
```

### Shadow-uppdatering:
```typescript
// Nuvarande (för stark):
md: '0 2px 8px rgba(44, 36, 33, 0.1)'
// Stitch (ultra-diffused):
md: '0 8px 24px rgba(44, 36, 33, 0.06)'
xl: '0 12px 40px rgba(44, 36, 33, 0.06)'
```

### Theme-uppdatering:
Mappa stitch-tokens till Tamagui theme-properties. `background` -> `surface`, `borderColor` -> `ghostBorder`, `primary` -> stitch `primary`, etc.

## Testning
- `pnpm build` ska passera
- Verifiera att tokens exporteras korrekt via `pnpm test` (om typtest finns)
- Manuell kontroll: importera tokens i en testfil och logga alla värden

## DroidRun/odin9 verifiering
- Ingen direkt visuell verifiering i denna epic (tokens är datadefinitioner)
- Verifieras indirekt via E04-E07 när tokens används i komponenter
- Kontrollera att appen startar utan crash efter tokenändringar:
  ```bash
  ssh odin9 "cd ~/lustre && npx expo start --android"
  # Verifiera att appen laddar utan felmeddelande
  ```
