'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { YStack, XStack, Text, ScrollView, Input, Button, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'

export default function GiveKudosPage() {
  const params = useParams()
  const router = useRouter()
  const recipientId = params.recipientId as string

  const badgesQuery = trpc.kudos.listBadges.useQuery()
  const suggestMutation = trpc.kudos.suggestBadges.useMutation()
  const giveMutation = trpc.kudos.give.useMutation()
  const utils = trpc.useUtils()

  const [freeText, setFreeText] = useState('')
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<Set<string>>(new Set())
  const [suggestedIds, setSuggestedIds] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = badgesQuery.data ?? []
  const allBadges = categories.flatMap((c: any) =>
    c.badges.map((b: any) => ({ ...b, categoryName: c.name }))
  )

  const toggleBadge = (badgeId: string) => {
    const next = new Set(selectedBadgeIds)
    if (next.has(badgeId)) {
      next.delete(badgeId)
    } else if (next.size < 6) {
      next.add(badgeId)
    }
    setSelectedBadgeIds(next)
  }

  const handleSuggest = async () => {
    if (!freeText.trim()) return
    const result = await suggestMutation.mutateAsync({ freeText })
    setSuggestedIds(result.suggestedBadgeIds)
    setSelectedBadgeIds(new Set(result.suggestedBadgeIds))
  }

  const handleSubmit = async () => {
    if (selectedBadgeIds.size === 0) return
    await giveMutation.mutateAsync({
      recipientId,
      badgeIds: Array.from(selectedBadgeIds),
    })
    utils.kudos.getPendingPrompts.invalidate()
    router.back()
  }

  const filteredCategories = activeCategory
    ? categories.filter((c: any) => c.slug === activeCategory)
    : categories

  if (badgesQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$8">
        <Spinner size="large" />
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack padding="$6" gap="$6" maxWidth={800} marginHorizontal="auto" width="100%">
        <Text fontSize="$8" fontWeight="bold">
          Ge kudos
        </Text>

        <YStack gap="$3">
          <Text fontSize="$5" fontWeight="600">
            Beskriv din upplevelse
          </Text>
          <Input
            placeholder="Hur var det att träffa denna person?"
            value={freeText}
            onChangeText={setFreeText}
            multiline
            numberOfLines={3}
          />
          <Button
            theme="active"
            onPress={handleSuggest}
            disabled={!freeText.trim() || suggestMutation.isPending}
          >
            {suggestMutation.isPending ? 'Analyserar...' : 'Föreslå badges'}
          </Button>
        </YStack>

        {suggestedIds.length > 0 && (
          <YStack gap="$3">
            <Text fontSize="$5" fontWeight="600">
              Föreslagna badges
            </Text>
            <XStack flexWrap="wrap" gap="$2">
              {suggestedIds.map((id) => {
                const badge = allBadges.find((b: any) => b.id === id)
                if (!badge) return null
                return (
                  <Button
                    key={id}
                    size="$3"
                    theme={selectedBadgeIds.has(id) ? 'active' : 'gray'}
                    onPress={() => toggleBadge(id)}
                  >
                    {badge.name}
                  </Button>
                )
              })}
            </XStack>
          </YStack>
        )}

        <XStack gap="$2" flexWrap="wrap">
          <Button
            size="$3"
            theme={!activeCategory ? 'active' : 'gray'}
            onPress={() => setActiveCategory(null)}
          >
            Alla
          </Button>
          {categories.map((c: any) => (
            <Button
              key={c.id}
              size="$3"
              theme={activeCategory === c.slug ? 'active' : 'gray'}
              onPress={() => setActiveCategory(c.slug)}
            >
              {c.name}
            </Button>
          ))}
        </XStack>

        {filteredCategories.map((category: any) => (
          <YStack key={category.id} gap="$2">
            <Text fontSize="$4" fontWeight="600">
              {category.name}
            </Text>
            <XStack flexWrap="wrap" gap="$2">
              {category.badges.map((badge: any) => (
                <Button
                  key={badge.id}
                  size="$3"
                  theme={selectedBadgeIds.has(badge.id) ? 'active' : 'gray'}
                  onPress={() => toggleBadge(badge.id)}
                >
                  {badge.name}
                </Button>
              ))}
            </XStack>
          </YStack>
        ))}

        <Text fontSize="$2" color="$gray10">
          {selectedBadgeIds.size}/6 badges valda
        </Text>

        <XStack gap="$3">
          <Button flex={1} theme="gray" onPress={() => router.back()}>
            Avbryt
          </Button>
          <Button
            flex={1}
            theme="active"
            onPress={handleSubmit}
            disabled={selectedBadgeIds.size === 0 || giveMutation.isPending}
          >
            {giveMutation.isPending ? 'Skickar...' : 'Skicka kudos'}
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
