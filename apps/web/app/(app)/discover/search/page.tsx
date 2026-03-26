'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { YStack, XStack, Text, Button, Spinner, Image, Input } from 'tamagui'
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
          backgroundColor="#F5EDE4"
          borderRadius={16}
          borderWidth={2}
          borderColor="#C4956A"
          maxHeight="80vh"
          overflowY="auto"
        >
          <Text fontSize="$4" fontWeight="600" color="#2C2421">Filters</Text>

          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="500" color="#2C2421">Gender</Text>
            <YStack gap="$1">
              {GENDERS.map(gender => (
                <Button
                  key={gender}
                  chromeless
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  backgroundColor={selectedGenders.includes(gender) ? '#B87333' : '#FDF8F3'}
                  onPress={() => toggleGender(gender)}
                  borderRadius={6}
                  justifyContent="flex-start"
                >
                  <Text color={selectedGenders.includes(gender) ? 'white' : '#2C2421'} fontSize="$2">
                    {formatLabel(gender)}
                  </Text>
                </Button>
              ))}
            </YStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="500" color="#2C2421">Age Range</Text>
            <XStack gap="$2">
              <Input
                placeholder="Min"
                value={ageMin?.toString() ?? ''}
                onChangeText={(val) => setAgeMin(val ? parseInt(val, 10) : undefined)}
                keyboardType="numeric"
                width="50%"
                padding="$2"
                borderWidth={1}
                borderColor="#C4956A"
                borderRadius={6}
                backgroundColor="#FDF8F3"
                color="#2C2421"
                placeholderTextColor="#8B7E74"
              />
              <Input
                placeholder="Max"
                value={ageMax?.toString() ?? ''}
                onChangeText={(val) => setAgeMax(val ? parseInt(val, 10) : undefined)}
                keyboardType="numeric"
                width="50%"
                padding="$2"
                borderWidth={1}
                borderColor="#C4956A"
                borderRadius={6}
                backgroundColor="#FDF8F3"
                color="#2C2421"
                placeholderTextColor="#8B7E74"
              />
            </XStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="500" color="#2C2421">Orientation</Text>
            <YStack gap="$1">
              {ORIENTATIONS.map(orientation => (
                <Button
                  key={orientation}
                  chromeless
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  backgroundColor={selectedOrientations.includes(orientation) ? '#B87333' : '#FDF8F3'}
                  onPress={() => toggleOrientation(orientation)}
                  borderRadius={6}
                  justifyContent="flex-start"
                >
                  <Text color={selectedOrientations.includes(orientation) ? 'white' : '#2C2421'} fontSize="$2">
                    {formatLabel(orientation)}
                  </Text>
                </Button>
              ))}
            </YStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="500" color="#2C2421">Seeking</Text>
            <YStack gap="$1">
              {SEEKING_OPTIONS.map(seek => (
                <Button
                  key={seek}
                  chromeless
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  backgroundColor={selectedSeeking.includes(seek) ? '#B87333' : '#FDF8F3'}
                  onPress={() => toggleSeeking(seek)}
                  borderRadius={6}
                  justifyContent="flex-start"
                >
                  <Text color={selectedSeeking.includes(seek) ? 'white' : '#2C2421'} fontSize="$2">
                    {formatLabel(seek)}
                  </Text>
                </Button>
              ))}
            </YStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="500" color="#2C2421">Radius (km)</Text>
            <Input
              placeholder="Any distance"
              value={radiusKm?.toString() ?? ''}
              onChangeText={(val) => setRadiusKm(val ? parseFloat(val) : undefined)}
              keyboardType="decimal-pad"
              padding="$2"
              borderWidth={1}
              borderColor="#C4956A"
              borderRadius={6}
              backgroundColor="#FDF8F3"
              color="#2C2421"
              placeholderTextColor="#8B7E74"
            />
          </YStack>
        </YStack>

        <YStack flex={1} minWidth={300}>
          {searchQuery.isLoading ? (
            <YStack alignItems="center" justifyContent="center" minHeight="60vh">
              <Spinner color="#B87333" />
            </YStack>
          ) : profiles.length === 0 ? (
            <YStack alignItems="center" justifyContent="center" minHeight="60vh">
              <Text color="#8B7E74" fontSize="$4">No profiles match your filters</Text>
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
                  backgroundColor="#FDF8F3"
                  borderRadius={16}
                  overflow="hidden"
                  style={{
                    boxShadow: '0 2px 8px rgba(184, 115, 51, 0.15)',
                  }}
                >
                  {profile.photos.length > 0 ? (
                    <YStack position="relative" width="100%" height={250}>
                      <Image
                        source={{ uri: profile.photos[0].thumbnailLarge || profile.photos[0].url }}
                        width="100%"
                        height={250}
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
                        padding="$2"
                      >
                        <XStack alignItems="center" gap="$2">
                          <Text fontSize="$3" fontWeight="600" color="white">
                            {profile.displayName}, {profile.age}
                          </Text>
                          {profile.verified && (
                            <Text fontSize="$2" color="#D4A843">✓</Text>
                          )}
                        </XStack>
                      </YStack>
                    </YStack>
                  ) : (
                    <YStack width="100%" height={250} backgroundColor="#F5EDE4" alignItems="center" justifyContent="center">
                      <Text color="#8B7E74">No photo</Text>
                    </YStack>
                  )}

                  <YStack padding="$3" gap="$1">
                    {profile.bio && (
                      <Text
                        color="#8B7E74"
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
