'use client'

import { YStack, XStack, Text, Switch, Label, Spinner, ScrollView } from 'tamagui'
import { trpc } from '@lustre/api'
import { useState } from 'react'

export default function SpicySettingsPage() {
  const profileQuery = trpc.profile.get.useQuery()
  const toggleSpicyModeMutation = trpc.profile.toggleSpicyMode.useMutation()
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async (enabled: boolean) => {
    setIsToggling(true)
    try {
      await toggleSpicyModeMutation.mutateAsync({ enabled })
    } finally {
      setIsToggling(false)
    }
  }

  if (profileQuery.isLoading) {
    return (
      <YStack padding="$4" alignItems="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  const profile = profileQuery.data
  if (!profile) {
    return (
      <YStack padding="$4" alignItems="center">
        <Text color="$textSecondary" fontSize="$4">
          Profile not found.
        </Text>
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$6">
        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="700" color="$text">
            Spicy Mode 🌶️
          </Text>
          <Text fontSize="$3" color="$textSecondary">
            Access adult coaching modules (18+). Requires completion of vanilla module 6.
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
          <XStack justifyContent="space-between" alignItems="center">
            <Label htmlFor="spicy-toggle" color="$text" fontSize="$4" fontWeight="600">
              Enable Spicy Mode
            </Label>
            <Switch
              id="spicy-toggle"
              checked={profile.spicyModeEnabled ?? false}
              onCheckedChange={handleToggle}
              disabled={isToggling}
            >
              <Switch.Thumb animation="quick" />
            </Switch>
          </XStack>

          {profile.spicyModeEnabled && (
            <YStack
              backgroundColor="#E0F2FE"
              borderRadius="$2"
              padding="$3"
              borderWidth={1}
              borderColor="#BAE6FD"
            >
              <Text fontSize="$2" color="#0369A1" fontWeight="500">
                ✓ Spicy Mode is enabled. You can now access spicy coaching modules.
              </Text>
            </YStack>
          )}

          {!profile.spicyModeEnabled && (
            <YStack
              backgroundColor="#FEF2F2"
              borderRadius="$2"
              padding="$3"
              borderWidth={1}
              borderColor="#FECACA"
            >
              <Text fontSize="$2" color="#DC2626" fontWeight="500">
                Spicy modules are locked. Enable Spicy Mode to access them.
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
            ℹ️ About Spicy Mode
          </Text>
          <Text fontSize="$2" color="$textSecondary" lineHeight={18}>
            Spicy Mode unlocks advanced coaching modules designed for adults 18+. These modules cover mature topics in relationships and sexuality. You must complete vanilla module 6 before accessing spicy content.
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
