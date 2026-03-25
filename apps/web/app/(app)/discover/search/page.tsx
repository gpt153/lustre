'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { YStack, XStack, Text, Button, Spinner, Image, Input } from 'tamagui'
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

const GENDERS = ['MAN', 'WOMAN', 'NON_BINARY', 'TRANS_MAN', 'TRANS_WOMAN', 'GENDERQUEER', 'GENDERFLUID', 'AGENDER', 'BIGENDER', 'TWO_SPIRIT', 'OTHER']
const ORIENTATIONS = ['STRAIGHT', 'GAY', 'LESBIAN', 'BISEXUAL', 'PANSEXUAL', 'QUEER', 'ASEXUAL', 'DEMISEXUAL', 'OTHER']
const SEEKING_OPTIONS = ['FRIENDSHIP', 'DATING', 'CASUAL', 'RELATIONSHIP', 'PLAY_PARTNER', 'NETWORKING', 'OTHER']

function formatLabel(str: string): string {
  return str.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
}

export default function SearchPage() {
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  const [selectedOrientations, setSelectedOrientations] = useState<string[]>([])
  const [selectedSeeking, setSelectedSeeking] = useState<string[]>([])
  const [ageMin, setAgeMin] = useState<number | undefined>()
  const [ageMax, setAgeMax] = useState<number | undefined>()
  const [radiusKm, setRadiusKm] = useState<number | undefined>()

  const searchQuery = trpc.match.search.useQuery({
    gender: selectedGenders.length > 0 ? (selectedGenders as any) : undefined,
    orientation: selectedOrientations.length > 0 ? (selectedOrientations as any) : undefined,
    seeking: selectedSeeking.length > 0 ? (selectedSeeking as any) : undefined,
    ageMin,
    ageMax,
    radiusKm,
  })

  const profiles = searchQuery.data?.profiles ?? []

  const toggleGender = (gender: string) => {
    setSelectedGenders(prev => prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender])
  }

  const toggleOrientation = (orientation: string) => {
    setSelectedOrientations(prev => prev.includes(orientation) ? prev.filter(o => o !== orientation) : [...prev, orientation])
  }

  const toggleSeeking = (seek: string) => {
    setSelectedSeeking(prev => prev.includes(seek) ? prev.filter(s => s !== seek) : [...prev, seek])
  }

  return (
    <YStack flex={1} padding="$4">
      <DiscoverNav active="search" />

      <XStack flex={1} gap="$4" flexWrap="wrap">
        <YStack
          width={{ '@sm': '100%', '@md': '250px', '@lg': '300px' }}
          gap="$3"
          padding="$4"
          backgroundColor="$background"
          borderRadius="$3"
          borderWidth={1}
          borderColor="$borderColor"
          maxHeight="80vh"
          overflowY="auto"
        >
          <Text fontSize="$4" fontWeight="600" color="$text">Filters</Text>

          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="500" color="$text">Gender</Text>
            <YStack gap="$1">
              {GENDERS.map(gender => (
                <Button
                  key={gender}
                  chromeless
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  backgroundColor={selectedGenders.includes(gender) ? '$primary' : '$gray4'}
                  onPress={() => toggleGender(gender)}
                  borderRadius="$2"
                  justifyContent="flex-start"
                >
                  <Text color={selectedGenders.includes(gender) ? 'white' : '$text'} fontSize="$2">
                    {formatLabel(gender)}
                  </Text>
                </Button>
              ))}
            </YStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="500" color="$text">Age Range</Text>
            <XStack gap="$2">
              <Input
                placeholder="Min"
                value={ageMin?.toString() ?? ''}
                onChangeText={(val) => setAgeMin(val ? parseInt(val, 10) : undefined)}
                keyboardType="numeric"
                width="50%"
                padding="$2"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$2"
              />
              <Input
                placeholder="Max"
                value={ageMax?.toString() ?? ''}
                onChangeText={(val) => setAgeMax(val ? parseInt(val, 10) : undefined)}
                keyboardType="numeric"
                width="50%"
                padding="$2"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$2"
              />
            </XStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="500" color="$text">Orientation</Text>
            <YStack gap="$1">
              {ORIENTATIONS.map(orientation => (
                <Button
                  key={orientation}
                  chromeless
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  backgroundColor={selectedOrientations.includes(orientation) ? '$primary' : '$gray4'}
                  onPress={() => toggleOrientation(orientation)}
                  borderRadius="$2"
                  justifyContent="flex-start"
                >
                  <Text color={selectedOrientations.includes(orientation) ? 'white' : '$text'} fontSize="$2">
                    {formatLabel(orientation)}
                  </Text>
                </Button>
              ))}
            </YStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="500" color="$text">Seeking</Text>
            <YStack gap="$1">
              {SEEKING_OPTIONS.map(seek => (
                <Button
                  key={seek}
                  chromeless
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  backgroundColor={selectedSeeking.includes(seek) ? '$primary' : '$gray4'}
                  onPress={() => toggleSeeking(seek)}
                  borderRadius="$2"
                  justifyContent="flex-start"
                >
                  <Text color={selectedSeeking.includes(seek) ? 'white' : '$text'} fontSize="$2">
                    {formatLabel(seek)}
                  </Text>
                </Button>
              ))}
            </YStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="500" color="$text">Radius (km)</Text>
            <Input
              placeholder="Any distance"
              value={radiusKm?.toString() ?? ''}
              onChangeText={(val) => setRadiusKm(val ? parseFloat(val) : undefined)}
              keyboardType="decimal-pad"
              padding="$2"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$2"
            />
          </YStack>
        </YStack>

        <YStack flex={1} minWidth={300}>
          {searchQuery.isLoading ? (
            <YStack alignItems="center" justifyContent="center" minHeight="60vh">
              <Spinner color="$primary" />
            </YStack>
          ) : profiles.length === 0 ? (
            <YStack alignItems="center" justifyContent="center" minHeight="60vh">
              <Text color="$textSecondary" fontSize="$4">No profiles match your filters</Text>
            </YStack>
          ) : (
            <XStack
              flexWrap="wrap"
              gap="$4"
              justifyContent="flex-start"
            >
              {profiles.map((profile) => (
                <YStack
                  key={profile.userId}
                  width={200}
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
                      height={250}
                      objectFit="cover"
                    />
                  ) : (
                    <YStack width="100%" height={250} backgroundColor="$gray5" alignItems="center" justifyContent="center">
                      <Text color="$textSecondary">No photo</Text>
                    </YStack>
                  )}

                  <YStack padding="$3" gap="$1">
                    <XStack alignItems="center" gap="$2">
                      <Text fontSize="$3" fontWeight="600" color="$text">
                        {profile.displayName}, {profile.age}
                      </Text>
                      {profile.verified && (
                        <Text fontSize="$2" color="$primary">✓</Text>
                      )}
                    </XStack>

                    {profile.bio && (
                      <Text
                        color="$textSecondary"
                        fontSize="$1"
                        numberOfLines={1}
                      >
                        {profile.bio}
                      </Text>
                    )}
                  </YStack>
                </YStack>
              ))}
            </XStack>
          )}
        </YStack>
      </XStack>
    </YStack>
  )
}
