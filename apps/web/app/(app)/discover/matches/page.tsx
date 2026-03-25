'use client'

import Link from 'next/link'
import { YStack, XStack, Text, Button, Spinner, Image } from 'tamagui'
import { trpc } from '@lustre/api'

function DiscoverNav({ active }: { active: 'discover' | 'search' | 'matches' }) {
  return (
    <XStack gap="$2" marginBottom="$4" borderBottomWidth={1} borderBottomColor="$borderColor">
      <Link href="/discover" style={{ textDecoration: 'none' }}>
        <Button
          theme={active === 'discover' ? 'primary' : undefined}
          chromeless={active !== 'discover'}
          paddingHorizontal="$3"
          paddingVertical="$2"
        >
          <Text fontWeight={active === 'discover' ? '600' : '400'} color={active === 'discover' ? '$primary' : '$textSecondary'}>
            Discover
          </Text>
        </Button>
      </Link>
      <Link href="/discover/search" style={{ textDecoration: 'none' }}>
        <Button
          theme={active === 'search' ? 'primary' : undefined}
          chromeless={active !== 'search'}
          paddingHorizontal="$3"
          paddingVertical="$2"
        >
          <Text fontWeight={active === 'search' ? '600' : '400'} color={active === 'search' ? '$primary' : '$textSecondary'}>
            Search
          </Text>
        </Button>
      </Link>
      <Link href="/discover/matches" style={{ textDecoration: 'none' }}>
        <Button
          theme={active === 'matches' ? 'primary' : undefined}
          chromeless={active !== 'matches'}
          paddingHorizontal="$3"
          paddingVertical="$2"
        >
          <Text fontWeight={active === 'matches' ? '600' : '400'} color={active === 'matches' ? '$primary' : '$textSecondary'}>
            Matches
          </Text>
        </Button>
      </Link>
    </XStack>
  )
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function MatchesPage() {
  const { data: matches, isLoading } = trpc.match.getMatches.useQuery({})

  if (isLoading) {
    return (
      <YStack flex={1} padding="$4" maxWidth={1200} marginHorizontal="auto">
        <DiscoverNav active="matches" />
        <YStack flex={1} alignItems="center" justifyContent="center" minHeight="60vh">
          <Spinner color="$primary" />
        </YStack>
      </YStack>
    )
  }

  const matchList = matches ?? []

  return (
    <YStack flex={1} padding="$4" maxWidth={1200} marginHorizontal="auto">
      <DiscoverNav active="matches" />

      {matchList.length === 0 ? (
        <YStack alignItems="center" justifyContent="center" padding="$6" minHeight="60vh">
          <Text color="$textSecondary" fontSize="$4">No matches yet</Text>
        </YStack>
      ) : (
        <XStack
          flexWrap="wrap"
          gap="$4"
          justifyContent="center"
          paddingVertical="$4"
        >
          {matchList.map((match) => {
            const profile = match.matchedUser
            return (
              <YStack
                key={match.id}
                width={{ '@sm': '100%', '@md': 'calc(50% - 8px)', '@lg': 'calc(33.333% - 11px)' }}
                minWidth={250}
                maxWidth={350}
                backgroundColor="$background"
                borderRadius="$4"
                overflow="hidden"
                borderWidth={1}
                borderColor="$borderColor"
              >
                {profile.photos.length > 0 ? (
                  <Image
                    source={{ uri: profile.photos[0].thumbnailLarge || profile.photos[0].url }}
                    width="100%"
                    height={400}
                    objectFit="cover"
                  />
                ) : (
                  <YStack width="100%" height={400} backgroundColor="$gray5" alignItems="center" justifyContent="center">
                    <Text color="$textSecondary">No photo</Text>
                  </YStack>
                )}

                <YStack padding="$3" gap="$2">
                  <XStack alignItems="center" gap="$2">
                    <Text fontSize="$4" fontWeight="600" color="$text">
                      {profile.displayName}, {profile.age}
                    </Text>
                  </XStack>

                  {profile.bio && (
                    <Text
                      color="$textSecondary"
                      fontSize="$2"
                      numberOfLines={2}
                    >
                      {profile.bio}
                    </Text>
                  )}

                  <Text color="$textSecondary" fontSize="$1">
                    Matched {formatDate(match.createdAt)}
                  </Text>

                  <Button
                    backgroundColor="$primary"
                    borderRadius="$3"
                    paddingVertical="$2"
                  >
                    <Text color="white" fontWeight="600">View Profile</Text>
                  </Button>
                </YStack>
              </YStack>
            )
          })}
        </XStack>
      )}
    </YStack>
  )
}
