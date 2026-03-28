# E03 — Typography System

## Beskrivning
Installera och konfigurera Noto Serif och Manrope som primära typsnitt i Expo-appen. Skapa en komplett typografiskala enligt stitch-specifikationen. Alla headlines ska använda serif, all body-text sans-serif.

## Acceptanskriterier
1. [ ] Noto Serif (Regular, Bold, Italic) installerat och laddat via `expo-font` / `useFonts`
2. [ ] Manrope (Regular, Medium, SemiBold, Bold) installerat och laddat via `expo-font`
3. [ ] Expo app.json/config uppdaterad med font-assets
4. [ ] Typografiskala definierad: display-lg (56px) → label-md (12px) med 10 steg
5. [ ] Tamagui fonts-konfiguration uppdaterad med NotoSerif + Manrope
6. [ ] Alla befintliga `$heading`-referenser pekar på NotoSerif
7. [ ] Alla befintliga `$body`-referenser pekar på Manrope
8. [ ] Display-lg har tight letter-spacing (-0.02em) för premium print-look

## Filer att ändra
- `packages/ui/src/tamagui.config.ts`
- `packages/ui/src/fonts/expo-loader.ts`
- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app.json` (eller `app.config.ts`)

## Tekniska detaljer

### Font-installation:
```bash
npx expo install @expo-google-fonts/noto-serif @expo-google-fonts/manrope expo-font
```

### Font-laddning i _layout.tsx:
```tsx
import { useFonts, NotoSerif_400Regular, NotoSerif_700Bold, NotoSerif_400Regular_Italic } from '@expo-google-fonts/noto-serif'
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope'

const [fontsLoaded] = useFonts({
  NotoSerif_400Regular,
  NotoSerif_700Bold,
  NotoSerif_400Regular_Italic,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
})
```

### Tamagui font-konfiguration:
```typescript
import { createFont } from 'tamagui'

const headingFont = createFont({
  family: 'NotoSerif_400Regular',
  size: {
    1: 12, 2: 14, 3: 16, 4: 18, 5: 24, 6: 28, 7: 32, 8: 40, 9: 56,
  },
  lineHeight: {
    1: 16, 2: 20, 3: 22, 4: 24, 5: 32, 6: 36, 7: 40, 8: 48, 9: 64,
  },
  weight: {
    4: '400',
    7: '700',
  },
  letterSpacing: {
    9: -0.02 * 56, // display-lg: tight
  },
  face: {
    400: { normal: 'NotoSerif_400Regular', italic: 'NotoSerif_400Regular_Italic' },
    700: { normal: 'NotoSerif_700Bold' },
  },
})

const bodyFont = createFont({
  family: 'Manrope_400Regular',
  size: {
    1: 12, 2: 14, 3: 16, 4: 18,
  },
  weight: {
    4: '400',
    5: '500',
    6: '600',
    7: '700',
  },
  face: {
    400: { normal: 'Manrope_400Regular' },
    500: { normal: 'Manrope_500Medium' },
    600: { normal: 'Manrope_600SemiBold' },
    700: { normal: 'Manrope_700Bold' },
  },
})
```

### Typografiskala-mappning:
| Token | Font | Storlek | Användning |
|-------|------|---------|-----------|
| display-lg | NotoSerif Bold | 56px | Hero-skärmar |
| display-md | NotoSerif Bold | 40px | Skärmtitlar |
| headline-lg | NotoSerif Bold | 32px | Sektion-rubriker |
| headline-md | NotoSerif Regular | 28px | Kortrubriker |
| headline-sm | NotoSerif Regular | 24px | Underrubriker |
| body-lg | Manrope Medium | 18px | Framhävd text |
| body-md | Manrope Regular | 16px | Standard brödtext |
| body-sm | Manrope Regular | 14px | Sekundär text |
| label-lg | Manrope SemiBold | 14px | Knappar, versaler |
| label-md | Manrope Medium | 12px | Metadata |

## Testning
- Verifiera att alla fonter laddas utan timeout
- Kontrollera att splash screen visas tills fonter är laddade
- Testa att serif syns på headlines och sans-serif på body i en verklig skärm

## DroidRun/odin9 verifiering
1. Starta appen på odin9
2. Ta screenshot av Discover-skärmen
3. Verifiera visuellt:
   - Profilnamn visas i serif (Noto Serif) — tydliga seriffer synliga
   - Body-text (bio) visas i sans-serif (Manrope) — ren, geometrisk
   - Storleksskillnaden mellan headline och body är markant ("premium print")
4. Ta screenshot av Profile-skärmen
5. Verifiera att "Profil"-titeln är i serif
6. Maestro-flöde:
```yaml
appId: com.lovelustre.app
---
- launchApp
- takeScreenshot: "typography_discover"
- tapOn: "Profile"
- takeScreenshot: "typography_profile"
```
