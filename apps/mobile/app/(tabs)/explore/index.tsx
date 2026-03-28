import { useRouter } from 'expo-router'
import { YStack, XStack, Text, ScrollView } from 'tamagui'
import { Pressable } from 'react-native'

const cards = [
  { title: 'Grupper', description: 'Utforska communities', icon: '👥', route: '/(tabs)/explore/groups' },
  { title: 'Evenemang', description: 'Upptäck spännande events', icon: '🎉', route: '/(tabs)/explore/events' },
  { title: 'Organisationer', description: 'Möt verifierade organisationer', icon: '🏢', route: '/(tabs)/explore/orgs' },
  { title: 'Shop', description: 'Bläddra bland produkter', icon: '🛍️', route: '/(tabs)/explore/shop' },
]

export default function ExploreHubScreen() {
  const router = useRouter()

  return (
    <ScrollView flex={1} backgroundColor="#f2ede8">
      <YStack padding={24} gap={24}>
        {/* Header */}
        <YStack gap={4} marginBottom={8}>
          <Text
            fontSize={32}
            fontWeight="700"
            color="#1d1b19"
            fontFamily="$heading"
          >
            Utforska
          </Text>
          <Text fontSize={14} color="#524439" fontFamily="$body">
            Upptäck communities, events och mer
          </Text>
        </YStack>

        {/* Cards — tonal layering */}
        {cards.map((card, index) => (
          <Pressable
            key={index}
            onPress={() => router.push(card.route as any)}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
          >
            <XStack
              padding={24}
              backgroundColor="#ffffff"
              borderRadius={24}
              alignItems="center"
              gap={20}
              shadowColor="#2C2421"
              shadowOffset={{ width: 0, height: 8 }}
              shadowOpacity={0.06}
              shadowRadius={24}
              elevationAndroid={2}
            >
              <Text fontSize={32}>{card.icon}</Text>
              <YStack flex={1} gap={4}>
                <Text fontSize={18} fontWeight="600" color="#1d1b19" fontFamily="$heading">
                  {card.title}
                </Text>
                <Text fontSize={13} color="#524439" fontFamily="$body">
                  {card.description}
                </Text>
              </YStack>
              <Text fontSize={20} color="#857467">→</Text>
            </XStack>
          </Pressable>
        ))}
      </YStack>
    </ScrollView>
  )
}
