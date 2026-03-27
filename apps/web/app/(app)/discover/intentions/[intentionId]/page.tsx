'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { YStack, XStack, Text, Button, Spinner, Image, ScrollView } from 'tamagui'
import { trpc } from '@lustre/api'
import { IntentionProfileCard } from '@lustre/ui'

function getIntentionSeekingLabel(seeking: string): string {
  const labels: Record<string, string> = {
    CASUAL: 'Casual',
    RELATIONSHIP: 'Relation',
    FRIENDSHIP: 'Vänskap',
    EXPLORATION: 'Utforska',
    EVENT: 'Event',
    OTHER: 'Annat',
  }
  return labels[seeking] || seeking
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: 'Aktiv',
    PAUSED: 'Pausad',
    EXPIRED: 'Utgången',
    DELETED: 'Borttagen',
  }
  return labels[status] || status
}

export default function IntentionFeedPage() {
  const params = useParams()
  const intentionId = params.intentionId as string

  const { data: intention, isLoading: intentionLoading } = trpc.intention.get.useQuery({
    id: intentionId,
  })

  const [cursor, setCursor] = useState<string | undefined>()
  const [feedItems, setFeedItems] = useState<any[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)

  const { data: feedData, isLoading: feedLoading } = trpc.intention.getFeed.useQuery(
    {
      intentionId,
      cursor,
      limit: 20,
    },
    {
      enabled: !!intentionId && intention?.status === 'ACTIVE',
    }
  )

  useEffect(() => {
    if (feedData) {
      if (cursor === undefined) {
        setFeedItems(feedData.results)
      } else {
        setFeedItems((prev) => [...prev, ...feedData.results])
      }
      setHasMore(feedData.nextCursor !== null)
      setCursor(feedData.nextCursor || undefined)
      setIsLoadingMore(false)
    }
  }, [feedData])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && feedData) {
          setIsLoadingMore(true)
          setCursor(feedData.nextCursor || undefined)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, isLoadingMore, feedData])

  if (intentionLoading) {
    return (
      <YStack flex={1} padding="$4" maxWidth={1200} marginHorizontal="auto">
        <YStack flex={1} alignItems="center" justifyContent="center" minHeight="60vh">
          <Spinner color="$primary" />
        </YStack>
      </YStack>
    )
  }

  if (!intention) {
    return (
      <YStack flex={1} padding="$4" maxWidth={1200} marginHorizontal="auto">
        <YStack flex={1} alignItems="center" justifyContent="center" minHeight="60vh">
          <Text color="#8B7E74" fontSize="$4">
            Intention hittades inte
          </Text>
        </YStack>
      </YStack>
    )
  }

  const isExpiredOrInactive = intention.status !== 'ACTIVE'

  return (
    <YStack flex={1} maxWidth={1200} marginHorizontal="auto">
      <ScrollView flex={1}>
        <YStack padding="$4" gap="$6">
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="flex-start">
              <YStack gap="$2" flex={1}>
                <XStack gap="$2" alignItems="center">
                  <Link href="/discover/intentions" style={{ textDecoration: 'none' }}>
                    <Text color="#B87333" fontSize="$2" fontWeight="500">
                      ← Tillbaka
                    </Text>
                  </Link>
                </XStack>
                <Text fontSize="$5" fontWeight="700" color="#2C2421">
                  {getIntentionSeekingLabel(intention.seeking)}
                </Text>
              </YStack>
              <Link
                href={`/discover/intentions/${intentionId}/edit`}
                style={{ textDecoration: 'none' }}
              >
                <Button backgroundColor="#B87333" borderRadius={8} paddingHorizontal="$4">
                  <Text color="white" fontWeight="600" fontSize="$2">
                    Redigera
                  </Text>
                </Button>
              </Link>
            </XStack>

            <YStack gap="$2" backgroundColor="#FDF8F3" padding="$4" borderRadius={12} borderColor="#E0D5C8" borderWidth={1}>
              <XStack gap="$4" flexWrap="wrap">
                <YStack gap="$1">
                  <Text fontSize="$2" color="#8B7E74">
                    Status
                  </Text>
                  <Text fontSize="$3" fontWeight="600" color="#2C2421">
                    {getStatusLabel(intention.status)}
                  </Text>
                </YStack>

                <YStack gap="$1">
                  <Text fontSize="$2" color="#8B7E74">
                    Åldersintervall
                  </Text>
                  <Text fontSize="$3" fontWeight="600" color="#2C2421">
                    {intention.ageMin}-{intention.ageMax}
                  </Text>
                </YStack>

                <YStack gap="$1">
                  <Text fontSize="$2" color="#8B7E74">
                    Sökradie
                  </Text>
                  <Text fontSize="$3" fontWeight="600" color="#2C2421">
                    {intention.distanceRadiusKm} km
                  </Text>
                </YStack>

                <YStack gap="$1">
                  <Text fontSize="$2" color="#8B7E74">
                    Tillgänglighet
                  </Text>
                  <Text fontSize="$3" fontWeight="600" color="#2C2421">
                    {intention.availability}
                  </Text>
                </YStack>

                {intention.status !== 'EXPIRED' && intention.status !== 'DELETED' && (
                  <YStack gap="$1">
                    <Text fontSize="$2" color="#8B7E74">
                      Dagar kvar
                    </Text>
                    <Text fontSize="$3" fontWeight="600" color="#C4956A">
                      {intention.daysRemaining}
                    </Text>
                  </YStack>
                )}
              </XStack>
            </YStack>
          </YStack>

          {isExpiredOrInactive && (
            <YStack
              backgroundColor="#FEF2F2"
              borderColor="#FECACA"
              borderWidth={1}
              borderRadius={8}
              padding="$3"
            >
              <Text fontSize="$2" color="#DC2626" fontWeight="500">
                Denna intention är {intention.status === 'EXPIRED' ? 'utgången' : 'inte aktiv'}. Gå tillbaka för att aktivera den.
              </Text>
            </YStack>
          )}

          {!isExpiredOrInactive && (
            <>
              <YStack gap="$4">
                <Text fontSize="$4" fontWeight="600" color="#2C2421">
                  Matchningar ({feedItems.length})
                </Text>

                {feedItems.length === 0 && feedLoading ? (
                  <YStack alignItems="center" justifyContent="center" minHeight={200}>
                    <Spinner color="$primary" />
                  </YStack>
                ) : feedItems.length === 0 ? (
                  <YStack alignItems="center" justifyContent="center" minHeight={200}>
                    <Text color="#8B7E74" fontSize="$3">
                      Inga matchningar än. Försök senare!
                    </Text>
                  </YStack>
                ) : (
                  <YStack gap="$4">
                    {feedItems.map((item, idx) => (
                      <IntentionProfileCard
                        key={`${item.userId}-${idx}`}
                        userId={item.userId}
                        displayName={item.displayName}
                        compatibilityScore={item.compatibilityScore}
                        matchedIntentionTags={item.matchedIntentionTags}
                        bioSnippet={item.bioSnippet}
                        photoUrl={item.photoUrl}
                        intentionSeeking={item.intentionSeeking}
                        isFallback={item.isFallback}
                      />
                    ))}
                  </YStack>
                )}

                {hasMore && (
                  <div ref={observerTarget} style={{ height: 100, marginTop: 20 }}>
                    {isLoadingMore && (
                      <YStack alignItems="center" justifyContent="center" height="100%">
                        <Spinner color="$primary" />
                      </YStack>
                    )}
                  </div>
                )}
              </YStack>
            </>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
