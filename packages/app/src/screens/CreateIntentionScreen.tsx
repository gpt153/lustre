import { useState } from 'react'
import { ScrollView, YStack, XStack, Text, Button, Input, Spinner } from 'tamagui'
import { useIntentions } from '../hooks/useIntentions'
import { useMode } from '../hooks/useMode'
import { TouchableOpacity } from 'react-native'

const SEEKING_OPTIONS = [
  { label: 'Casual', value: 'CASUAL' },
  { label: 'Relationship', value: 'RELATIONSHIP' },
  { label: 'Friendship', value: 'FRIENDSHIP' },
  { label: 'Exploration', value: 'EXPLORATION' },
  { label: 'Event', value: 'EVENT' },
  { label: 'Other', value: 'OTHER' },
]

const GENDER_OPTIONS = [
  { label: 'Man', value: 'MAN' },
  { label: 'Woman', value: 'WOMAN' },
  { label: 'Non-binary', value: 'NON_BINARY' },
  { label: 'Trans man', value: 'TRANS_MAN' },
  { label: 'Trans woman', value: 'TRANS_WOMAN' },
  { label: 'Genderqueer', value: 'GENDERQUEER' },
  { label: 'Genderfluid', value: 'GENDERFLUID' },
]

const ORIENTATION_OPTIONS = [
  { label: 'Straight', value: 'STRAIGHT' },
  { label: 'Gay', value: 'GAY' },
  { label: 'Lesbian', value: 'LESBIAN' },
  { label: 'Bisexual', value: 'BISEXUAL' },
  { label: 'Pansexual', value: 'PANSEXUAL' },
  { label: 'Queer', value: 'QUEER' },
  { label: 'Asexual', value: 'ASEXUAL' },
]

const AVAILABILITY_OPTIONS = [
  { label: 'Weekdays', value: 'WEEKDAYS' },
  { label: 'Weekends', value: 'WEEKENDS' },
  { label: 'Flexible', value: 'FLEXIBLE' },
]

const RELATIONSHIP_OPTIONS = [
  { label: 'Single', value: 'SINGLE' },
  { label: 'Partnered', value: 'PARTNERED' },
  { label: 'Married', value: 'MARRIED' },
  { label: 'Open relationship', value: 'OPEN_RELATIONSHIP' },
  { label: 'Polyamorous', value: 'POLYAMOROUS' },
]

const KINK_TAGS = [
  'BDSM',
  'Bondage',
  'Roleplay',
  'Impact Play',
  'Sensation Play',
  'Dominance/Submission',
  'Power Exchange',
  'Humiliation',
  'Exhibitionism',
  'Voyeurism',
]

interface CreateIntentionScreenProps {
  onSuccess?: () => void
}

function MultiSelect({
  options,
  selected,
  onChange,
  label,
}: {
  options: { label: string; value: string }[]
  selected: string[]
  onChange: (values: string[]) => void
  label: string
}) {
  return (
    <YStack gap="$xs">
      <Text color="$gray11" fontSize="$2" fontWeight="600">
        {label}
      </Text>
      <XStack flexWrap="wrap" gap="$xs">
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => {
              const updated = selected.includes(opt.value)
                ? selected.filter((v) => v !== opt.value)
                : [...selected, opt.value]
              onChange(updated)
            }}
          >
            <XStack
              backgroundColor={selected.includes(opt.value) ? '$blue9' : '$gray3'}
              paddingHorizontal="$sm"
              paddingVertical="$xs"
              borderRadius="$4"
              borderWidth={1}
              borderColor={selected.includes(opt.value) ? '$blue9' : '$gray4'}
            >
              <Text
                fontSize="$2"
                fontWeight={selected.includes(opt.value) ? '600' : '400'}
                color={selected.includes(opt.value) ? 'white' : '$gray11'}
              >
                {opt.label}
              </Text>
            </XStack>
          </TouchableOpacity>
        ))}
      </XStack>
    </YStack>
  )
}

function SingleSelect({
  options,
  selected,
  onChange,
  label,
}: {
  options: { label: string; value: string }[]
  selected: string
  onChange: (value: string) => void
  label: string
}) {
  return (
    <YStack gap="$xs">
      <Text color="$gray11" fontSize="$2" fontWeight="600">
        {label}
      </Text>
      <XStack flexWrap="wrap" gap="$xs">
        {options.map((opt) => (
          <TouchableOpacity key={opt.value} onPress={() => onChange(opt.value)}>
            <XStack
              backgroundColor={selected === opt.value ? '$blue9' : '$gray3'}
              paddingHorizontal="$sm"
              paddingVertical="$xs"
              borderRadius="$4"
              borderWidth={1}
              borderColor={selected === opt.value ? '$blue9' : '$gray4'}
            >
              <Text
                fontSize="$2"
                fontWeight={selected === opt.value ? '600' : '400'}
                color={selected === opt.value ? 'white' : '$gray11'}
              >
                {opt.label}
              </Text>
            </XStack>
          </TouchableOpacity>
        ))}
      </XStack>
    </YStack>
  )
}

export function CreateIntentionScreen({ onSuccess }: CreateIntentionScreenProps) {
  const { isSpicy } = useMode()
  const { create, isCreating } = useIntentions()

  const [seeking, setSeeking] = useState<string>('CASUAL')
  const [genderPreferences, setGenderPreferences] = useState<string[]>([])
  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')
  const [distanceRadiusKm, setDistanceRadiusKm] = useState('')
  const [orientationMatch, setOrientationMatch] = useState<string[]>([])
  const [availability, setAvailability] = useState<string>('FLEXIBLE')
  const [relationshipStructure, setRelationshipStructure] = useState<string>('')
  const [kinkTagIds, setKinkTagIds] = useState<string[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (genderPreferences.length === 0) {
      newErrors.genderPreferences = 'Select at least one gender'
    }

    if (ageMin && ageMax && parseInt(ageMin) > parseInt(ageMax)) {
      newErrors.age = 'Min age cannot be greater than max age'
    }

    if (distanceRadiusKm && parseInt(distanceRadiusKm) <= 0) {
      newErrors.distance = 'Distance must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await create({
        seeking,
        genderPreferences,
        ageMin: ageMin ? parseInt(ageMin) : undefined,
        ageMax: ageMax ? parseInt(ageMax) : undefined,
        distanceRadiusKm: distanceRadiusKm ? parseInt(distanceRadiusKm) : undefined,
        orientationMatch: orientationMatch.length > 0 ? orientationMatch : undefined,
        availability,
        relationshipStructure: relationshipStructure || undefined,
        kinkTagIds: kinkTagIds.length > 0 ? kinkTagIds : undefined,
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error creating intention:', error)
    }
  }

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack padding="$md" gap="$md" paddingBottom="$8">
        <Text fontSize="$6" fontWeight="600" color="$text">
          Skapa ny intention
        </Text>

        <SingleSelect
          options={SEEKING_OPTIONS}
          selected={seeking}
          onChange={setSeeking}
          label="Vad letar du efter?"
        />

        <MultiSelect
          options={GENDER_OPTIONS}
          selected={genderPreferences}
          onChange={setGenderPreferences}
          label="Könsidentiteter"
        />
        {errors.genderPreferences && (
          <Text color="$red400" fontSize="$2">
            {errors.genderPreferences}
          </Text>
        )}

        <YStack gap="$xs">
          <Text color="$gray11" fontSize="$2" fontWeight="600">
            Ålder
          </Text>
          <XStack gap="$xs" alignItems="center">
            <Input
              flex={1}
              placeholder="Min"
              value={ageMin}
              onChangeText={setAgeMin}
              keyboardType="number-pad"
              size="$3"
              borderWidth={1}
              borderColor={errors.age ? '$red400' : '$borderColor'}
              borderRadius="$3"
            />
            <Text color="$gray11">-</Text>
            <Input
              flex={1}
              placeholder="Max"
              value={ageMax}
              onChangeText={setAgeMax}
              keyboardType="number-pad"
              size="$3"
              borderWidth={1}
              borderColor={errors.age ? '$red400' : '$borderColor'}
              borderRadius="$3"
            />
          </XStack>
          {errors.age && (
            <Text color="$red400" fontSize="$2">
              {errors.age}
            </Text>
          )}
        </YStack>

        <YStack gap="$xs">
          <Text color="$gray11" fontSize="$2" fontWeight="600">
            Sökradie (km)
          </Text>
          <Input
            placeholder="t.ex. 50"
            value={distanceRadiusKm}
            onChangeText={setDistanceRadiusKm}
            keyboardType="number-pad"
            size="$3"
            borderWidth={1}
            borderColor={errors.distance ? '$red400' : '$borderColor'}
            borderRadius="$3"
          />
          {errors.distance && (
            <Text color="$red400" fontSize="$2">
              {errors.distance}
            </Text>
          )}
        </YStack>

        <MultiSelect
          options={ORIENTATION_OPTIONS}
          selected={orientationMatch}
          onChange={setOrientationMatch}
          label="Sexuell läggning (valfritt)"
        />

        <SingleSelect
          options={AVAILABILITY_OPTIONS}
          selected={availability}
          onChange={setAvailability}
          label="Tillgänglighet"
        />

        <SingleSelect
          options={RELATIONSHIP_OPTIONS}
          selected={relationshipStructure}
          onChange={setRelationshipStructure}
          label="Relationstyp (valfritt)"
        />

        {isSpicy && (
          <MultiSelect
            options={KINK_TAGS.map((tag) => ({ label: tag, value: tag }))}
            selected={kinkTagIds}
            onChange={setKinkTagIds}
            label="BDSM-intressen (valfritt)"
          />
        )}

        <Button
          size="$4"
          backgroundColor="$blue9"
          color="white"
          borderRadius="$4"
          onPress={handleSubmit}
          disabled={isCreating}
        >
          {isCreating ? <Spinner color="white" /> : <Text fontWeight="600">Skapa intention</Text>}
        </Button>
      </YStack>
    </ScrollView>
  )
}
