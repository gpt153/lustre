'use client'

import { YStack, XStack, Text, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

export default function LearnPage() {
  const listQuery = trpc.module.list.useQuery()

  if (listQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  const modules = listQuery.data ?? []

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={900} gap="$6">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="700" color="$text">
            Learn — Social Skills
          </Text>
        </XStack>

        {modules.length === 0 ? (
          <YStack
            alignItems="center"
            padding="$8"
            backgroundColor="$background"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text color="$textSecondary" fontSize="$4" textAlign="center">
              No modules available yet.
            </Text>
          </YStack>
        ) : (
          <XStack flexWrap="wrap" gap="$4">
            {modules.map((module) => {
              const card = (
                <YStack
                  key={module.id}
                  minWidth={280}
                  flex={1}
                  backgroundColor="$background"
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor="$borderColor"
                  padding="$4"
                  gap="$3"
                  opacity={module.isUnlocked ? 1 : 0.6}
                  hoverStyle={module.isUnlocked ? { borderColor: '$primary' } : undefined}
                >
                  <XStack alignItems="center" gap="$3">
                    <YStack
                      width={40}
                      height={40}
                      borderRadius={20}
                      backgroundColor={module.isUnlocked ? '$primary' : '$borderColor'}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text
                        fontSize="$4"
                        fontWeight="700"
                        color={module.isUnlocked ? 'white' : '$textSecondary'}
                      >
                        {module.order}
                      </Text>
                    </YStack>
                    <YStack flex={1}>
                      <Text fontSize="$4" fontWeight="700" color="$text">
                        {module.title}
                      </Text>
                      {!module.isUnlocked && (
                        <Text fontSize="$2" color="$textSecondary">
                          🔒 Locked
                        </Text>
                      )}
                    </YStack>
                  </XStack>

                  <Text fontSize="$3" color="$textSecondary" numberOfLines={3} lineHeight={20}>
                    {module.description}
                  </Text>

                  <XStack gap="$2" flexWrap="wrap">
                    <YStack
                      backgroundColor="$backgroundHover"
                      borderRadius="$2"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                    >
                      <Text fontSize="$2" color="$textSecondary">
                        {module.lessons.length} lessons
                      </Text>
                    </YStack>
                    <YStack
                      backgroundColor="$backgroundHover"
                      borderRadius="$2"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                    >
                      <Text fontSize="$2" color="$textSecondary">
                        🏅 {module.badgeName}
                      </Text>
                    </YStack>
                    {module.progress?.badgeAwardedAt && (
                      <YStack
                        backgroundColor="#E6F9EC"
                        borderRadius="$2"
                        paddingHorizontal="$2"
                        paddingVertical="$1"
                      >
                        <Text fontSize="$2" color="#1A7F37" fontWeight="600">
                          ✓ {module.badgeName}
                        </Text>
                      </YStack>
                    )}
                  </XStack>
                </YStack>
              )

              return module.isUnlocked ? (
                <Link
                  key={module.id}
                  href={`/learn/${module.id}`}
                  style={{ textDecoration: 'none', flex: 1, minWidth: 280 }}
                >
                  {card}
                </Link>
              ) : (
                <YStack key={module.id} flex={1} minWidth={280}>
                  {card}
                </YStack>
              )
            })}
          </XStack>
        )}
      </YStack>
    </YStack>
  )
}
