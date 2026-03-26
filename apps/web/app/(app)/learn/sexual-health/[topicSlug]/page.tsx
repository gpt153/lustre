'use client'

import { use, useState } from 'react'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

export default function TopicDetailPage({ params }: { params: Promise<{ topicSlug: string }> }) {
  const { topicSlug } = use(params)
  const [activeTab, setActiveTab] = useState<'articles' | 'podcast'>('articles')

  const articlesQuery = trpc.education.listArticles.useQuery({ topicSlug })
  const podcastsQuery = trpc.education.listPodcasts.useQuery({ topicSlug })

  const isLoading = articlesQuery.isLoading || podcastsQuery.isLoading

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  const articles = articlesQuery.data ?? []
  const podcasts = podcastsQuery.data ?? []
  const podcast = podcasts.length > 0 ? podcasts[0] : null

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={900} gap="$5">
        <Link href="/learn/sexual-health" style={{ textDecoration: 'none' }}>
          <Text fontSize="$3" color="$primary">
            ← Tillbaka
          </Text>
        </Link>

        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="700" color="$text">
            {topicSlug}
          </Text>
        </YStack>

        <XStack gap="$3" borderBottomWidth={1} borderColor="$borderColor">
          <XStack
            paddingBottom="$3"
            borderBottomWidth={activeTab === 'articles' ? 2 : 0}
            borderColor="$primary"
            cursor="pointer"
            onPress={() => setActiveTab('articles')}
          >
            <Text
              fontSize="$4"
              fontWeight={activeTab === 'articles' ? '700' : '600'}
              color={activeTab === 'articles' ? '$primary' : '$textSecondary'}
            >
              Artiklar
            </Text>
          </XStack>

          <XStack
            paddingBottom="$3"
            borderBottomWidth={activeTab === 'podcast' ? 2 : 0}
            borderColor="$primary"
            cursor="pointer"
            onPress={() => setActiveTab('podcast')}
          >
            <Text
              fontSize="$4"
              fontWeight={activeTab === 'podcast' ? '700' : '600'}
              color={activeTab === 'podcast' ? '$primary' : '$textSecondary'}
            >
              Podcast
            </Text>
          </XStack>
        </XStack>

        {activeTab === 'articles' && (
          <YStack gap="$3">
            {articles.length === 0 ? (
              <YStack
                alignItems="center"
                padding="$8"
                backgroundColor="$background"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text color="$textSecondary" fontSize="$4" textAlign="center">
                  Inga artiklar tillgängliga
                </Text>
              </YStack>
            ) : (
              articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/learn/sexual-health/article/${article.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <YStack
                    backgroundColor="$background"
                    borderRadius="$4"
                    borderWidth={1}
                    borderColor="$borderColor"
                    padding="$4"
                    gap="$2"
                    hoverStyle={{ borderColor: '$primary' }}
                    cursor="pointer"
                  >
                    <XStack alignItems="center" gap="$3" justifyContent="space-between">
                      <Text fontSize="$4" fontWeight="700" color="$text" flex={1}>
                        {article.title}
                      </Text>
                      <YStack
                        backgroundColor="$backgroundHover"
                        borderRadius="$2"
                        paddingHorizontal="$2"
                        paddingVertical="$1"
                      >
                        <Text fontSize="$2" color="$textSecondary" fontWeight="500">
                          {article.readingTimeMinutes} min
                        </Text>
                      </YStack>
                    </XStack>
                  </YStack>
                </Link>
              ))
            )}
          </YStack>
        )}

        {activeTab === 'podcast' && (
          <YStack gap="$3">
            {!podcast ? (
              <YStack
                alignItems="center"
                padding="$8"
                backgroundColor="$background"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text color="$textSecondary" fontSize="$4" textAlign="center">
                  Podcast snart tillgänglig
                </Text>
              </YStack>
            ) : (
              <YStack
                backgroundColor="$background"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$borderColor"
                padding="$4"
                gap="$4"
              >
                <YStack gap="$2">
                  <Text fontSize="$4" fontWeight="700" color="$text">
                    {podcast.title}
                  </Text>
                  <Text fontSize="$3" color="$textSecondary" lineHeight={20}>
                    {podcast.description}
                  </Text>
                </YStack>

                <YStack gap="$2">
                  <audio
                    controls
                    src={podcast.audioUrl}
                    style={{ width: '100%' }}
                  />
                </YStack>
              </YStack>
            )}
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}
