import { ScrollView, YStack, XStack, Text, Spinner } from 'tamagui'
import { TouchableOpacity } from 'react-native'
import { useLearn } from '../hooks/useLearn'

interface LearnModuleListScreenProps {
  onModulePress: (moduleId: string) => void
}

export function LearnModuleListScreen({ onModulePress }: LearnModuleListScreenProps) {
  const { modules, isLoading } = useLearn()

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner />
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
          Lär dig
        </Text>
      </XStack>

      <ScrollView flex={1}>
        <YStack paddingHorizontal="$4" paddingTop="$3" paddingBottom="$6" gap="$3">
          {modules.map((module) => (
            <TouchableOpacity
              key={module.id}
              onPress={() => module.isUnlocked && onModulePress(module.id)}
              activeOpacity={module.isUnlocked ? 0.7 : 1}
            >
              <XStack
                backgroundColor="$gray2"
                borderRadius="$4"
                padding="$3"
                gap="$3"
                alignItems="flex-start"
                opacity={module.isUnlocked ? 1 : 0.5}
              >
                <YStack
                  width={44}
                  height={44}
                  borderRadius={22}
                  backgroundColor={module.isUnlocked ? '$pink8' : '$gray6'}
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Text fontSize={16} fontWeight="700" color="white">
                    {module.order}
                  </Text>
                </YStack>

                <YStack flex={1} gap="$1">
                  <XStack alignItems="center" gap="$2">
                    <Text fontSize={15} fontWeight="600" color="$color" flex={1}>
                      {module.title}
                    </Text>
                    {!module.isUnlocked && <Text fontSize={16}>🔒</Text>}
                  </XStack>

                  <Text fontSize={13} color="$gray10" numberOfLines={2}>
                    {module.description}
                  </Text>

                  <XStack alignItems="center" gap="$2" marginTop="$1">
                    <XStack
                      backgroundColor="$gray4"
                      borderRadius="$2"
                      paddingHorizontal="$2"
                      paddingVertical={2}
                    >
                      <Text fontSize={11} color="$gray11">
                        {module.lessons.length} lektioner
                      </Text>
                    </XStack>

                    {module.progress?.badgeAwardedAt && (
                      <XStack
                        backgroundColor="$yellow3"
                        borderRadius="$2"
                        paddingHorizontal="$2"
                        paddingVertical={2}
                      >
                        <Text fontSize={11} color="$yellow11">
                          🏅 {module.badgeName}
                        </Text>
                      </XStack>
                    )}

                    {!module.isUnlocked && (
                      <Text fontSize={11} color="$gray9">
                        Låst
                      </Text>
                    )}
                  </XStack>
                </YStack>
              </XStack>
            </TouchableOpacity>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
