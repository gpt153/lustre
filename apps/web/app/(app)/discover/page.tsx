'use client'

import { useState } from 'react'
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
            backgroundColor="$background"
            borderRadius="$4"
            padding="$6"
            maxWidth={300}
            alignItems="center"
            gap="$4"
          >
            <Text fontSize="$6" fontWeight="700" color="$primary">
              It's a Match!
            </Text>
            {matchOverlay.photos.length > 0 && (
              <Image
                source={{ uri: matchOverlay.photos[0].thumbnailLarge || matchOverlay.photos[0].url }}
                width={200}
                height={200}
                borderRadius="$3"
              />
            )}
            <YStack alignItems="center" gap="$1">
              <Text fontSize="$4" fontWeight="600" color="$text">
                {matchOverlay.displayName}, {matchOverlay.age}
              </Text>
              {matchOverlay.verified && (
                <Text fontSize="$2" color="$primary">✓ Verified</Text>
              )}
            </YStack>
            <Button
              backgroundColor="$primary"
              borderRadius="$3"
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
          <Text color="$textSecondary" fontSize="$4">No more profiles to discover</Text>
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
              backgroundColor="$background"
              borderRadius="$4"
              overflow="hidden"
              borderWidth={1}
              borderColor="$borderColor"
              hoverStyle={{ borderColor: '$primary', cursor: 'pointer' }}
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
                  {profile.verified && (
                    <Text fontSize="$2" color="$primary">✓</Text>
                  )}
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

                <XStack gap="$2" paddingTop="$2">
                  <Button
                    flex={1}
                    backgroundColor="$red9"
                    borderRadius="$3"
                    paddingVertical="$2"
                    onPress={(e) => { e.preventDefault(); e.stopPropagation(); handleSwipe(profile.userId, 'PASS') }}
                    disabled={swipeMutation.isPending}
                  >
                    <Text color="white" fontWeight="600">Pass</Text>
                  </Button>
                  <Button
                    flex={1}
                    backgroundColor="$green9"
                    borderRadius="$3"
                    paddingVertical="$2"
                    onPress={(e) => { e.preventDefault(); e.stopPropagation(); handleSwipe(profile.userId, 'LIKE') }}
                    disabled={swipeMutation.isPending}
                  >
                    <Text color="white" fontWeight="600">Like</Text>
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
