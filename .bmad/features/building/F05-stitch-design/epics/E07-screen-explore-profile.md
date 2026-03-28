# E07 — Explore & Profile Screens

## Beskrivning
Omdesigna Explore- och Profile-skärmarna enligt stitch. Explore-kort ska använda tonal layering utan borders. Profile-skärmen ska ha asymmetrisk hero-foto som överlappar namn/bio-sektionen — editorial "magazine page"-känsla.

## Acceptanskriterier
1. [ ] Explore-kort: ingen border, tonal layering (surface-container-lowest på surface-container)
2. [ ] Explore: sub-sektioner (Groups, Events, Orgs, Shop) separerade med bakgrundsfärgskiften
3. [ ] Profile: asymmetrisk hero-foto som överlappar namn/bio med negative margin
4. [ ] Profile: namn i Noto Serif headline-lg, bio i Manrope body-md
5. [ ] Profile: inga horisontella dividers mellan sektioner
6. [ ] Korrekta route-titlar i headers (inte "index", "explore/groups" etc.)
7. [ ] Profilbilder: xl roundness (32px) genomgående
8. [ ] Profile Edit: input-fält enligt stitch (no-box, surface-container-low bg)

## Filer att ändra
- `apps/mobile/app/(tabs)/explore/index.tsx`
- `apps/mobile/app/(tabs)/explore/_layout.tsx`
- `apps/mobile/app/(tabs)/profile/index.tsx`
- `apps/mobile/app/(tabs)/profile/_layout.tsx`
- `packages/app/src/screens/ProfileViewScreen.tsx`
- `packages/app/src/screens/ProfileEditScreen.tsx`

## Tekniska detaljer

### Explore-kort med tonal layering:
```tsx
// Explore-skärmen har bakgrund: surface-container (#f2ede8)
<ScrollView style={{ backgroundColor: '#f2ede8' }}>
  {/* Varje kategori-kort */}
  <YStack
    backgroundColor="#ffffff"  // surface-container-lowest (elevated)
    borderRadius={24}
    padding="$lg"
    marginHorizontal="$md"
    marginBottom="$lg"
    // Ultra-diffused shadow
    shadowColor="#2C2421"
    shadowOffset={{ width: 0, height: 12 }}
    shadowOpacity={0.06}
    shadowRadius={40}
    // INGEN borderWidth
  >
    <Text fontFamily="$heading" fontSize={24}>Grupper</Text>
    <Text fontFamily="$body" color="$onSurfaceVariant">Utforska communities</Text>
  </YStack>
</ScrollView>
```

### Profile asymmetrisk hero:
```tsx
<ScrollView>
  {/* Hero-foto — blöder ut till kanten */}
  <View style={{ height: 400, marginBottom: -60 }}>
    <Image source={{ uri: profilePhoto }} style={{ width: '100%', height: '100%' }} />
    <LinearGradient
      colors={['transparent', 'rgba(254, 248, 243, 1)']}
      locations={[0.6, 1.0]}
      style={StyleSheet.absoluteFillObject}
    />
  </View>

  {/* Namn/bio — överlappar hero med negativ margin */}
  <YStack paddingHorizontal={24} marginTop={-20} zIndex={1}>
    <Text fontFamily="NotoSerif_700Bold" fontSize={32} color="#1d1b19">
      {profile.displayName}
    </Text>
    <Text fontFamily="Manrope_400Regular" fontSize={14} color="#524439" marginTop={4}>
      {profile.age} . {profile.location}
    </Text>
    <Text fontFamily="Manrope_400Regular" fontSize={16} color="#1d1b19" marginTop={16}>
      {profile.bio}
    </Text>
  </YStack>

  {/* Sektioner — separerade med bakgrundsfärgskiften, INGA dividers */}
  <YStack backgroundColor="#f8f3ee" padding={24} marginTop={32}>
    <Text fontFamily="NotoSerif_700Bold" fontSize={20}>Intressen</Text>
    {/* Chips */}
  </YStack>

  <YStack backgroundColor="#fef8f3" padding={24}>
    <Text fontFamily="NotoSerif_700Bold" fontSize={20}>Prompts</Text>
    {/* Prompt cards */}
  </YStack>
</ScrollView>
```

### Route-titlar:
Uppdatera `_layout.tsx` för explore och profile med explicita `headerTitle`-värden:
- explore/groups → "Grupper"
- explore/events → "Evenemang"
- explore/orgs → "Organisationer"
- explore/shop → "Shop"
- profile → "Profil"

## Testning
- Verifiera att explore-kort inte har borders
- Kontrollera att profil-hero överlappar korrekt
- Testa att bakgrundsfärgskiften syns mellan sektioner
- Verifiera att alla headers har korrekta svenska titlar

## DroidRun/odin9 verifiering
1. Navigera till Explore-tab
2. Ta screenshot — verifiera:
   - Kategori-kort utan borders
   - Tonal layering: vita kort på beige bakgrund
   - Sub-navigering (Groups, Events, etc.) med korrekta titlar
   - Rounded corners (24px) på alla kort
3. Navigera till Profile-tab
4. Ta screenshot — verifiera:
   - Hero-foto tar upp övre delen av skärmen
   - Gradient fade från foto till bakgrund
   - Namn i serif överlappar/närmar sig fotot
   - Sektioner separerade med bakgrundsfärgskiften (beige → vit → beige)
   - Inga horisontella linjer
5. Tappa "Redigera" — verifiera:
   - Input-fält utan borders (no-box stitch-stil)
   - Surface-container-low bakgrund på inputs
6. Maestro-flöde:
```yaml
appId: com.lovelustre.app
---
- launchApp
- tapOn: "Explore"
- takeScreenshot: "explore_main"
- tapOn: "Grupper"
- takeScreenshot: "explore_groups"
- back
- tapOn: "Profile"
- takeScreenshot: "profile_view"
```
