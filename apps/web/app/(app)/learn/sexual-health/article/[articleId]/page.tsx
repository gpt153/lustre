'use client'

import { use, useEffect } from 'react'
import { YStack, XStack, Text, Spinner, ScrollView } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

export default function ArticleReaderPage({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = use(params)
  const articleQuery = trpc.education.getArticle.useQuery({ articleId })
  const markReadMutation = trpc.education.markArticleRead.useMutation()

  useEffect(() => {
    if (articleQuery.data) {
      markReadMutation.mutate({ articleId })
    }
  }, [articleId, articleQuery.data, markReadMutation])

  if (articleQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  const article = articleQuery.data
  if (!article) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary" fontSize="$4">
          Artikeln hittades inte.
        </Text>
      </YStack>
    )
  }

  return (
    <ScrollView flex={1}>
      <YStack flex={1} alignItems="center" padding="$4" paddingBottom="$8">
        <YStack width="100%" maxWidth={900} gap="$5">
          <Link href="/learn/sexual-health" style={{ textDecoration: 'none' }}>
            <Text fontSize="$3" color="$primary">
              ← Tillbaka
            </Text>
          </Link>

          <YStack gap="$3">
            <Text fontSize="$6" fontWeight="700" color="$text">
              {article.title}
            </Text>

            <YStack
              backgroundColor="$backgroundHover"
              borderRadius="$2"
              paddingHorizontal="$2"
              paddingVertical="$1"
              width="fit-content"
            >
              <Text fontSize="$2" color="$textSecondary" fontWeight="500">
                📖 {article.readingTimeMinutes} minuter läsning
              </Text>
            </YStack>
          </YStack>

          <YStack
            backgroundColor="#F3F4F6"
            borderRadius="$3"
            borderLeftWidth={4}
            borderColor="$primary"
            padding="$4"
            gap="$2"
          >
            <Text fontSize="$4" fontWeight="700" color="$text">
              ⓘ Ansvar
            </Text>
            <Text fontSize="$3" color="$textSecondary" lineHeight={20}>
              Detta innehål är endast för utbildningsändamål. Det ersätter inte professionell medicinsk eller psykologisk rådgivning. Konsultera alltid en kvalificerad hälsovårdspersonal för personlig vägledning.
            </Text>
          </YStack>

          <YStack>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontFamily: 'inherit',
                fontSize: '16px',
                lineHeight: '1.6',
              }}
            >
              {article.content}
            </pre>
          </YStack>

          <YStack
            backgroundColor="#F3F4F6"
            borderRadius="$3"
            borderLeftWidth={4}
            borderColor="$primary"
            padding="$4"
            gap="$2"
          >
            <Text fontSize="$4" fontWeight="700" color="$text">
              ⓘ Ansvar
            </Text>
            <Text fontSize="$3" color="$textSecondary" lineHeight={20}>
              Det här innehållet uppdaterades senast {new Date().toLocaleDateString('sv-SE')}. Sexualitet är en privat fråga — använd denna information enligt dina egna behov och värderingar.
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
