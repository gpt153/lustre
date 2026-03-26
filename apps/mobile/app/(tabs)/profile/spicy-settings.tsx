import { ScrollView, YStack, XStack, Text, Spinner } from 'tamagui'
import { useProfile } from '@lustre/app/src/hooks/useProfile'
import { useMode } from '@lustre/app'
import { ModeToggle } from '@lustre/app'

export default function SpicySettingsScreen() {
  const { profile, isLoading } = useProfile()
  const { isSpicy } = useMode()

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Spinner />
      </YStack>
    )
  }

  if (!profile) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background" paddingHorizontal="$4">
        <Text fontSize={16} color="$gray10">
          Profilen hittades inte.
        </Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text fontSize={20} fontWeight="700" color="$color">
          Spicy Mode
        </Text>
      </XStack>

      <ScrollView flex={1}>
        <YStack paddingHorizontal="$4" paddingTop="$4" paddingBottom="$6" gap="$4">
          <YStack
            backgroundColor="$gray2"
            borderRadius="$4"
            padding="$4"
            gap="$3"
          >
            <YStack gap="$2">
              <YStack gap="$2">
                <XStack alignItems="center" gap="$2">
                  <Text fontSize={16} fontWeight="700" color="$color">
                    Välj läge
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
                <Text fontSize={13} color="$gray10">
                  Spicy Mode ger tillgång till vuxencoachningsmoduler
                </Text>
              </YStack>

              <ModeToggle />
            </YStack>

            {isSpicy && (
              <YStack
                backgroundColor="$yellow2"
                borderRadius="$3"
                padding="$3"
                borderWidth={1}
                borderColor="$yellow6"
              >
                <Text fontSize={12} color="$yellow11" lineHeight={16}>
                  ⚠️ Spicy Mode innehåller innehål för vuxna (18+). Du måste ha slutfört modul 6 för att komma åt spicy-moduler.
                </Text>
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
