import { useState, useCallback } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { YStack, XStack, Text, Input, Button, Image, Spinner, ScrollView, Sheet } from 'tamagui'
import { trpc } from '@lustre/api'

type Gender = 'MAN' | 'WOMAN' | 'NON_BINARY' | 'TRANS_MAN' | 'TRANS_WOMAN' | 'GENDERQUEER' | 'GENDERFLUID' | 'AGENDER' | 'BIGENDER' | 'TWO_SPIRIT' | 'OTHER'
type Orientation = 'STRAIGHT' | 'GAY' | 'LESBIAN' | 'BISEXUAL' | 'PANSEXUAL' | 'QUEER' | 'ASEXUAL' | 'DEMISEXUAL' | 'OTHER'
type Seeking = 'FRIENDSHIP' | 'DATING' | 'CASUAL' | 'RELATIONSHIP' | 'PLAY_PARTNER' | 'NETWORKING' | 'OTHER'

const genderOptions: Gender[] = ['MAN', 'WOMAN', 'NON_BINARY', 'TRANS_MAN', 'TRANS_WOMAN', 'GENDERQUEER', 'GENDERFLUID', 'AGENDER', 'BIGENDER', 'TWO_SPIRIT', 'OTHER']
const orientationOptions: Orientation[] = ['STRAIGHT', 'GAY', 'LESBIAN', 'BISEXUAL', 'PANSEXUAL', 'QUEER', 'ASEXUAL', 'DEMISEXUAL', 'OTHER']
const seekingOptions: Seeking[] = ['FRIENDSHIP', 'DATING', 'CASUAL', 'RELATIONSHIP', 'PLAY_PARTNER', 'NETWORKING', 'OTHER']

export function SearchScreen() {
  const [selectedGenders, setSelectedGenders] = useState<Gender[]>([])
  const [selectedOrientations, setSelectedOrientations] = useState<Orientation[]>([])
  const [selectedSeeking, setSelectedSeeking] = useState<Seeking[]>([])
  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')
  const [radiusKm, setRadiusKm] = useState('')
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)

  const searchQuery = trpc.match.search.useQuery({
    gender: selectedGenders.length > 0 ? selectedGenders : undefined,
    orientation: selectedOrientations.length > 0 ? selectedOrientations : undefined,
    ageMin: ageMin ? parseInt(ageMin, 10) : undefined,
    ageMax: ageMax ? parseInt(ageMax, 10) : undefined,
    seeking: selectedSeeking.length > 0 ? selectedSeeking : undefined,
    radiusKm: radiusKm ? parseFloat(radiusKm) : undefined,
    cursor,
  })

  const results = searchQuery.data?.profiles ?? []
  const nextCursor = searchQuery.data?.nextCursor

  const toggleGender = (gender: Gender) => {
    setSelectedGenders((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    )
    setCursor(undefined)
  }

  const toggleOrientation = (orientation: Orientation) => {
    setSelectedOrientations((prev) =>
      prev.includes(orientation) ? prev.filter((o) => o !== orientation) : [...prev, orientation]
    )
    setCursor(undefined)
  }

  const toggleSeeking = (seek: Seeking) => {
    setSelectedSeeking((prev) =>
      prev.includes(seek) ? prev.filter((s) => s !== seek) : [...prev, seek]
    )
    setCursor(undefined)
  }

  const handleLoadMore = useCallback(() => {
    if (nextCursor && !searchQuery.isLoading) {
      setCursor(nextCursor)
    }
  }, [nextCursor, searchQuery.isLoading])

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack paddingHorizontal="$3" paddingVertical="$2" gap="$2" alignItems="center">
        <Button
          size="$3"
          backgroundColor="$primary"
          color="white"
          onPress={() => setShowFilters(true)}
        >
          Filters
        </Button>
        <Text flex={1} fontSize="$2" color="$textSecondary">
          {results.length} profiles found
        </Text>
      </XStack>

      <FlatList
        data={results}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => {
          const photoUrl = item.photos?.[0]?.thumbnailMedium || item.photos?.[0]?.url

          return (
            <YStack paddingHorizontal="$3" paddingVertical="$2">
              <Button
                unstyled
                backgroundColor="$background"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$3"
                overflow="hidden"
              >
                <XStack gap="$3" padding="$3" width="100%">
                  {photoUrl ? (
                    <Image
                      source={{ uri: photoUrl }}
                      width={80}
                      height={80}
                      borderRadius="$2"
                    />
                  ) : (
                    <YStack
                      width={80}
                      height={80}
                      backgroundColor="$gray2"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="$2"
                    >
                      <Text fontSize="$2" color="$textSecondary">
                        No photo
                      </Text>
                    </YStack>
                  )}

                  <YStack flex={1} justifyContent="center" gap="$1">
                    <XStack alignItems="center" gap="$2">
                      <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
                        {item.displayName}
                      </Text>
                      {item.age && (
                        <Text fontSize="$3" color="$textSecondary">
                          {item.age}
                        </Text>
                      )}
                    </XStack>

                    {item.bio && (
                      <Text
                        fontSize="$3"
                        color="$textSecondary"
                        numberOfLines={2}
                      >
                        {item.bio}
                      </Text>
                    )}
                  </YStack>
                </XStack>
              </Button>
            </YStack>
          )
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={searchQuery.isRefetching}
            onRefresh={() => searchQuery.refetch()}
          />
        }
        ListFooterComponent={
          searchQuery.isLoading ? (
            <YStack padding="$4" alignItems="center">
              <Spinner color="$primary" />
            </YStack>
          ) : null
        }
        ListEmptyComponent={
          !searchQuery.isLoading ? (
            <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
              <Text color="$textSecondary">No profiles found. Try adjusting your filters.</Text>
            </YStack>
          ) : null
        }
      />

      <Sheet
        modal
        open={showFilters}
        onOpenChange={setShowFilters}
        snapPoints={[80]}
        position={0}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame>
          <ScrollView padding="$4" gap="$4" showsVerticalScrollIndicator={false}>
            <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
              Search Filters
            </Text>

            <YStack gap="$2">
              <Text fontSize="$3" fontWeight="600" color="$textPrimary">
                Gender
              </Text>
              <XStack flexWrap="wrap" gap="$2">
                {genderOptions.map((gender) => (
                  <Button
                    key={gender}
                    size="$2"
                    onPress={() => toggleGender(gender)}
                    backgroundColor={selectedGenders.includes(gender) ? '$primary' : '$gray3'}
                    color={selectedGenders.includes(gender) ? 'white' : '$textPrimary'}
                  >
                    {gender}
                  </Button>
                ))}
              </XStack>
            </YStack>

            <YStack gap="$2">
              <Text fontSize="$3" fontWeight="600" color="$textPrimary">
                Orientation
              </Text>
              <XStack flexWrap="wrap" gap="$2">
                {orientationOptions.map((orientation) => (
                  <Button
                    key={orientation}
                    size="$2"
                    onPress={() => toggleOrientation(orientation)}
                    backgroundColor={selectedOrientations.includes(orientation) ? '$primary' : '$gray3'}
                    color={selectedOrientations.includes(orientation) ? 'white' : '$textPrimary'}
                  >
                    {orientation}
                  </Button>
                ))}
              </XStack>
            </YStack>

            <YStack gap="$2">
              <Text fontSize="$3" fontWeight="600" color="$textPrimary">
                Seeking
              </Text>
              <XStack flexWrap="wrap" gap="$2">
                {seekingOptions.map((seek) => (
                  <Button
                    key={seek}
                    size="$2"
                    onPress={() => toggleSeeking(seek)}
                    backgroundColor={selectedSeeking.includes(seek) ? '$primary' : '$gray3'}
                    color={selectedSeeking.includes(seek) ? 'white' : '$textPrimary'}
                  >
                    {seek}
                  </Button>
                ))}
              </XStack>
            </YStack>

            <YStack gap="$2">
              <Text fontSize="$3" fontWeight="600" color="$textPrimary">
                Age Range
              </Text>
              <XStack gap="$2">
                <Input
                  flex={1}
                  placeholder="Min age"
                  value={ageMin}
                  onChangeText={setAgeMin}
                  keyboardType="number-pad"
                  size="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$2"
                  paddingHorizontal="$2"
                />
                <Input
                  flex={1}
                  placeholder="Max age"
                  value={ageMax}
                  onChangeText={setAgeMax}
                  keyboardType="number-pad"
                  size="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$2"
                  paddingHorizontal="$2"
                />
              </XStack>
            </YStack>

            <YStack gap="$2">
              <Text fontSize="$3" fontWeight="600" color="$textPrimary">
                Radius (km)
              </Text>
              <Input
                placeholder="Optional: search radius"
                value={radiusKm}
                onChangeText={setRadiusKm}
                keyboardType="decimal-pad"
                size="$3"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$2"
                paddingHorizontal="$2"
              />
            </YStack>

            <XStack gap="$2" paddingBottom="$4">
              <Button
                flex={1}
                size="$3"
                backgroundColor="$gray3"
                color="$textPrimary"
                onPress={() => {
                  setSelectedGenders([])
                  setSelectedOrientations([])
                  setSelectedSeeking([])
                  setAgeMin('')
                  setAgeMax('')
                  setRadiusKm('')
                  setCursor(undefined)
                }}
              >
                Clear
              </Button>
              <Button
                flex={1}
                size="$3"
                backgroundColor="$primary"
                color="white"
                onPress={() => setShowFilters(false)}
              >
                Done
              </Button>
            </XStack>
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  )
}
