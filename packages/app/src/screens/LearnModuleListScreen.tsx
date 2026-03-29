import { ScrollView, YStack, XStack, Text, Spinner } from 'tamagui'
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
        paddingHorizontal="$md"
        paddingVertical="$sm"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text fontSize={20} fontWeight="700" color="$color" fontFamily="$heading">
          Lär dig
        </Text>
        {onAchievementsPress && (
          <TouchableOpacity onPress={onAchievementsPress}>
            <Text fontSize={20}>🏆</Text>
          </TouchableOpacity>
        )}
      </XStack>

      <ScrollView flex={1}>
        <YStack paddingHorizontal="$md" paddingTop="$sm" paddingBottom="$lg" gap="$md">
          {/* Vanilla Modules Section */}
          {vanillaModules.length > 0 && (
            <YStack gap="$sm">
              <Text fontSize={17} fontWeight="700" color="$color" fontFamily="$heading">
                Moduler
              </Text>
              <YStack gap="$xs">
                {vanillaModules.map((module) => (
                  <TouchableOpacity
                    key={module.id}
                    onPress={() => module.isUnlocked && onModulePress(module.id)}
                    activeOpacity={module.isUnlocked ? 0.7 : 1}
                  >
                    <XStack
                      backgroundColor="$gray2"
                      borderRadius="$4"
                      padding="$sm"
                      gap="$sm"
                      alignItems="flex-start"
                      opacity={module.isUnlocked ? 1 : 0.5}
                    >
                      <YStack
                        width={44}
                        height={44}
                        borderRadius={22}
                        backgroundColor={module.isUnlocked ? '#894d0d' : '$gray6'}
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Text fontSize={16} fontWeight="700" color="white">
                          {module.order}
                        </Text>
                      </YStack>

                      <YStack flex={1} gap="$xs">
                        <XStack alignItems="center" gap="$xs">
                          <Text fontSize={15} fontWeight="600" color="$color" flex={1}>
                            {module.title}
                          </Text>
                          {!module.isUnlocked && <Text fontSize={16}>🔒</Text>}
                        </XStack>

                        <Text fontSize={13} color="$gray10" numberOfLines={2}>
                          {module.description}
                        </Text>

                        <XStack alignItems="center" gap="$xs" marginTop="$1">
                          <XStack
                            backgroundColor="$gray4"
                            borderRadius="$2"
                            paddingHorizontal="$xs"
                            paddingVertical={2}
                          >
                            <Text fontSize={11} color="$gray11">
                              {module.lessons.length} lektioner
                            </Text>
                          </XStack>

                          {module.progress?.badgeAwardedAt && (
                            <XStack
                              backgroundColor="rgba(212, 168, 67, 0.15)"
                              borderRadius="$2"
                              paddingHorizontal="$xs"
                              paddingVertical={2}
                            >
                              <Text fontSize={11} color="#a76526" fontWeight="600">
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
          <YStack gap="$sm">
            <Text fontSize={17} fontWeight="700" color="$color" fontFamily="$heading">
              Spicy Modules 🌶️
            </Text>

            {spicyModules.length === 0 ? (
              <SpicyGateBanner onSettings={onSpicySettings} />
            ) : (
              <YStack gap="$xs">
                {spicyModules.map((module) => (
                  <TouchableOpacity
                    key={module.id}
                    onPress={() => module.isUnlocked && onModulePress(module.id)}
                    activeOpacity={module.isUnlocked ? 0.7 : 1}
                  >
                    <XStack
                      backgroundColor="$gray2"
                      borderRadius="$4"
                      padding="$sm"
                      gap="$sm"
                      alignItems="flex-start"
                      opacity={module.isUnlocked ? 1 : 0.5}
                    >
                      <YStack
                        width={44}
                        height={44}
                        borderRadius={22}
                        backgroundColor={module.isUnlocked ? '#894d0d' : '$gray6'}
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Text fontSize={16} fontWeight="700" color="white">
                          {module.order}
                        </Text>
                      </YStack>

                      <YStack flex={1} gap="$xs">
                        <XStack alignItems="center" gap="$xs">
                          <Text fontSize={15} fontWeight="600" color="$color" flex={1}>
                            {module.title}
                          </Text>
                          {!module.isUnlocked && <Text fontSize={16}>🔒</Text>}
                        </XStack>

                        <Text fontSize={13} color="$gray10" numberOfLines={2}>
                          {module.description}
                        </Text>

                        <XStack alignItems="center" gap="$xs" marginTop="$1">
                          <XStack
                            backgroundColor="$red3"
                            borderRadius="$2"
                            paddingHorizontal="$xs"
                            paddingVertical={2}
                          >
                            <Text fontSize={11} color="$red11" fontWeight="700">
                              🌶️ 18+
                            </Text>
                          </XStack>

                          <XStack
                            backgroundColor="$gray4"
                            borderRadius="$2"
                            paddingHorizontal="$xs"
                            paddingVertical={2}
                          >
                            <Text fontSize={11} color="$gray11">
                              {module.lessons.length} lektioner
                            </Text>
                          </XStack>

                          {module.progress?.badgeAwardedAt && (
                            <XStack
                              backgroundColor="rgba(212, 168, 67, 0.15)"
                              borderRadius="$2"
                              paddingHorizontal="$xs"
                              paddingVertical={2}
                            >
                              <Text fontSize={11} color="#a76526" fontWeight="600">
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
