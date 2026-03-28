import { ScrollView, YStack, XStack, Text, Spinner } from 'tamagui'
import { TouchableOpacity } from 'react-native'
import { useLearnModule } from '../hooks/useLearn'

interface LearnModuleDetailScreenProps {
  moduleId: string
  onBack: () => void
  onLessonPress: (lessonId: string) => void
}

function lessonStatusIcon(
  progress: { passed: boolean; completedAt: Date | null } | null,
): string {
  if (!progress) return '○'
  if (progress.passed) return '✓'
  return '🔄'
}

function lessonStatusColor(
  progress: { passed: boolean; completedAt: Date | null } | null,
): string {
  if (!progress) return '$gray9'
  if (progress.passed) return '$green10'
  return '$yellow10'
}

export function LearnModuleDetailScreen({
  moduleId,
  onBack,
  onLessonPress,
}: LearnModuleDetailScreenProps) {
  const { module, isLoading } = useLearnModule(moduleId)

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner />
      </YStack>
    )
  }

  if (!module) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" paddingHorizontal="$md">
        <Text fontSize={16} color="$gray10">
          Modulen hittades inte.
        </Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        paddingHorizontal="$md"
        paddingVertical="$sm"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text fontSize={16} color="$pink10">
            ← Tillbaka
          </Text>
        </TouchableOpacity>
      </XStack>

      <ScrollView flex={1}>
        <YStack paddingHorizontal="$md" paddingTop="$md" paddingBottom="$lg" gap="$md">
          <YStack gap="$xs">
            <XStack alignItems="center" gap="$xs">
              <YStack
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor="$pink8"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={14} fontWeight="700" color="white">
                  {module.order}
                </Text>
              </YStack>
              <Text fontSize={22} fontWeight="700" color="$color" flex={1}>
                {module.title}
              </Text>
            </XStack>
            <Text fontSize={14} color="$gray10" lineHeight={20}>
              {module.description}
            </Text>
          </YStack>

          {module.progress?.badgeAwardedAt && (
            <XStack
              backgroundColor="$yellow2"
              borderRadius="$4"
              padding="$sm"
              alignItems="center"
              gap="$xs"
              borderWidth={1}
              borderColor="$yellow6"
            >
              <Text fontSize={24}>🏅</Text>
              <Text fontSize={13} fontWeight="600" color="$yellow11">
                Badge intjänad: {module.badgeName}
              </Text>
            </XStack>
          )}

          <YStack gap="$xs">
            <Text fontSize={17} fontWeight="600" color="$color">
              Lektioner
            </Text>

            {module.lessons.map((lesson) => {
              const canTap = module.isUnlocked
              return (
                <TouchableOpacity
                  key={lesson.id}
                  onPress={() => canTap && onLessonPress(lesson.id)}
                  activeOpacity={canTap ? 0.7 : 1}
                >
                  <XStack
                    backgroundColor="$gray2"
                    borderRadius="$4"
                    padding="$sm"
                    alignItems="center"
                    gap="$sm"
                    opacity={canTap ? 1 : 0.5}
                  >
                    <YStack
                      width={36}
                      height={36}
                      borderRadius={18}
                      backgroundColor="$gray4"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Text fontSize={13} fontWeight="600" color="$gray11">
                        {lesson.order}
                      </Text>
                    </YStack>

                    <Text fontSize={15} fontWeight="500" color="$color" flex={1}>
                      {lesson.title}
                    </Text>

                    <Text
                      fontSize={lesson.progress?.passed ? 16 : 14}
                      color={lessonStatusColor(lesson.progress ?? null)}
                      fontWeight="700"
                    >
                      {lessonStatusIcon(lesson.progress ?? null)}
                    </Text>
                  </XStack>
                </TouchableOpacity>
              )
            })}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
