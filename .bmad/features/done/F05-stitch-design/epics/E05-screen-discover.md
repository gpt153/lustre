# E05 — Discover Screen

## Beskrivning
Omdesigna Discover-skärmen till stitch-specifikationens fullskärms-fotokort med profilöverlägg, copper-gradient overlay, 3 action-knappar och sub-tabs. Skärmen ska kännas som en "curated encounter" — inte en swipe-maskin.

## Acceptanskriterier
1. [ ] Fullskärms-fotokort som fyller hela skärmen (minus floating dock)
2. [ ] Gradient overlay på foton: transparent → charcoal/copper gradient i botten
3. [ ] Profilnamn (Noto Serif, headline-lg) + ålder + plats överlagt på fotot i botten
4. [ ] 3 action-knappar centrerade under fotot: copper hjärta (Like), charcoal X (Pass), gold stjärna (Super Like)
5. [ ] Sub-tabs ovanför kortet: Intentioner, Bläddra (aktiv), Matchningar, Sök
6. [ ] Lustre-logga vänster i header, filter-ikon höger
7. [ ] Action-knappar: full roundness (9999px), scale 0.95 press-animation
8. [ ] Bakgrund: surface (#fef8f3) med subtil warm-white canvas-känsla

## Filer att ändra
- `apps/mobile/app/(tabs)/discover/index.tsx`
- `apps/mobile/app/(tabs)/discover/_layout.tsx`
- `packages/app/src/screens/DiscoverScreen.tsx` (om finns)
- `packages/app/src/components/ProfileCard.tsx` (om finns)
- `apps/mobile/components/ProfileCardStory.tsx`

## Tekniska detaljer

### Fotokort med gradient overlay:
```tsx
import { LinearGradient } from 'expo-linear-gradient'

<View style={{ flex: 1, borderRadius: 24, overflow: 'hidden' }}>
  <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} />
  <LinearGradient
    colors={['transparent', 'rgba(137, 77, 13, 0.3)', 'rgba(44, 36, 33, 0.8)']}
    locations={[0.4, 0.7, 1.0]}
    style={StyleSheet.absoluteFillObject}
  />
  <View style={styles.profileOverlay}>
    <Text style={{ fontFamily: 'NotoSerif_700Bold', fontSize: 32, color: '#ffffff' }}>
      Emma, 28
    </Text>
    <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>
      Stockholm
    </Text>
  </View>
</View>
```

### Action-knappar:
```tsx
<XStack justifyContent="center" gap="$lg" paddingVertical="$md">
  {/* Pass */}
  <Pressable style={styles.actionButton}>
    <View style={[styles.actionCircle, { backgroundColor: '#1d1b19' }]}>
      <X size={28} color="#ffffff" />
    </View>
  </Pressable>

  {/* Like — copper gradient */}
  <Pressable style={styles.actionButton}>
    <LinearGradient colors={['#894d0d', '#a76526']} style={styles.actionCircleLarge}>
      <Heart size={32} color="#ffffff" weight="fill" />
    </LinearGradient>
  </Pressable>

  {/* Super Like — gold */}
  <Pressable style={styles.actionButton}>
    <View style={[styles.actionCircle, { backgroundColor: '#fece65' }]}>
      <Star size={28} color="#795900" weight="fill" />
    </View>
  </Pressable>
</XStack>
```

### Sub-tabs:
Använd `MaterialTopTabs` eller custom scroll-tabs med stitch-styling:
- Aktiv tab: primary (#894d0d) text + underline
- Inaktiv tab: on-surface-variant (#524439) text
- Ingen border under tab-raden (bakgrundsfärgskifte istället)

### Asymmetri:
Profilöverlägget ska vara vänsterställt (inte centrerat) — text börjar vid left: 24px. Ger editorial-känsla.

## Testning
- Verifiera att fotokort fyller skärmen korrekt
- Testa swipe-gester (vänster/höger) om de finns
- Kontrollera att gradient overlay renderar korrekt på Android
- Verifiera att action-knappar har rätt färger och animationer

## DroidRun/odin9 verifiering
1. Starta appen → Discover-tab ska vara aktiv
2. Ta screenshot — verifiera:
   - Fullskärms-foto (eller placeholder om ingen data)
   - Gradient overlay synlig i botten av fotot
   - Profilnamn i serif-font, vänsterställd
   - 3 action-knappar: copper, charcoal, gold (rätt färger)
   - Sub-tabs synliga ovanför kortet
   - Floating dock synlig i botten
3. Tappa på varje sub-tab — verifiera att aktiv tab har copper-underline
4. Maestro-flöde:
```yaml
appId: com.lovelustre.app
---
- launchApp
- takeScreenshot: "discover_main"
- tapOn: "Intentioner"
- takeScreenshot: "discover_intentions"
- tapOn: "Matchningar"
- takeScreenshot: "discover_matches"
- tapOn: "Sök"
- takeScreenshot: "discover_search"
```
