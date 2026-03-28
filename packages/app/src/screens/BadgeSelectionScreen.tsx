import { useState } from 'react'
import { YStack, XStack, Text, ScrollView, Input, Button, Spinner } from 'tamagui'
import { CardBase, LustreButton } from '@lustre/ui'
import { useKudos } from '../hooks/useKudos'

interface BadgeSelectionScreenProps {
  recipientId: string
  recipientName: string
  matchId?: string
  onComplete: () => void
  onCancel: () => void
}

export function BadgeSelectionScreen({
  recipientId,
  recipientName,
  matchId,
  onComplete,
  onCancel,
}: BadgeSelectionScreenProps) {
  const { badges, suggestBadges, isSuggesting, give, isGiving } = useKudos()
  const [freeText, setFreeText] = useState('')
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<Set<string>>(new Set())
  const [suggestedIds, setSuggestedIds] = useState<string[]>([])

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
    const ids = await suggestBadges(freeText)
    setSuggestedIds(ids)
    setSelectedBadgeIds(new Set(ids))
  }

  const handleSubmit = async () => {
    if (selectedBadgeIds.size === 0) return
    await give({
      recipientId,
      matchId,
      badgeIds: Array.from(selectedBadgeIds),
    })
    onComplete()
  }

  const allBadges = badges.flatMap((c: any) => c.badges.map((b: any) => ({ ...b, categoryName: c.name })))

  return (
    <ScrollView>
      <YStack padding="$md" gap="$md">
        <Text fontSize="$7" fontWeight="bold">
          Kudos till {recipientName}
        </Text>

        <YStack gap="$xs">
          <Text fontSize="$4" fontWeight="600">
            Beskriv din upplevelse
          </Text>
          <Input
            placeholder="Hur var det att träffa denna person?"
            value={freeText}
            onChangeText={setFreeText}
            multiline
            numberOfLines={3}
          />
          <LustreButton
            onPress={handleSuggest}
            disabled={!freeText.trim() || isSuggesting}
          >
            {isSuggesting ? 'Analyserar...' : 'Föreslå badges'}
          </LustreButton>
        </YStack>

        {suggestedIds.length > 0 && (
          <YStack gap="$xs">
            <Text fontSize="$4" fontWeight="600">
              Föreslagna badges
            </Text>
            <XStack flexWrap="wrap" gap="$xs">
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

        {badges.map((category: any) => (
          <YStack key={category.id} gap="$xs">
            <Text fontSize="$4" fontWeight="600">
              {category.name}
            </Text>
            <XStack flexWrap="wrap" gap="$xs">
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

        <XStack gap="$sm">
          <Button flex={1} theme="gray" onPress={onCancel}>
            Avbryt
          </Button>
          <LustreButton
            flex={1}
            onPress={handleSubmit}
            disabled={selectedBadgeIds.size === 0 || isGiving}
          >
            {isGiving ? 'Skickar...' : 'Skicka kudos'}
          </LustreButton>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
