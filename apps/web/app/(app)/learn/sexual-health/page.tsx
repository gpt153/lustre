'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

const CATEGORY_LABELS: Record<string, string> = {
  ANATOMY: 'Anatomi',
  PLEASURE: 'Njutning',
  STI_PREVENTION: 'STI',
  MENTAL_HEALTH: 'Psykisk hälsa',
  RELATIONSHIPS: 'Relationer',
  KINK_SAFETY: 'Kink',
  LGBTQ: 'HBTQ+',
  AGING: 'Åldrande',
}

export default function SexualHealthPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const listQuery = trpc.education.listTopics.useQuery({})

  if (listQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  const topics = listQuery.data ?? []
  const categories = Array.from(new Set(topics.map((t) => t.category)))

  const filteredTopics = selectedCategory
    ? topics.filter((t) => t.category === selectedCategory)
    : topics

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={900} gap="$5">
        <Link href="/learn" style={{ textDecoration: 'none' }}>
          <Text fontSize="$3" color="$primary">
            ← Tillbaka
          </Text>
        </Link>

        <Text fontSize="$6" fontWeight="700" color="$text">
          Sexuell hälsa 🔬
        </Text>

        <XStack gap="$2" flexWrap="wrap">
          <XStack
            backgroundColor={selectedCategory === null ? '$primary' : '$backgroundHover'}
            borderRadius="$3"
            paddingHorizontal="$3"
            paddingVertical="$2"
            cursor="pointer"
            hoverStyle={{ opacity: 0.8 }}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              fontSize="$2"
              fontWeight="600"
              color={selectedCategory === null ? 'white' : '$text'}
            >
              Alla
            </Text>
          </XStack>

          {categories.map((category) => (
            <XStack
              key={category}
              backgroundColor={selectedCategory === category ? '$primary' : '$backgroundHover'}
              borderRadius="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
              cursor="pointer"
              hoverStyle={{ opacity: 0.8 }}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                fontSize="$2"
                fontWeight="600"
                color={selectedCategory === category ? 'white' : '$text'}
              >
                {CATEGORY_LABELS[category] || category}
              </Text>
            </XStack>
          ))}
        </XStack>

        {filteredTopics.length === 0 ? (
          <YStack
            alignItems="center"
            padding="$8"
            backgroundColor="$background"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text color="$textSecondary" fontSize="$4" textAlign="center">
              Inga ämnen tillgängliga
            </Text>
          </YStack>
        ) : (
          <XStack flexWrap="wrap" gap="$4" justifyContent="space-between">
            {filteredTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/learn/sexual-health/${topic.slug}`}
                style={{ textDecoration: 'none', flex: 1, minWidth: 280 }}
              >
                <YStack
                  flex={1}
                  backgroundColor="$background"
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor="$borderColor"
                  padding="$4"
                  gap="$3"
                  hoverStyle={{ borderColor: '$primary' }}
                  cursor="pointer"
                >
                  <XStack alignItems="center" gap="$2" justifyContent="space-between">
                    <Text fontSize="$4" fontWeight="700" color="$text" flex={1}>
                      {topic.title}
                    </Text>
                    <YStack
                      backgroundColor="$primary"
                      borderRadius="$2"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                    >
                      <Text fontSize="$1" fontWeight="600" color="white">
                        {CATEGORY_LABELS[topic.category] || topic.category}
                      </Text>
                    </YStack>
                  </XStack>

                  <Text fontSize="$3" color="$textSecondary" numberOfLines={3} lineHeight={20}>
                    {topic.description}
                  </Text>
                </YStack>
              </Link>
            ))}
          </XStack>
        )}
      </YStack>
    </YStack>
  )
}
