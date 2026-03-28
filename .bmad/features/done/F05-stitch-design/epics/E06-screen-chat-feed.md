# E06 — Chat & Feed Screens

## Beskrivning
Omdesigna Chat-listan och Feed-skärmen enligt stitch-specifikationen. Chat-listan ska ha editorial asymmetrisk layout utan horisontella dividers. Feed-skärmen ska kännas som en "private sanctuary" med tonal layering och copper spinners.

## Acceptanskriterier
1. [ ] Chat-lista: inga horisontella dividers (No-Divider Rule)
2. [ ] Chat-lista: varje konversation i egen surface-container-low pod med roundness
3. [ ] Chat-lista: 2rem (32px) vertikalt mellanrum mellan konversationer
4. [ ] Feed: tonal layering — post-kort på surface-container bakgrund
5. [ ] Feed: inga horisontella linjer mellan poster
6. [ ] Laddnings-spinners: copper (#894d0d) istället för nuvarande färg
7. [ ] Meddelande-bubblor: avsändare = copper gradient, mottagare = surface-container-low
8. [ ] Inga divider-linjer i hela Connect/Chat-flödet

## Filer att ändra
- `apps/mobile/app/(tabs)/connect/index.tsx`
- `apps/mobile/app/(tabs)/connect/[conversationId].tsx`
- `apps/mobile/app/(tabs)/index.tsx` (Feed)
- `packages/app/src/screens/ConversationListScreen.tsx`
- `packages/app/src/screens/ChatRoomScreen.tsx`
- `packages/app/src/screens/FeedScreen.tsx`
- `packages/app/src/components/PostCard.tsx`

## Tekniska detaljer

### Chat-lista utan dividers:
```tsx
// INTE:
<FlatList ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#ccc' }} />}

// UTAN:
<FlatList
  contentContainerStyle={{ gap: 32, padding: 16 }}
  renderItem={({ item }) => (
    <YStack
      backgroundColor="$surfaceContainerLow"  // #f8f3ee
      borderRadius={16}
      padding="$md"
      // Ingen borderWidth
    >
      <XStack gap="$sm" alignItems="center">
        <Image style={{ width: 48, height: 48, borderRadius: 24 }} />
        <YStack>
          <Text fontFamily="$heading" fontSize={18}>{item.name}</Text>
          <Text fontFamily="$body" fontSize={14} color="$onSurfaceVariant">{item.lastMessage}</Text>
        </YStack>
      </XStack>
    </YStack>
  )}
/>
```

### Meddelande-bubblor:
```tsx
// Avsändare (mig):
<LinearGradient
  colors={['#894d0d', '#a76526']}
  style={{ borderRadius: 20, borderBottomRightRadius: 4, padding: 12, maxWidth: '75%' }}
>
  <Text color="#ffffff" fontFamily="$body">{message}</Text>
</LinearGradient>

// Mottagare:
<YStack
  backgroundColor="$surfaceContainerLow"
  borderRadius={20}
  borderBottomLeftRadius={4}
  padding="$md"
  maxWidth="75%"
>
  <Text color="$onSurface" fontFamily="$body">{message}</Text>
</YStack>
```

### Feed-kort:
Varje post-kort använder `surface-container-lowest` (#ffffff) på `surface-container` (#f2ede8) bakgrund. Inga borders, ultra-diffused shadow. Generöst whitespace (32px gap) mellan poster.

### Copper spinner:
```tsx
<ActivityIndicator color="#894d0d" size="large" />
```

## Testning
- Verifiera att inga horisontella linjer syns i chat-listan
- Testa att meddelande-bubblor renderar korrekt med gradient
- Kontrollera att feed-kort inte har borders
- Verifiera copper spinner vid laddning

## DroidRun/odin9 verifiering
1. Navigera till Connect-tab
2. Ta screenshot — verifiera:
   - Konversationer separerade med whitespace (inte linjer)
   - Varje konversation i en rounded pod med ljus bakgrund
   - Profilbilder har xl roundness (32px)
   - Ingen border synlig
3. Öppna en konversation (om testdata finns)
4. Ta screenshot — verifiera:
   - Egna bubblor har copper-gradient
   - Mottagarens bubblor har ljus beige bakgrund
   - Ingen divider mellan meddelanden
5. Navigera till Feed/Index
6. Ta screenshot — verifiera:
   - Post-kort utan borders
   - Generöst whitespace mellan poster
   - Copper spinner om laddning
7. Maestro-flöde:
```yaml
appId: com.lovelustre.app
---
- launchApp
- tapOn: "Connect"
- takeScreenshot: "chat_list"
- tapOn:
    index: 0
- takeScreenshot: "chat_room"
- back
- tapOn: "Discover"
- takeScreenshot: "feed"
```
