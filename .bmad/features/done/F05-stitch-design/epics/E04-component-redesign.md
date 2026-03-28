# E04 — Component Redesign

## Beskrivning
Omdesigna alla core UI-komponenter enligt stitch-specifikationen: LustreButton (copper-gold gradient, full roundness), LustreInput (no-box, surface-container-low bg), CardBase (no borders, tonal layering), BottomSheetBase och ModalBase (glassmorphism). Alla komponenter ska följa No-Line Rule och använda stitch-tokens.

## Acceptanskriterier
1. [ ] LustreButton: copper-gold gradient bakgrund (LinearGradient), full roundness (9999px), scale 0.95 vid press
2. [ ] LustreInput: ingen border (borderWidth: 0), surface-container-low bakgrund, copper focus-glow (inte border)
3. [ ] CardBase: ingen border, tonal layering (surface-container-lowest på surface-container), ultra-diffused shadow (0.06 opacity)
4. [ ] BottomSheetBase: glassmorphism (BlurView, 40% opacity surface-variant), xl roundness på toppen
5. [ ] ModalBase: glassmorphism backdrop, spring-animation 300-500ms ease-out
6. [ ] Alla komponenter använder stitch-tokens (inga hårdkodade hex-värden)
7. [ ] Inga 1px solid borders kvar i någon komponent (No-Line Rule)
8. [ ] Sekundär-knappar använder ghost border (outline_variant @ 20% opacity)

## Filer att ändra
- `packages/ui/src/LustreButton.tsx`
- `packages/ui/src/LustreInput.tsx`
- `packages/ui/src/CardBase.tsx`
- `packages/ui/src/BottomSheetBase.tsx`
- `packages/ui/src/ModalBase.tsx`
- `apps/mobile/components/EmptyState.tsx`

## Tekniska detaljer

### LustreButton med gradient:
Tamagui's `styled()` stöder inte LinearGradient direkt. Wrap med `expo-linear-gradient`:

```tsx
import { LinearGradient } from 'expo-linear-gradient'

export function LustreButton({ children, variant, onPress, ...props }) {
  if (variant === 'secondary') {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
        <YStack
          borderRadius={9999}
          borderWidth={1}
          borderColor="rgba(216, 195, 180, 0.20)" // ghost border
          paddingHorizontal="$lg"
          paddingVertical="$sm"
        >
          <Text color="$primary" fontFamily="$body" fontWeight="600">{children}</Text>
        </YStack>
      </Pressable>
    )
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
      <LinearGradient
        colors={['#894d0d', '#a76526']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 9999, paddingHorizontal: 24, paddingVertical: 12 }}
      >
        <Text color="#ffffff" fontFamily="$body" fontWeight="600" textAlign="center">{children}</Text>
      </LinearGradient>
    </Pressable>
  )
}
```

### LustreInput no-box:
```tsx
export const LustreInput = styled(Input, {
  borderRadius: 9999, // full roundness
  borderWidth: 0, // NO borders
  backgroundColor: '#f8f3ee', // surface-container-low
  color: '#1d1b19', // on-surface
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  fontSize: 16,
  fontFamily: '$body',
  placeholderTextColor: '#524439', // on-surface-variant

  focusStyle: {
    backgroundColor: '#e6e2dd', // surface-container-highest
    // Copper glow via shadow, inte border
    shadowColor: '#894d0d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
})
```

### CardBase tonal layering:
```tsx
export const CardBase = styled(YStack, {
  backgroundColor: '#ffffff', // surface-container-lowest (elevated)
  borderRadius: 16,
  borderWidth: 0, // NO borders
  padding: '$md',
  // Ultra-diffused shadow
  shadowColor: '#2C2421',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.06,
  shadowRadius: 40,
  elevationAndroid: 2,
})
```

### Empty States:
Byt ut generiska emoji empty states till editorial boutique-hotel-estetik:
- Använd Noto Serif för rubriker
- Subtila copper-accenter
- Generöst whitespace
- Ingen generisk emoji — istället elegant typografi eller minimalistisk illustration

## Testning
- Rendera varje komponent isolerat och verifiera visuellt
- Kontrollera att gradient renderar korrekt på Android (expo-linear-gradient)
- Verifiera att BlurView fungerar i BottomSheet/Modal
- Testa press-animation (scale 0.95) på knappar

## DroidRun/odin9 verifiering
1. Navigera till en skärm som innehåller alla komponenter (t.ex. Profile Edit)
2. Ta screenshots:
   - **Knappar:** Verifiera gradient (koppar → guld), rounded corners, ingen flat färg
   - **Input:** Verifiera att ingen border syns, bakgrunden är ljust beige, focus ger copper glow
   - **Kort:** Verifiera att kort inte har borders, subtil shadow synlig
   - **Bottom Sheet:** Öppna en bottom sheet — verifiera glassmorphism (blurrad bakgrund synlig)
3. Pixel-check: Zooma in på screenshots för att verifiera att inga 1px-linjer finns
4. Maestro-flöde:
```yaml
appId: com.lovelustre.app
---
- launchApp
- tapOn: "Profile"
- takeScreenshot: "components_profile"
- tapOn: "Redigera"
- takeScreenshot: "components_edit_form"
```
