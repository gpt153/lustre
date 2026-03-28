import { useState, useCallback } from 'react'
import { FlatList, RefreshControl, TouchableOpacity, StyleSheet, ScrollView as RNScrollView } from 'react-native'
import { YStack, XStack, Text, Input, Image, Spinner } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import { trpc } from '@lustre/api'

const COPPER = '#B87333'
const COPPER_DARK = '#894D0D'
const GOLD = '#D4A843'
const WARM_WHITE = '#FDF8F3'
const CHARCOAL = '#2C2421'
const WARM_GRAY = '#8B7E74'

type Gender = 'MAN' | 'WOMAN' | 'NON_BINARY' | 'TRANS_MAN' | 'TRANS_WOMAN' | 'GENDERQUEER' | 'GENDERFLUID' | 'AGENDER' | 'BIGENDER' | 'TWO_SPIRIT' | 'OTHER'
type Orientation = 'STRAIGHT' | 'GAY' | 'LESBIAN' | 'BISEXUAL' | 'PANSEXUAL' | 'QUEER' | 'ASEXUAL' | 'DEMISEXUAL' | 'OTHER'
type Seeking = 'FRIENDSHIP' | 'DATING' | 'CASUAL' | 'RELATIONSHIP' | 'PLAY_PARTNER' | 'NETWORKING' | 'OTHER'

const genderLabels: Record<string, string> = {
  WOMAN: 'Kvinna', MAN: 'Man', NON_BINARY: 'Icke-binär',
  TRANS_WOMAN: 'Transkvinna', TRANS_MAN: 'Transman',
  GENDERQUEER: 'Genderqueer', GENDERFLUID: 'Genderfluid',
  AGENDER: 'Agender', BIGENDER: 'Bigender', TWO_SPIRIT: 'Two-Spirit', OTHER: 'Annat',
}
const orientationLabels: Record<string, string> = {
  STRAIGHT: 'Hetero', GAY: 'Homo', LESBIAN: 'Lesbisk',
  BISEXUAL: 'Bi', PANSEXUAL: 'Pan', QUEER: 'Queer',
  ASEXUAL: 'Asexuell', DEMISEXUAL: 'Demi', OTHER: 'Annat',
}
const seekingLabels: Record<string, string> = {
  FRIENDSHIP: 'Vänskap', DATING: 'Dejting', CASUAL: 'Casual',
  RELATIONSHIP: 'Relation', PLAY_PARTNER: 'Lekpartner',
  NETWORKING: 'Nätverk', OTHER: 'Annat',
}

const genderOptions: Gender[] = ['WOMAN', 'MAN', 'NON_BINARY', 'TRANS_WOMAN', 'TRANS_MAN', 'OTHER']
const orientationOptions: Orientation[] = ['STRAIGHT', 'GAY', 'BISEXUAL', 'PANSEXUAL', 'ASEXUAL', 'OTHER']
const seekingOptions: Seeking[] = ['CASUAL', 'RELATIONSHIP', 'FRIENDSHIP', 'DATING', 'PLAY_PARTNER']

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <YStack
        paddingHorizontal={20}
        paddingVertical={10}
        borderRadius={999}
        backgroundColor={selected ? COPPER : 'transparent'}
        borderWidth={1.5}
        borderColor={selected ? COPPER : `${COPPER}66`}
      >
        <Text
          fontSize={14}
          fontWeight={selected ? '600' : '500'}
          color={selected ? 'white' : COPPER}
        >
          {label}
        </Text>
      </YStack>
    </TouchableOpacity>
  )
}

export function SearchScreen() {
  const [selectedGenders, setSelectedGenders] = useState<Gender[]>([])
  const [selectedOrientations, setSelectedOrientations] = useState<Orientation[]>([])
  const [selectedSeeking, setSelectedSeeking] = useState<Seeking[]>([])
  const [ageMin, setAgeMin] = useState('18')
  const [ageMax, setAgeMax] = useState('60')
  const [radiusKm, setRadiusKm] = useState('50')
  const [cursor, setCursor] = useState<string | undefined>(undefined)

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

  const handleReset = () => {
    setSelectedGenders([])
    setSelectedOrientations([])
    setSelectedSeeking([])
    setAgeMin('18')
    setAgeMax('60')
    setRadiusKm('50')
    setCursor(undefined)
  }

  return (
    <YStack flex={1} backgroundColor={WARM_WHITE}>
      <RNScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <XStack
          paddingHorizontal={20}
          paddingTop={8}
          paddingBottom={12}
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontSize={28} fontWeight="700" fontFamily="$heading" color={COPPER}>
            Filter
          </Text>
          <TouchableOpacity onPress={handleReset}>
            <Text fontSize={14} fontWeight="600" color={COPPER} textTransform="uppercase" letterSpacing={1}>
              Återställ
            </Text>
          </TouchableOpacity>
        </XStack>

        {/* Copper hero banner */}
        <YStack marginHorizontal={20} marginBottom={24} borderRadius={16} overflow="hidden" height={120}>
          <LinearGradient
            colors={[COPPER, GOLD]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <YStack flex={1} justifyContent="flex-end" padding={20}>
            <Text fontSize={18} fontWeight="600" color="white" fontStyle="italic" fontFamily="$heading">
              Skräddarsy din upplevelse
            </Text>
          </YStack>
        </YStack>

        <YStack paddingHorizontal={20} gap={28}>
          {/* Age */}
          <YStack gap={12}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text style={styles.sectionLabel}>ÅLDER</Text>
              <Text fontSize={16} fontWeight="600" color={COPPER}>
                {ageMin} — {ageMax}
              </Text>
            </XStack>
            <XStack gap={12} alignItems="center">
              <Input
                flex={1}
                value={ageMin}
                onChangeText={setAgeMin}
                keyboardType="number-pad"
                fontSize={16}
                fontWeight="600"
                color={CHARCOAL}
                borderWidth={1.5}
                borderColor={`${COPPER}40`}
                borderRadius={12}
                backgroundColor="transparent"
                paddingHorizontal={16}
                paddingVertical={12}
                textAlign="center"
              />
              <Text fontSize={16} color={WARM_GRAY}>—</Text>
              <Input
                flex={1}
                value={ageMax}
                onChangeText={setAgeMax}
                keyboardType="number-pad"
                fontSize={16}
                fontWeight="600"
                color={CHARCOAL}
                borderWidth={1.5}
                borderColor={`${COPPER}40`}
                borderRadius={12}
                backgroundColor="transparent"
                paddingHorizontal={16}
                paddingVertical={12}
                textAlign="center"
              />
            </XStack>
          </YStack>

          {/* Distance */}
          <YStack gap={12}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text style={styles.sectionLabel}>AVSTÅND</Text>
              <Text fontSize={16} fontWeight="600" color={COPPER}>
                {radiusKm} km
              </Text>
            </XStack>
            <Input
              value={radiusKm}
              onChangeText={setRadiusKm}
              keyboardType="decimal-pad"
              fontSize={16}
              fontWeight="600"
              color={CHARCOAL}
              borderWidth={1.5}
              borderColor={`${COPPER}40`}
              borderRadius={12}
              backgroundColor="transparent"
              paddingHorizontal={16}
              paddingVertical={12}
              textAlign="center"
            />
          </YStack>

          {/* Gender */}
          <YStack gap={12}>
            <Text style={styles.sectionLabel}>KÖN</Text>
            <XStack flexWrap="wrap" gap={8}>
              {genderOptions.map((gender) => (
                <FilterChip
                  key={gender}
                  label={genderLabels[gender] || gender}
                  selected={selectedGenders.includes(gender)}
                  onPress={() => toggleGender(gender)}
                />
              ))}
            </XStack>
          </YStack>

          {/* Orientation */}
          <YStack gap={12}>
            <Text style={styles.sectionLabel}>LÄGGNING</Text>
            <XStack flexWrap="wrap" gap={8}>
              {orientationOptions.map((orientation) => (
                <FilterChip
                  key={orientation}
                  label={orientationLabels[orientation] || orientation}
                  selected={selectedOrientations.includes(orientation)}
                  onPress={() => toggleOrientation(orientation)}
                />
              ))}
            </XStack>
          </YStack>

          {/* Seeking */}
          <YStack gap={12}>
            <Text style={styles.sectionLabel}>SÖKER</Text>
            <XStack flexWrap="wrap" gap={8}>
              {seekingOptions.map((seek) => (
                <FilterChip
                  key={seek}
                  label={seekingLabels[seek] || seek}
                  selected={selectedSeeking.includes(seek)}
                  onPress={() => toggleSeeking(seek)}
                />
              ))}
            </XStack>
          </YStack>

          {/* Results count */}
          {results.length > 0 && (
            <Text fontSize={14} color={WARM_GRAY} textAlign="center">
              {results.length} profiler hittade
            </Text>
          )}

          {/* Apply button */}
          <TouchableOpacity activeOpacity={0.85} style={{ marginBottom: 40 }}>
            <LinearGradient
              colors={[COPPER, COPPER_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyButton}
            >
              <Text fontSize={16} fontWeight="700" color="white">
                Visa resultat
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </YStack>
      </RNScrollView>
    </YStack>
  )
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: WARM_GRAY,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  applyButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COPPER_DARK,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
})
