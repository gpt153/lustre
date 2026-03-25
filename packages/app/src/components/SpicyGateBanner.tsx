import { Card, XStack, YStack, Text, Button } from 'tamagui'
import { TouchableOpacity } from 'react-native'

interface SpicyGateBannerProps {
  onSettings: () => void
}

export function SpicyGateBanner({ onSettings }: SpicyGateBannerProps) {
  return (
    <Card
      backgroundColor="$red2"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$red6"
      padding="$4"
      gap="$3"
    >
      <XStack alignItems="center" gap="$3">
        <YStack
          width={48}
          height={48}
          borderRadius={24}
          backgroundColor="$red8"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Text fontSize={24}>🔒</Text>
        </YStack>

        <YStack flex={1} gap="$1">
          <XStack alignItems="center" gap="$2">
            <Text fontSize={15} fontWeight="700" color="$color">
              Spicy Mode
            </Text>
            <XStack
              backgroundColor="$red8"
              borderRadius={12}
              paddingHorizontal="$2"
              paddingVertical={2}
            >
              <Text fontSize={10} fontWeight="700" color="white">
                18+
              </Text>
            </XStack>
          </XStack>
          <Text fontSize={13} color="$gray10" lineHeight={18}>
            Spicy modules kräver Spicy Mode och slutförande av modul 6
          </Text>
        </YStack>
      </XStack>

      <TouchableOpacity onPress={onSettings}>
        <YStack
          backgroundColor="$red10"
          borderRadius="$3"
          paddingVertical="$2"
          paddingHorizontal="$3"
          alignItems="center"
        >
          <Text fontSize={13} fontWeight="700" color="white">
            Aktivera i inställningar
          </Text>
        </YStack>
      </TouchableOpacity>
    </Card>
  )
}
