import { ScrollView, YStack, XStack, Text, Switch, Spinner } from 'tamagui'
import { useProfile } from '@lustre/app/src/hooks/useProfile'
import { useLearn } from '@lustre/app/src/hooks/useLearn'
import { useState, useEffect } from 'react'

export default function SpicySettingsScreen() {
  const { profile, isLoading } = useProfile()
  const { toggleSpicyMode } = useLearn()
  const [enabled, setEnabled] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    if (profile) {
      setEnabled(profile.spicyModeEnabled ?? false)
    }
  }, [profile])

  async function handleToggle(value: boolean) {
    setIsToggling(true)
    try {
      await toggleSpicyMode(value)
      setEnabled(value)
    } catch (error) {
      // Revert on error
      setEnabled(!value)
    } finally {
      setIsToggling(false)
    }
  }

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
            <YStack gap="$1">
              <XStack alignItems="center" justifyContent="space-between" gap="$3">
                <YStack flex={1} gap="$1">
                  <XStack alignItems="center" gap="$2">
                    <Text fontSize={16} fontWeight="700" color="$color">
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
                  <Text fontSize={13} color="$gray10">
                    Få tillgång till vuxencoachningsmoduler
                  </Text>
                </YStack>

                <Switch
                  size="$3"
                  checked={enabled}
                  onCheckedChange={handleToggle}
                  disabled={isToggling}
                />
              </XStack>
            </YStack>

            {enabled && (
              <YStack
                backgroundColor="$yellow2"
                borderRadius="$3"
                padding="$3"
                borderWidth={1}
                borderColor="$yellow6"
              >
                <Text fontSize={12} color="$yellow11" lineHeight={16}>
                  ⚠️ Spicy Mode innehåller innehål för vuxna (18+). Du måste ha slutfört modul 6 för att komma åt spicy-modul.
                </Text>
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
