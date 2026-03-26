'use client'

import { YStack, XStack, Text, Spinner, ScrollView } from 'tamagui'
import { useMode } from '@lustre/app'
import { ModeToggle } from '@lustre/app'

export default function SpicySettingsPage() {
  const { mode, isSpicy, isLoading } = useMode()

  if (isLoading) {
    return (
      <YStack padding="$4" alignItems="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$6">
        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="700" color="$text">
            Läge 🌶️
          </Text>
          <Text fontSize="$3" color="$textSecondary">
            Få tillgång till vuxenmoduler (18+). Kräver slutförande av vaniljmodul 6.
          </Text>
        </YStack>

        <YStack
          gap="$4"
          backgroundColor="$background"
          borderRadius="$4"
          borderWidth={1}
          borderColor="$borderColor"
          padding="$4"
        >
          <ModeToggle />

          {isSpicy && (
            <YStack
              backgroundColor="#E0F2FE"
              borderRadius="$2"
              padding="$3"
              borderWidth={1}
              borderColor="#BAE6FD"
            >
              <Text fontSize="$2" color="#0369A1" fontWeight="500">
                ✓ Spicy-läge är aktiverat. Du kan nu öppna spicy-moduler.
              </Text>
            </YStack>
          )}

          {!isSpicy && (
            <YStack
              backgroundColor="#FEF2F2"
              borderRadius="$2"
              padding="$3"
              borderWidth={1}
              borderColor="#FECACA"
            >
              <Text fontSize="$2" color="#DC2626" fontWeight="500">
                Spicy-moduler är låsta. Aktivera Spicy-läge för att öppna dem.
              </Text>
            </YStack>
          )}
        </YStack>

        <YStack
          backgroundColor="$borderColor"
          borderRadius="$3"
          padding="$4"
          gap="$2"
        >
          <Text fontSize="$3" fontWeight="700" color="$text">
            ℹ️ Om Spicy-läge
          </Text>
          <Text fontSize="$2" color="$textSecondary" lineHeight={18}>
            Spicy-läge låser upp avancerade coachingmoduler designade för vuxna 18+. Dessa moduler täcker mogna ämnen inom relationer och sexualitet. Du måste slutföra vaniljmodul 6 innan du får tillgång till spicy-innehål.
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
