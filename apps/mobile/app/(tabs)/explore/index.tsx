import { useRouter } from 'expo-router'
import { YStack, XStack, Text, ScrollView } from 'tamagui'
import { Pressable } from 'react-native'

export default function ExploreHubScreen() {
  const router = useRouter()

  const cards = [
    {
      title: 'Groups',
      description: 'Join and explore communities',
      icon: '👥',
      onPress: () => router.push('/(tabs)/explore/groups'),
    },
    {
      title: 'Events',
      description: 'Discover exciting events',
      icon: '🎉',
      onPress: () => router.push('/(tabs)/explore/events'),
    },
    {
      title: 'Organizations',
      description: 'Meet verified organizations',
      icon: '🏢',
      onPress: () => router.push('/(tabs)/explore/orgs'),
    },
    {
      title: 'Shop',
      description: 'Browse marketplace & products',
      icon: '🛍️',
      onPress: () => router.push('/(tabs)/explore/shop'),
    },
  ]

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack padding="$4" gap="$4">
        <YStack gap="$2" marginBottom="$2">
          <Text fontSize={28} fontWeight="700" color="$color">
            Explore
          </Text>
          <Text fontSize={14} color="$gray10">
            Discover new communities, events, and more
          </Text>
        </YStack>

        {cards.map((card, index) => (
          <Pressable key={index} onPress={card.onPress}>
            <XStack
              padding="$4"
              backgroundColor="$gray2"
              borderRadius="$4"
              alignItems="center"
              gap="$4"
              borderWidth={1}
              borderColor="$borderColor"
              hoverStyle={{ backgroundColor: '$gray3' }}
            >
              <Text fontSize={32}>{card.icon}</Text>
              <YStack flex={1} gap="$1">
                <Text fontSize={16} fontWeight="600" color="$color">
                  {card.title}
                </Text>
                <Text fontSize={13} color="$gray10">
                  {card.description}
                </Text>
              </YStack>
              <Text fontSize={20} color="$gray8">
                →
              </Text>
            </XStack>
          </Pressable>
        ))}
      </YStack>
    </ScrollView>
  )
}
