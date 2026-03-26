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
        paddingHorizontal="$4"
        paddingVertical="$3"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text fontSize={20} fontWeight="700" color="$color">
          Sexuell hälsa
        </Text>
      </YStack>

      <ScrollView flex={1}>
        <YStack paddingHorizontal="$4" paddingTop="$3" paddingBottom="$6" gap="$4">
          {/* Category filter buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$2" paddingRight="$4">
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.7}
                >
                  <YStack
                    backgroundColor={selectedCategory === category ? '$pink8' : '$gray2'}
                    borderRadius="$3"
                    paddingHorizontal="$3"
                    paddingVertical="$2"
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
          <YStack gap="$3">
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
                    padding="$3"
                    gap="$2"
                  >
                    <XStack alignItems="center" gap="$2" justifyContent="space-between">
                      <Text fontSize={15} fontWeight="600" color="$color" flex={1}>
                        {topic.title}
                      </Text>
                      {topic.category && (
                        <YStack
                          backgroundColor="$pink3"
                          borderRadius="$2"
                          paddingHorizontal="$2"
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
