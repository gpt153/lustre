import { ScrollView, YStack, XStack, Text, Spinner } from 'tamagui'
import { TouchableOpacity } from 'react-native'
import { useEducation } from '../hooks/useEducation'

interface EducationArticleListScreenProps {
  topicSlug: string
  onArticlePress: (articleId: string) => void
  onBack: () => void
}

export function EducationArticleListScreen({
  topicSlug,
  onArticlePress,
  onBack,
}: EducationArticleListScreenProps) {
  const { articles, isArticlesLoading } = useEducation({ topicSlug })

  if (isArticlesLoading) {
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
        gap="$3"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text fontSize={20}>←</Text>
        </TouchableOpacity>
        <Text fontSize={16} fontWeight="600" color="$color" flex={1}>
          Artiklar
        </Text>
      </XStack>

      <ScrollView flex={1}>
        <YStack paddingHorizontal="$4" paddingVertical="$3" gap="$2" paddingBottom="$6">
          {articles.length === 0 ? (
            <YStack alignItems="center" justifyContent="center" minHeight={200}>
              <Text fontSize={14} color="$gray10" textAlign="center">
                Inga artiklar tillgängliga för detta ämne
              </Text>
            </YStack>
          ) : (
            articles.map((article) => (
              <TouchableOpacity
                key={article.id}
                onPress={() => onArticlePress(article.id)}
                activeOpacity={0.7}
              >
                <YStack
                  backgroundColor="$gray2"
                  borderRadius="$3"
                  padding="$3"
                  gap="$2"
                >
                  <XStack alignItems="flex-start" justifyContent="space-between" gap="$2">
                    <Text fontSize={14} fontWeight="600" color="$color" flex={1}>
                      {article.title}
                    </Text>
                    {article.isRead && (
                      <Text fontSize={12} color="$gray10">
                        ✓
                      </Text>
                    )}
                  </XStack>
                  <Text fontSize={12} color="$gray10" numberOfLines={2}>
                    {article.description || article.content?.substring(0, 60)}
                  </Text>
                  {article.readingTimeMinutes && (
                    <Text fontSize={11} color="$gray9">
                      {article.readingTimeMinutes} min läsning
                    </Text>
                  )}
                </YStack>
              </TouchableOpacity>
            ))
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
