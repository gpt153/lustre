import { ScrollView, YStack, XStack, Text, Spinner, Separator } from 'tamagui'
import { TouchableOpacity } from 'react-native'
import { useLearn } from '../hooks/useLearn'
import { useProfile } from '../hooks/useProfile'
import { SpicyGateBanner } from '../components/SpicyGateBanner'

interface LearnModuleListScreenProps {
  onModulePress: (moduleId: string) => void
  onSpicySettings: () => void
  onAchievementsPress?: () => void
}

export function LearnModuleListScreen({ onModulePress, onSpicySettings, onAchievementsPress }: LearnModuleListScreenProps) {
  const { vanillaModules, spicyModules, isLoading } = useLearn()
  const { profile } = useProfile()

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
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text fontSize={20} fontWeight="700" color="$color">
          Lär dig
        </Text>
        {onAchievementsPress && (
          <TouchableOpacity onPress={onAchievementsPress}>
            <Text fontSize={20}>🏆</Text>
          </TouchableOpacity>
        )}
      </XStack>

      <ScrollView flex={1}>
        <YStack paddingHorizontal="$4" paddingTop="$3" paddingBottom="$6" gap="$4">
          {/* Vanilla Modules Section */}
          {vanillaModules.length > 0 && (
            <YStack gap="$3">
              <Text fontSize={17} fontWeight="700" color="$color">
                Moduler
              </Text>
              <YStack gap="$2">
                {vanillaModules.map((module) => (
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
            </YStack>
          )}

          {/* Spicy Modules Section */}
          <YStack gap="$3">
            <Text fontSize={17} fontWeight="700" color="$color">
              Spicy Modules 🌶️
            </Text>

            {spicyModules.length === 0 ? (
              <SpicyGateBanner onSettings={onSpicySettings} />
            ) : (
              <YStack gap="$2">
                {spicyModules.map((module) => (
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
                            backgroundColor="$red3"
                            borderRadius="$2"
                            paddingHorizontal="$2"
                            paddingVertical={2}
                          >
                            <Text fontSize={11} color="$red11" fontWeight="700">
                              🌶️ 18+
                            </Text>
                          </XStack>

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
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
