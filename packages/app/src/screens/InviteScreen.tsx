import { ScrollView, YStack, XStack, Text, Button, Input, Spinner } from 'tamagui'
import { useCallback, useState } from 'react'
import { useInvite } from '../hooks/useInvite'

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function InviteScreen() {
  const { links, isLoadingLinks, generate, isGenerating, rewards, isLoadingRewards } = useInvite()
  const [copied, setCopied] = useState(false)

  const currentLink = links?.[0]

  const handleCopy = useCallback(async () => {
    if (!currentLink) return
    const url = `https://lovelustre.com/invite/${currentLink.code}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for mobile or unsupported browsers
      alert(url)
    }
  }, [currentLink])

  const handleGenerateNew = async () => {
    await generate()
  }

  const totalInvited = rewards?.given?.length ?? 0
  const totalTokensEarned = (rewards?.given ?? []).reduce((sum, r) => sum + r.referrerTokens, 0)

  if (isLoadingLinks || isLoadingRewards) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
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
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text fontSize={20} fontWeight="700" color="$color">
          Bjud in vänner
        </Text>
      </XStack>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$md" paddingVertical="$md" gap="$lg">
          {/* Current Link Section */}
          <YStack gap="$sm">
            <Text fontSize={14} fontWeight="600" color="$gray11">
              Din inbjudningslänk
            </Text>

            {currentLink ? (
              <YStack gap="$xs">
                <XStack
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$3"
                  paddingHorizontal="$sm"
                  paddingVertical="$xs"
                  alignItems="center"
                  gap="$xs"
                  backgroundColor="$gray1"
                >
                  <Input
                    flex={1}
                    value={`https://lovelustre.com/invite/${currentLink.code}`}
                    editable={false}
                    fontSize={12}
                    fontFamily="$mono"
                    color="$color"
                    borderWidth={0}
                    paddingHorizontal="$xs"
                  />
                  <Button size="$3" backgroundColor="$pink10" color="white" onPress={handleCopy}>
                    {copied ? '✓' : 'Kopiera'}
                  </Button>
                </XStack>

                <XStack gap="$xs">
                  <Button
                    flex={1}
                    size="$3"
                    backgroundColor="$gray4"
                    color="$color"
                    onPress={handleGenerateNew}
                    disabled={isGenerating}
                  >
                    {isGenerating ? '...' : 'Generera ny länk'}
                  </Button>
                </XStack>
              </YStack>
            ) : (
              <Button
                size="$4"
                backgroundColor="$pink10"
                color="white"
                borderRadius="$4"
                onPress={handleGenerateNew}
                disabled={isGenerating}
              >
                {isGenerating ? 'Genererar...' : 'Generera inbjudningslänk'}
              </Button>
            )}
          </YStack>

          {/* Stats Section */}
          <YStack gap="$sm" backgroundColor="$gray1" borderRadius="$4" padding="$md">
            <YStack gap="$xs">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color="$gray11">
                  Du har bjudit in
                </Text>
                <Text fontSize={18} fontWeight="700" color="$color">
                  {totalInvited}
                </Text>
              </XStack>
              <Text fontSize={12} color="$gray10">
                {totalInvited === 1 ? 'person' : 'personer'}
              </Text>
            </YStack>

            <YStack gap="$xs">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color="$gray11">
                  Token tjänade
                </Text>
                <Text fontSize={18} fontWeight="700" color="$pink10">
                  {totalTokensEarned}
                </Text>
              </XStack>
            </YStack>
          </YStack>

          {/* Rewards List Section */}
          {(rewards?.given?.length ?? 0) > 0 && (
            <YStack gap="$sm">
              <Text fontSize={14} fontWeight="600" color="$gray11">
                Din inbjudningshistorik
              </Text>

              <YStack gap="$xs">
                {rewards?.given?.map((reward) => (
                  <XStack
                    key={reward.id}
                    backgroundColor="$gray2"
                    borderRadius="$3"
                    padding="$sm"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <YStack gap="$xs" flex={1}>
                      <Text fontSize={12} color="$gray10">
                        {formatDate(reward.createdAt)}
                      </Text>
                    </YStack>
                    <Text fontSize={14} fontWeight="600" color="$pink10">
                      +{reward.referrerTokens}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
