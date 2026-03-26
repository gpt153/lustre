'use client'

import { useState } from 'react'
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

interface ProfileWithPhotos {
  userId: string
  displayName: string
  age: number
  bio: string | null
  verified: boolean
  photos: Array<{
    id: string
    url: string
    thumbnailLarge: string | null
  }>
}

export default function DiscoverPage() {
  const [matchOverlay, setMatchOverlay] = useState<ProfileWithPhotos | null>(null)

  const { data: profiles, isLoading } = trpc.match.getDiscoveryStack.useQuery({ limit: 20 })
  const swipeMutation = trpc.match.swipe.useMutation()

  const handleSwipe = async (targetId: string, action: 'LIKE' | 'PASS') => {
    try {
      const result = await swipeMutation.mutateAsync({ targetId, action })
      if (result.matched && profiles) {
        const matchedProfile = profiles.find(p => p.userId === targetId)
        if (matchedProfile) {
          setMatchOverlay(matchedProfile)
        }
      }
    } catch (error) {
      console.error('Swipe error:', error)
    }
  }

  if (isLoading) {
    return (
      <YStack flex={1} padding="$4" maxWidth={1200} marginHorizontal="auto">
        <DiscoverNav active="discover" />
        <YStack flex={1} alignItems="center" justifyContent="center" minHeight="60vh">
          <Spinner color="$primary" />
        </YStack>
      </YStack>
    )
  }

  const profileList = profiles ?? []

  return (
    <YStack flex={1} padding="$4" maxWidth={1200} marginHorizontal="auto">
      <DiscoverNav active="discover" />

      {matchOverlay && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="rgba(0,0,0,0.5)"
          zIndex={1000}
          alignItems="center"
          justifyContent="center"
          onPress={() => setMatchOverlay(null)}
        >
          <YStack
            backgroundColor="#F5EDE4"
            borderRadius={16}
            padding="$6"
            maxWidth={300}
            alignItems="center"
            gap="$4"
          >
            <Text fontSize="$6" fontWeight="700" color="#B87333">
              It's a Match!
            </Text>
            {matchOverlay.photos.length > 0 && (
              <Image
                source={{ uri: matchOverlay.photos[0].thumbnailLarge || matchOverlay.photos[0].url }}
                width={200}
                height={200}
                borderRadius={12}
              />
            )}
            <YStack alignItems="center" gap="$1">
              <Text fontSize="$4" fontWeight="600" color="#2C2421">
                {matchOverlay.displayName}, {matchOverlay.age}
              </Text>
              {matchOverlay.verified && (
                <Text fontSize="$2" color="#B87333">✓ Verified</Text>
              )}
            </YStack>
            <Button
              backgroundColor="#B87333"
              borderRadius={8}
              paddingHorizontal="$4"
              onPress={() => setMatchOverlay(null)}
            >
              <Text color="white" fontWeight="600">Close</Text>
            </Button>
          </YStack>
        </YStack>
      )}

      {profileList.length === 0 ? (
        <YStack alignItems="center" justifyContent="center" padding="$6" minHeight="60vh">
          <Text color="#8B7E74" fontSize="$4">No more profiles to discover</Text>
        </YStack>
      ) : (
        <XStack
          flexWrap="wrap"
          gap="$4"
          justifyContent="center"
          paddingVertical="$4"
        >
          {profileList.map((profile) => (
            <Link key={profile.userId} href={`/profile/${profile.userId}`} style={{ textDecoration: 'none', display: 'block', minWidth: 250, maxWidth: 350, width: '100%' }}>
            <YStack
              width="100%"
              backgroundColor="#FDF8F3"
              borderRadius={16}
              overflow="hidden"
              style={{
                boxShadow: '0 2px 8px rgba(184, 115, 51, 0.15)',
                cursor: 'pointer',
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
                    <XStack alignItems="center" gap="$2">
                      <Text fontSize="$4" fontWeight="600" color="white">
                        {profile.displayName}, {profile.age}
                      </Text>
                      {profile.verified && (
                        <Text fontSize="$2" color="#D4A843">✓</Text>
                      )}
                    </XStack>
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

                <XStack gap="$2" paddingTop="$2">
                  <Button
                    flex={1}
                    borderRadius={8}
                    paddingVertical="$2"
                    backgroundColor="transparent"
                    borderWidth={2}
                    borderColor="#B87333"
                    onPress={(e) => { e.preventDefault(); e.stopPropagation(); handleSwipe(profile.userId, 'PASS') }}
                    disabled={swipeMutation.isPending}
                    hoverStyle={{ backgroundColor: '#E05A33', borderColor: '#E05A33' }}
                    cursor="pointer"
                  >
                    <Text color="#B87333" fontWeight="600">✕</Text>
                  </Button>
                  <Button
                    flex={1}
                    borderRadius={8}
                    paddingVertical="$2"
                    backgroundColor="transparent"
                    borderWidth={2}
                    borderColor="#B87333"
                    onPress={(e) => { e.preventDefault(); e.stopPropagation(); handleSwipe(profile.userId, 'LIKE') }}
                    disabled={swipeMutation.isPending}
                    hoverStyle={{ backgroundColor: '#D4A843', borderColor: '#D4A843' }}
                    cursor="pointer"
                  >
                    <Text color="#B87333" fontWeight="600">♥</Text>
                  </Button>
                </XStack>
              </YStack>
            </YStack>
            </Link>
          ))}
        </XStack>
      )}
    </YStack>
  )
}
