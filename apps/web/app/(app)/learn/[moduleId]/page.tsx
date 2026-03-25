'use client'

import { use } from 'react'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

export default function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params)
  const moduleQuery = trpc.module.get.useQuery({ moduleId })

  if (moduleQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  const module = moduleQuery.data
  if (!module) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary" fontSize="$4">
          Module not found.
        </Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={900} gap="$5">
        <Link href="/learn" style={{ textDecoration: 'none' }}>
          <Text fontSize="$3" color="$primary">
            ← Back to modules
          </Text>
        </Link>

        <YStack gap="$2">
          <XStack alignItems="center" gap="$3">
            <YStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="$primary"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="$4" fontWeight="700" color="white">
                {module.order}
              </Text>
            </YStack>
            <XStack alignItems="center" gap="$2" flex={1}>
              <Text fontSize="$6" fontWeight="700" color="$text">
                {module.title}
              </Text>
              {module.isSpicy && (
                <YStack
                  backgroundColor="#DC2626"
                  borderRadius="$2"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                >
                  <Text fontSize="$1" fontWeight="700" color="white">
                    18+
                  </Text>
                </YStack>
              )}
            </XStack>
          </XStack>
          <Text fontSize="$3" color="$textSecondary" lineHeight={22}>
            {module.description}
          </Text>
        </YStack>

        {module.progress?.badgeAwardedAt && (
          <XStack
            backgroundColor="#E6F9EC"
            borderRadius="$3"
            padding="$3"
            borderWidth={1}
            borderColor="#A3DFB8"
            alignItems="center"
            gap="$2"
          >
            <Text fontSize="$4" color="#1A7F37" fontWeight="600">
              🏅 Badge earned: {module.badgeName}
            </Text>
          </XStack>
        )}

        {!module.isUnlocked && (
          <XStack
            backgroundColor="#FFF8E1"
            borderRadius="$3"
            padding="$3"
            borderWidth={1}
            borderColor="#FFE082"
            alignItems="center"
            gap="$2"
          >
            <Text fontSize="$4" color="#856404" fontWeight="600">
              🔒 Module locked — complete previous modules to unlock this one.
            </Text>
          </XStack>
        )}

        {module.lessons.length > 0 && (
          <YStack
            gap="$0"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$borderColor"
            overflow="hidden"
          >
            <XStack
              backgroundColor="$borderColor"
              paddingHorizontal="$4"
              paddingVertical="$3"
              gap="$4"
            >
              <Text fontSize="$2" fontWeight="700" color="$text" width={32}>
                #
              </Text>
              <Text fontSize="$2" fontWeight="700" color="$text" flex={3}>
                Lesson
              </Text>
              <Text fontSize="$2" fontWeight="700" color="$text" flex={1}>
                Status
              </Text>
              <Text fontSize="$2" fontWeight="700" color="$text" flex={2}>
                Actions
              </Text>
            </XStack>

            {module.lessons.map((lesson, index) => {
              const passed = lesson.progress?.passed
              const started = lesson.progress !== null && !passed
              const coachUrl = `/coach/start?persona=COACH&context=${encodeURIComponent(lesson.title)}`
              const partnerUrl = `/coach/start?persona=PARTNER&context=${encodeURIComponent(lesson.title)}`

              return (
                <XStack
                  key={lesson.id}
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  gap="$4"
                  alignItems="center"
                  backgroundColor={index % 2 === 0 ? '$background' : '$backgroundHover'}
                  borderTopWidth={index === 0 ? 0 : 1}
                  borderColor="$borderColor"
                >
                  <Text fontSize="$3" color="$textSecondary" width={32}>
                    {lesson.order}
                  </Text>

                  <YStack flex={3}>
                    <Link
                      href={`/learn/${moduleId}/lesson/${lesson.id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <Text fontSize="$3" color="$primary" fontWeight="500">
                        {lesson.title}
                      </Text>
                    </Link>
                  </YStack>

                  <XStack flex={1}>
                    <YStack
                      backgroundColor={passed ? '#E6F9EC' : '$backgroundHover'}
                      borderRadius="$2"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                    >
                      <Text
                        fontSize="$1"
                        fontWeight="600"
                        color={passed ? '#1A7F37' : started ? '$text' : '$textSecondary'}
                      >
                        {passed ? '✓ Completed' : started ? 'In Progress' : 'Not started'}
                      </Text>
                    </YStack>
                  </XStack>

                  <XStack flex={2} gap="$2" flexWrap="wrap">
                    {module.isUnlocked ? (
                      <>
                        <Link href={coachUrl} style={{ textDecoration: 'none' }}>
                          <Button
                            size="$2"
                            backgroundColor="$primary"
                            borderRadius="$2"
                            paddingHorizontal="$3"
                          >
                            <Text color="white" fontSize="$2" fontWeight="600">
                              Start with Axel
                            </Text>
                          </Button>
                        </Link>
                        <Link href={partnerUrl} style={{ textDecoration: 'none' }}>
                          <Button
                            size="$2"
                            backgroundColor="$backgroundHover"
                            borderRadius="$2"
                            paddingHorizontal="$3"
                            borderWidth={1}
                            borderColor="$borderColor"
                          >
                            <Text color="$text" fontSize="$2" fontWeight="600">
                              Practice with Sophia
                            </Text>
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Button
                          size="$2"
                          backgroundColor="$borderColor"
                          borderRadius="$2"
                          paddingHorizontal="$3"
                          disabled
                          opacity={0.5}
                        >
                          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
                            Start with Axel
                          </Text>
                        </Button>
                        <Button
                          size="$2"
                          backgroundColor="$borderColor"
                          borderRadius="$2"
                          paddingHorizontal="$3"
                          disabled
                          opacity={0.5}
                        >
                          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
                            Practice with Sophia
                          </Text>
                        </Button>
                      </>
                    )}
                  </XStack>
                </XStack>
              )
            })}
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}
