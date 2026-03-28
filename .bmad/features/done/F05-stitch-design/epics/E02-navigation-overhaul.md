# E02 — Navigation Overhaul

## Beskrivning
Ersätt den standard tab bar med en glassmorphic floating dock enligt stitch-specifikationen. Bara 5 synliga tabs (Discover, Connect, Explore, Learn, Profile). Ta bort debug route-namn från headers. Sekundära routes (chat, coach, consent, etc.) som redan har `href: null` behåller det men ska inte synas alls.

## Acceptanskriterier
1. [ ] Tab bar är en floating dock centrerad i botten med xl roundness (48px)
2. [ ] Tab bar-bakgrund: surface (#fef8f3) @ 80% opacity med backdrop-blur (expo-blur BlurView)
3. [ ] Exakt 5 synliga tabs: Discover, Connect, Explore, Learn, Profile
4. [ ] Aktiv tab-ikon: primary (#894d0d), inaktiv: outline (#857467)
5. [ ] Ingen `borderTopColor` på tab bar (No-Line Rule)
6. [ ] Headers visar korrekta titlar (inte "index", "chat/index" etc.)
7. [ ] Tab-ikoner: thin-stroke phosphor-ikoner (weight: "light" inaktiv, "regular" aktiv)
8. [ ] Marginal under floating dock: 16px från skärmkanten
9. [ ] Appen kraschar inte vid navigation mellan alla tabs

## Filer att ändra
- `apps/mobile/app/(tabs)/_layout.tsx`
- `apps/mobile/app/(tabs)/discover/_layout.tsx`
- `apps/mobile/app/(tabs)/connect/_layout.tsx`
- `apps/mobile/app/(tabs)/explore/_layout.tsx`
- `apps/mobile/app/(tabs)/learn/_layout.tsx`
- `apps/mobile/app/(tabs)/profile/_layout.tsx`

## Tekniska detaljer

### Floating dock-implementation:
Expo Router's `Tabs` stöder custom `tabBar`-prop. Skapa en custom `FloatingDock`-komponent:

```tsx
import { BlurView } from 'expo-blur'

function FloatingDock({ state, descriptors, navigation }) {
  return (
    <View style={styles.dockContainer}>
      <BlurView intensity={80} tint="light" style={styles.dock}>
        {/* 5 tab-ikoner */}
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  dock: {
    flexDirection: 'row',
    borderRadius: 48,
    backgroundColor: 'rgba(254, 248, 243, 0.80)', // surface @ 80%
    paddingVertical: 12,
    paddingHorizontal: 24,
    overflow: 'hidden',
    // Ultra-diffused shadow
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
})
```

### Android fallback:
`expo-blur` fungerar på Android via `@react-native-community/blur`. Om prestanda är dålig, använd solid `rgba(254, 248, 243, 0.92)` istället.

### Header-fix:
Sätt `headerTitle` explicit på varje Tabs.Screen-grupp. Ta bort alla `name="index"` som genererar "index" som header-titel.

## Testning
- Navigera till varje tab och verifiera att rätt skärm visas
- Verifiera att floating dock renderar korrekt på olika skärmstorlekar
- Testa att backdrop-blur fungerar (eller att fallback ser bra ut)

## DroidRun/odin9 verifiering
1. Starta appen på odin9 (emulator-5570)
2. Ta screenshot av hemskärmen — verifiera:
   - Floating dock syns centrerad i botten
   - 5 ikoner synliga i docken
   - Ingen border-linje ovanför docken
   - Docken har rounded corners (48px)
3. Navigera till varje tab — ta screenshot:
   - Verifiera att aktiv ikon har copper-färg (#894d0d)
   - Verifiera att header visar korrekt titel (inte "index")
4. Maestro-flöde:
```yaml
appId: com.lovelustre.app
---
- assertVisible: "Discover"
- tapOn: "Connect"
- assertVisible: "Connect"
- tapOn: "Explore"
- assertVisible: "Explore"
- tapOn: "Learn"
- assertVisible: "Learn"
- tapOn: "Profile"
- assertVisible: "Profil"
```
