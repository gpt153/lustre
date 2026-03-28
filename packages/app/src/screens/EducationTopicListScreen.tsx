import { ScrollView, YStack, XStack, Text, Spinner } from 'tamagui'
import { TouchableOpacity } from 'react-native'
import { useEducation } from '../hooks/useEducation'
import { useState } from 'react'

interface EducationTopicListScreenProps {
  onTopicPress: (topicSlug: string) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'Alla',
  ANATOMY: 'Anatomi',
  PLEASURE: 'Njutning',
  STI_PREVENTION: 'STI',
  MENTAL_HEALTH: 'Psykisk hälsa',
  RELATIONSHIPS: 'Relationer',
  KINK_SAFETY: 'Kink',
  LGBTQ: 'HBTQ+',
  AGING: 'Åldrande',
}

const CATEGORIES = ['ALL', 'ANATOMY', 'PLEASURE', 'STI_PREVENTION', 'MENTAL_HEALTH', 'RELATIONSHIPS', 'KINK_SAFETY', 'LGBTQ', 'AGING']

export function EducationTopicListScreen({ onTopicPress }: EducationTopicListScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const { topics, isLoading } = useEducation({
    category: selectedCategory === 'ALL' ? undefined : selectedCategory,
  })

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner />
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack
        paddingHorizontal="$md"
        paddingVertical="$sm"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text fontSize={20} fontWeight="700" color="$color">
          Sexuell hälsa
        </Text>
      </YStack>

      <ScrollView flex={1}>
        <YStack paddingHorizontal="$md" paddingTop="$sm" paddingBottom="$lg" gap="$md">
          {/* Category filter buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$xs" paddingRight="$md">
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.7}
                >
                  <YStack
                    backgroundColor={selectedCategory === category ? '$pink8' : '$gray2'}
                    borderRadius="$3"
                    paddingHorizontal="$sm"
                    paddingVertical="$xs"
                    minWidth={80}
                    alignItems="center"
                  >
                    <Text
                      fontSize={13}
                      fontWeight="600"
                      color={selectedCategory === category ? 'white' : '$color'}
                    >
                      {CATEGORY_LABELS[category]}
                    </Text>
                  </YStack>
                </TouchableOpacity>
              ))}
            </XStack>
          </ScrollView>

          {/* Topic cards */}
          <YStack gap="$sm">
            {topics.length === 0 ? (
              <Text fontSize={14} color="$gray10" textAlign="center" marginTop="$4">
                Inga ämnen tillgängliga
              </Text>
            ) : (
              topics.map((topic) => (
                <TouchableOpacity
                  key={topic.slug}
                  onPress={() => onTopicPress(topic.slug)}
                  activeOpacity={0.7}
                >
                  <YStack
                    backgroundColor="$gray2"
                    borderRadius="$4"
                    padding="$sm"
                    gap="$xs"
                  >
                    <XStack alignItems="center" gap="$xs" justifyContent="space-between">
                      <Text fontSize={15} fontWeight="600" color="$color" flex={1}>
                        {topic.title}
                      </Text>
                      {topic.category && (
                        <YStack
                          backgroundColor="$pink3"
                          borderRadius="$2"
                          paddingHorizontal="$xs"
                          paddingVertical={2}
                        >
                          <Text fontSize={11} color="$pink11" fontWeight="600">
                            {CATEGORY_LABELS[topic.category] || topic.category}
                          </Text>
                        </YStack>
                      )}
                    </XStack>
                    <Text fontSize={13} color="$gray10" numberOfLines={2}>
                      {topic.description}
                    </Text>
                  </YStack>
                </TouchableOpacity>
              ))
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
