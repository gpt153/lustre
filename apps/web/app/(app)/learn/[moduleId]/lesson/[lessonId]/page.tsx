'use client'

import { use } from 'react'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

export default function LessonPage({
  params: paramsPromise,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>
}) {
  const params = use(paramsPromise)
  const moduleQuery = trpc.module.get.useQuery({ moduleId: params.moduleId })

  if (moduleQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  const module = moduleQuery.data
  const lesson = module?.lessons.find((l) => l.id === params.lessonId)

  if (!module || !lesson) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary" fontSize="$4">
          Lesson not found.
        </Text>
      </YStack>
    )
  }

  const coachUrl = `/coach/start?persona=COACH&context=${encodeURIComponent(lesson.title)}`
  const partnerUrl = `/coach/start?persona=PARTNER&context=${encodeURIComponent(lesson.title)}`

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={800} gap="$5">
        <Link href={`/learn/${params.moduleId}`} style={{ textDecoration: 'none' }}>
          <Text fontSize="$3" color="$primary">
            ← Back to module
          </Text>
        </Link>

        <YStack gap="$1">
          <Text fontSize="$2" color="$textSecondary">
            Module {module.order} · Lesson {lesson.order}
          </Text>
          <XStack alignItems="center" gap="$2">
            <Text fontSize="$6" fontWeight="700" color="$text">
              {lesson.title}
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
        </YStack>

        <XStack gap="$4" flexWrap="wrap">
          {/* Axel card */}
          <YStack
            flex={1}
            minWidth={260}
            backgroundColor="$background"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            padding="$5"
            gap="$4"
          >
            <YStack gap="$2">
              <XStack alignItems="center" gap="$2">
                <YStack
                  width={40}
                  height={40}
                  borderRadius={20}
                  backgroundColor="$primary"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="$4" color="white" fontWeight="700">
                    A
                  </Text>
                </YStack>
                <Text fontSize="$4" fontWeight="700" color="$text">
                  Train with Axel
                </Text>
              </XStack>
              <Text fontSize="$3" color="$textSecondary" lineHeight={20}>
                Get structured guidance and coaching on this topic.
              </Text>
            </YStack>
            <Link href={coachUrl} style={{ textDecoration: 'none' }}>
              <Button backgroundColor="$primary" borderRadius="$3" paddingVertical="$3" width="100%">
                <Text color="white" fontWeight="600" fontSize="$3">
                  Start Session
                </Text>
              </Button>
            </Link>
          </YStack>

          {/* Sophia card */}
          <YStack
            flex={1}
            minWidth={260}
            backgroundColor="$background"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            padding="$5"
            gap="$4"
          >
            <YStack gap="$2">
              <XStack alignItems="center" gap="$2">
                <YStack
                  width={40}
                  height={40}
                  borderRadius={20}
                  backgroundColor="$backgroundHover"
                  borderWidth={1}
                  borderColor="$borderColor"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="$4" color="$text" fontWeight="700">
                    S
                  </Text>
                </YStack>
                <Text fontSize="$4" fontWeight="700" color="$text">
                  Practice with Sophia
                </Text>
              </XStack>
              <Text fontSize="$3" color="$textSecondary" lineHeight={20}>
                Practice the real scenario with a realistic partner.
              </Text>
            </YStack>
            <Link href={partnerUrl} style={{ textDecoration: 'none' }}>
              <Button
                backgroundColor="$backgroundHover"
                borderRadius="$3"
                paddingVertical="$3"
                width="100%"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text color="$text" fontWeight="600" fontSize="$3">
                  Start Practice
                </Text>
              </Button>
            </Link>
          </YStack>
        </XStack>

        {lesson.assessmentCriteria && (
          <YStack
            backgroundColor="$backgroundHover"
            borderRadius="$3"
            padding="$4"
            borderWidth={1}
            borderColor="$borderColor"
            gap="$2"
          >
            <Text fontSize="$3" fontWeight="700" color="$text">
              How you'll be assessed:
            </Text>
            <Text fontSize="$3" color="$textSecondary" lineHeight={22}>
              {lesson.assessmentCriteria}
            </Text>
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}
