'use client'

import Link from 'next/link'
import { YStack, XStack, Text, Button, Spinner, Image } from 'tamagui'
import { trpc } from '@lustre/api'

function DiscoverNav({ active }: { active: 'discover' | 'search' | 'matches' }) {
  const navTabStyle: React.CSSProperties = {
    paddingBottom: '12px',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
  }

  const activeTabStyle: React.CSSProperties = {
    ...navTabStyle,
    color: '#D4A843',
    borderBottomColor: '#B87333',
  }

  const inactiveTabStyle: React.CSSProperties = {
    ...navTabStyle,
    color: '#8B7E74',
  }

  return (
    <XStack marginBottom="$4" borderBottomWidth={1} borderBottomColor="#C4956A">
      <Link href="/discover" style={{ textDecoration: 'none' }}>
        <Text
          fontWeight="600"
          fontSize="$4"
          style={active === 'discover' ? activeTabStyle : inactiveTabStyle}
        >
          Discover
        </Text>
      </Link>
      <Link href="/discover/search" style={{ textDecoration: 'none', marginLeft: 24 }}>
        <Text
          fontWeight="600"
          fontSize="$4"
          style={active === 'search' ? activeTabStyle : inactiveTabStyle}
        >
          Search
        </Text>
      </Link>
      <Link href="/discover/matches" style={{ textDecoration: 'none', marginLeft: 24 }}>
        <Text
          fontWeight="600"
          fontSize="$4"
          style={active === 'matches' ? activeTabStyle : inactiveTabStyle}
        >
          Matches
        </Text>
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
          <Text color="#8B7E74" fontSize="$4">No matches yet</Text>
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
                backgroundColor="#FDF8F3"
                borderRadius={16}
                overflow="hidden"
                style={{
                  boxShadow: '0 2px 8px rgba(184, 115, 51, 0.15)',
                }}
              >
                {profile.photos.length > 0 ? (
                  <YStack position="relative" width="100%" height={400}>
                    <Image
                      source={{ uri: profile.photos[0].thumbnailLarge || profile.photos[0].url }}
                      width="100%"
                      height={400}
                      objectFit="cover"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(transparent 60%, rgba(44,36,33,0.8) 100%)',
                      }}
                    />
                    <YStack
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      padding="$3"
                    >
                      <Text fontSize="$4" fontWeight="600" color="white">
                        {profile.displayName}, {profile.age}
                      </Text>
                    </YStack>
                  </YStack>
                ) : (
                  <YStack width="100%" height={400} backgroundColor="#F5EDE4" alignItems="center" justifyContent="center">
                    <Text color="#8B7E74">No photo</Text>
                  </YStack>
                )}

                <YStack padding="$3" gap="$2">
                  {profile.bio && (
                    <Text
                      color="#8B7E74"
                      fontSize="$2"
                      numberOfLines={2}
                    >
                      {profile.bio}
                    </Text>
                  )}

                  <Text color="#C4956A" fontSize="$1">
                    Matched {formatDate(match.createdAt)}
                  </Text>

                  <Button
                    backgroundColor="#B87333"
                    borderRadius={8}
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
