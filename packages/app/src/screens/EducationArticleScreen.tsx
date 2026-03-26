import { ScrollView, YStack, XStack, Text, Spinner } from 'tamagui'
import { TouchableOpacity } from 'react-native'
import { trpc } from '@lustre/api'
import { useEffect } from 'react'

interface EducationArticleScreenProps {
  articleId: string
  onBack: () => void
}

export function EducationArticleScreen({ articleId, onBack }: EducationArticleScreenProps) {
  const articleQuery = trpc.education.getArticle.useQuery({ articleId }, { enabled: !!articleId })
  const markReadMutation = trpc.education.markArticleRead.useMutation()

  const article = articleQuery.data

  useEffect(() => {
    if (article && !article.isRead) {
      markReadMutation.mutate({ articleId })
    }
  }, [article, articleId, markReadMutation])

  if (articleQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner />
      </YStack>
    )
  }

  if (!article) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text color="$gray10">Artikeln kunde inte hittas</Text>
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
          Artikel
        </Text>
      </XStack>

      <ScrollView flex={1}>
        <YStack paddingHorizontal="$4" paddingVertical="$4" gap="$4" paddingBottom="$6">
          <YStack gap="$2">
            <Text fontSize={18} fontWeight="700" color="$color">
              {article.title}
            </Text>
            {article.readingTimeMinutes && (
              <XStack alignItems="center" gap="$2">
                <YStack
                  backgroundColor="$gray3"
                  borderRadius="$2"
                  paddingHorizontal="$2"
                  paddingVertical={2}
                >
                  <Text fontSize={12} color="$gray11">
                    {article.readingTimeMinutes} min läsning
                  </Text>
                </YStack>
              </XStack>
            )}
          </YStack>

          <Text fontSize={14} color="$color" lineHeight="$1.5">
            {article.content}
          </Text>

          {article.disclaimer && (
            <YStack
              backgroundColor="$gray2"
              borderRadius="$3"
              padding="$3"
              borderLeftWidth={3}
              borderLeftColor="$gray9"
            >
              <Text fontSize={12} color="$gray11" fontWeight="600" marginBottom="$2">
                Viktigt
              </Text>
              <Text fontSize={12} color="$gray10" lineHeight="$1.4">
                {article.disclaimer}
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
