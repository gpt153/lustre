'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { YStack, XStack, Text, Button, Input, Spinner, ScrollView } from 'tamagui'
import { trpc } from '@lustre/api'

const GENDERS = ['MAN', 'WOMAN', 'NON_BINARY', 'TRANS_MAN', 'TRANS_WOMAN', 'GENDERQUEER', 'GENDERFLUID', 'AGENDER', 'BIGENDER', 'TWO_SPIRIT', 'OTHER']
const ORIENTATIONS = ['STRAIGHT', 'GAY', 'LESBIAN', 'BISEXUAL', 'PANSEXUAL', 'QUEER', 'ASEXUAL', 'DEMISEXUAL', 'OTHER']
const RELATIONSHIP_TYPES = ['SINGLE', 'PARTNERED', 'MARRIED', 'OPEN_RELATIONSHIP', 'POLYAMOROUS', 'OTHER']
const AVAILABILITIES = ['WEEKDAYS', 'WEEKENDS', 'FLEXIBLE']
const SEEKING_TYPES = ['CASUAL', 'RELATIONSHIP', 'FRIENDSHIP', 'EXPLORATION', 'EVENT', 'OTHER']

const GENDER_LABELS: Record<string, string> = {
  MAN: 'Man',
  WOMAN: 'Kvinna',
  NON_BINARY: 'Icke-binär',
  TRANS_MAN: 'Transperson (Man)',
  TRANS_WOMAN: 'Transperson (Kvinna)',
  GENDERQUEER: 'Genderqueer',
  GENDERFLUID: 'Genderfluid',
  AGENDER: 'Agender',
  BIGENDER: 'Bigender',
  TWO_SPIRIT: 'Two-Spirit',
  OTHER: 'Annat',
}

const ORIENTATION_LABELS: Record<string, string> = {
  STRAIGHT: 'Heterosexuell',
  GAY: 'Homosexuell',
  LESBIAN: 'Lesbisk',
  BISEXUAL: 'Bisexuell',
  PANSEXUAL: 'Pansexuell',
  QUEER: 'Queer',
  ASEXUAL: 'Asexuell',
  DEMISEXUAL: 'Demisexuell',
  OTHER: 'Annat',
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  SINGLE: 'Singel',
  PARTNERED: 'I relation',
  MARRIED: 'Gift',
  OPEN_RELATIONSHIP: 'Öppen relation',
  POLYAMOROUS: 'Polyamor',
  OTHER: 'Annat',
}

const AVAILABILITY_LABELS: Record<string, string> = {
  WEEKDAYS: 'Vardagar',
  WEEKENDS: 'Helger',
  FLEXIBLE: 'Flexibel',
}

const SEEKING_LABELS: Record<string, string> = {
  CASUAL: 'Casual',
  RELATIONSHIP: 'Relation',
  FRIENDSHIP: 'Vänskap',
  EXPLORATION: 'Utforska',
  EVENT: 'Event',
  OTHER: 'Annat',
}

export default function EditIntentionPage() {
  const router = useRouter()
  const params = useParams()
  const intentionId = params.intentionId as string

  const updateMutation = trpc.intention.update.useMutation()
  const { data: intention, isLoading: intentionLoading } = trpc.intention.get.useQuery({
    id: intentionId,
  })
  const { data: modeData, isLoading: modeLoading } = trpc.settings.getMode.useQuery()
  const { data: kinkTags, isLoading: tagsLoading } = trpc.kink.list.useQuery()

  const [formData, setFormData] = useState({
    seeking: 'CASUAL',
    genderPreferences: ['WOMAN'],
    ageMin: 21,
    ageMax: 40,
    distanceRadiusKm: 25,
    orientationMatch: ['STRAIGHT'],
    availability: 'FLEXIBLE',
    relationshipStructure: undefined as string | undefined,
    kinkTagIds: [] as string[],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (intention) {
      setFormData({
        seeking: intention.seeking,
        genderPreferences: intention.genderPreferences,
        ageMin: intention.ageMin,
        ageMax: intention.ageMax,
        distanceRadiusKm: intention.distanceRadiusKm,
        orientationMatch: intention.orientationMatch,
        availability: intention.availability,
        relationshipStructure: intention.relationshipStructure || undefined,
        kinkTagIds: intention.kinkTags?.map((kt) => kt.kinkTagId) || [],
      })
    }
  }, [intention])

  const isSpicy = modeData?.mode === 'spicy'

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.genderPreferences.length === 0) {
      newErrors.genderPreferences = 'Välj minst ett kön'
    }

    if (formData.orientationMatch.length === 0) {
      newErrors.orientationMatch = 'Välj minst en orientering'
    }

    if (formData.ageMin >= formData.ageMax) {
      newErrors.ageRange = 'Minåldern måste vara lägre än maxåldern'
    }

    if (formData.distanceRadiusKm < 1 || formData.distanceRadiusKm > 500) {
      newErrors.distanceRadiusKm = 'Sökradien måste vara mellan 1 och 500 km'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await updateMutation.mutateAsync({
        id: intentionId,
        ...formData,
        relationshipStructure: formData.relationshipStructure || undefined,
        kinkTagIds: formData.kinkTagIds.length > 0 ? formData.kinkTagIds : undefined,
      })

      router.push(`/discover/intentions/${intentionId}`)
    } catch (error: any) {
      console.error('Error updating intention:', error)
      if (error.message) {
        setErrors({ submit: error.message })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleGender = (gender: string) => {
    setFormData((prev) => ({
      ...prev,
      genderPreferences: prev.genderPreferences.includes(gender)
        ? prev.genderPreferences.filter((g) => g !== gender)
        : [...prev.genderPreferences, gender],
    }))
  }

  const toggleOrientation = (orientation: string) => {
    setFormData((prev) => ({
      ...prev,
      orientationMatch: prev.orientationMatch.includes(orientation)
        ? prev.orientationMatch.filter((o) => o !== orientation)
        : [...prev.orientationMatch, orientation],
    }))
  }

  const toggleKinkTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      kinkTagIds: prev.kinkTagIds.includes(tagId)
        ? prev.kinkTagIds.filter((id) => id !== tagId)
        : [...prev.kinkTagIds, tagId],
    }))
  }

  if (intentionLoading || modeLoading || tagsLoading) {
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

  return (
    <ScrollView>
      <YStack padding="$4" maxWidth={800} marginHorizontal="auto" gap="$4">
        <YStack gap="$2" marginBottom="$4">
          <Text fontSize="$6" fontWeight="700" color="#2C2421">
            Redigera intention
          </Text>
          <Text fontSize="$3" color="#8B7E74">
            Uppdatera dina preferenser och sökkriterier
          </Text>
        </YStack>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <YStack gap="$6">
            <YStack gap="$3" backgroundColor="#FDF8F3" padding="$4" borderRadius={12} borderColor="#E0D5C8" borderWidth={1}>
              <Text fontSize="$4" fontWeight="600" color="#2C2421">
                Vad söker du?
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {SEEKING_TYPES.map((seeking) => (
                  <Button
                    key={seeking}
                    size="$3"
                    backgroundColor={formData.seeking === seeking ? '#B87333' : 'transparent'}
                    borderWidth={2}
                    borderColor={formData.seeking === seeking ? '#B87333' : '#E0D5C8'}
                    borderRadius={8}
                    onPress={() => setFormData((prev) => ({ ...prev, seeking }))}
                  >
                    <Text
                      color={formData.seeking === seeking ? 'white' : '#8B7E74'}
                      fontWeight="600"
                    >
                      {SEEKING_LABELS[seeking]}
                    </Text>
                  </Button>
                ))}
              </XStack>
            </YStack>

            <YStack gap="$3" backgroundColor="#FDF8F3" padding="$4" borderRadius={12} borderColor="#E0D5C8" borderWidth={1}>
              <Text fontSize="$4" fontWeight="600" color="#2C2421">
                Könspreferenser
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {GENDERS.map((gender) => (
                  <Button
                    key={gender}
                    size="$3"
                    backgroundColor={formData.genderPreferences.includes(gender) ? '#B87333' : 'transparent'}
                    borderWidth={2}
                    borderColor={formData.genderPreferences.includes(gender) ? '#B87333' : '#E0D5C8'}
                    borderRadius={8}
                    onPress={() => toggleGender(gender)}
                  >
                    <Text
                      color={formData.genderPreferences.includes(gender) ? 'white' : '#8B7E74'}
                      fontWeight="600"
                      fontSize="$2"
                    >
                      {GENDER_LABELS[gender]}
                    </Text>
                  </Button>
                ))}
              </XStack>
              {errors.genderPreferences && (
                <Text fontSize="$2" color="#C97A7A">
                  {errors.genderPreferences}
                </Text>
              )}
            </YStack>

            <YStack gap="$3" backgroundColor="#FDF8F3" padding="$4" borderRadius={12} borderColor="#E0D5C8" borderWidth={1}>
              <Text fontSize="$4" fontWeight="600" color="#2C2421">
                Orienteringspreferenser
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {ORIENTATIONS.map((orientation) => (
                  <Button
                    key={orientation}
                    size="$3"
                    backgroundColor={formData.orientationMatch.includes(orientation) ? '#B87333' : 'transparent'}
                    borderWidth={2}
                    borderColor={formData.orientationMatch.includes(orientation) ? '#B87333' : '#E0D5C8'}
                    borderRadius={8}
                    onPress={() => toggleOrientation(orientation)}
                  >
                    <Text
                      color={formData.orientationMatch.includes(orientation) ? 'white' : '#8B7E74'}
                      fontWeight="600"
                      fontSize="$2"
                    >
                      {ORIENTATION_LABELS[orientation]}
                    </Text>
                  </Button>
                ))}
              </XStack>
              {errors.orientationMatch && (
                <Text fontSize="$2" color="#C97A7A">
                  {errors.orientationMatch}
                </Text>
              )}
            </YStack>

            <YStack gap="$3" backgroundColor="#FDF8F3" padding="$4" borderRadius={12} borderColor="#E0D5C8" borderWidth={1}>
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color="#2C2421">
                  Åldersintervall: {formData.ageMin} - {formData.ageMax} år
                </Text>
                {errors.ageRange && (
                  <Text fontSize="$2" color="#C97A7A">
                    {errors.ageRange}
                  </Text>
                )}
              </YStack>
              <YStack gap="$2">
                <Text fontSize="$3" color="#8B7E74">
                  Minimiålder: {formData.ageMin}
                </Text>
                <Input
                  type="range"
                  min={18}
                  max={99}
                  value={String(formData.ageMin)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ageMin: parseInt(e.currentTarget.value),
                    }))
                  }
                />
              </YStack>
              <YStack gap="$2">
                <Text fontSize="$3" color="#8B7E74">
                  Maximiålder: {formData.ageMax}
                </Text>
                <Input
                  type="range"
                  min={18}
                  max={99}
                  value={String(formData.ageMax)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ageMax: parseInt(e.currentTarget.value),
                    }))
                  }
                />
              </YStack>
            </YStack>

            <YStack gap="$3" backgroundColor="#FDF8F3" padding="$4" borderRadius={12} borderColor="#E0D5C8" borderWidth={1}>
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color="#2C2421">
                  Sökradie: {formData.distanceRadiusKm} km
                </Text>
                {errors.distanceRadiusKm && (
                  <Text fontSize="$2" color="#C97A7A">
                    {errors.distanceRadiusKm}
                  </Text>
                )}
              </YStack>
              <Input
                type="range"
                min={1}
                max={500}
                value={String(formData.distanceRadiusKm)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    distanceRadiusKm: parseInt(e.currentTarget.value),
                  }))
                }
              />
            </YStack>

            <YStack gap="$3" backgroundColor="#FDF8F3" padding="$4" borderRadius={12} borderColor="#E0D5C8" borderWidth={1}>
              <Text fontSize="$4" fontWeight="600" color="#2C2421">
                Tillgänglighet
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {AVAILABILITIES.map((availability) => (
                  <Button
                    key={availability}
                    size="$3"
                    backgroundColor={formData.availability === availability ? '#B87333' : 'transparent'}
                    borderWidth={2}
                    borderColor={formData.availability === availability ? '#B87333' : '#E0D5C8'}
                    borderRadius={8}
                    onPress={() => setFormData((prev) => ({ ...prev, availability }))}
                  >
                    <Text
                      color={formData.availability === availability ? 'white' : '#8B7E74'}
                      fontWeight="600"
                      fontSize="$2"
                    >
                      {AVAILABILITY_LABELS[availability]}
                    </Text>
                  </Button>
                ))}
              </XStack>
            </YStack>

            <YStack gap="$3" backgroundColor="#FDF8F3" padding="$4" borderRadius={12} borderColor="#E0D5C8" borderWidth={1}>
              <Text fontSize="$4" fontWeight="600" color="#2C2421">
                Relationstyp (valfritt)
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {RELATIONSHIP_TYPES.map((relType) => (
                  <Button
                    key={relType}
                    size="$3"
                    backgroundColor={formData.relationshipStructure === relType ? '#B87333' : 'transparent'}
                    borderWidth={2}
                    borderColor={formData.relationshipStructure === relType ? '#B87333' : '#E0D5C8'}
                    borderRadius={8}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        relationshipStructure: prev.relationshipStructure === relType ? undefined : relType,
                      }))
                    }
                  >
                    <Text
                      color={formData.relationshipStructure === relType ? 'white' : '#8B7E74'}
                      fontWeight="600"
                      fontSize="$2"
                    >
                      {RELATIONSHIP_LABELS[relType]}
                    </Text>
                  </Button>
                ))}
              </XStack>
            </YStack>

            {isSpicy && kinkTags && kinkTags.length > 0 && (
              <YStack gap="$3" backgroundColor="#FDF8F3" padding="$4" borderRadius={12} borderColor="#E0D5C8" borderWidth={1}>
                <XStack gap="$2" alignItems="center">
                  <Text fontSize="$4" fontWeight="600" color="#2C2421">
                    Kink-taggar (valfritt)
                  </Text>
                  <Text fontSize="$2" color="#D4A843" fontWeight="500">
                    🌶️ Spicy
                  </Text>
                </XStack>
                <XStack gap="$2" flexWrap="wrap">
                  {kinkTags.map((tag) => (
                    <Button
                      key={tag.id}
                      size="$2"
                      backgroundColor={formData.kinkTagIds.includes(tag.id) ? '#D4A843' : 'transparent'}
                      borderWidth={2}
                      borderColor={formData.kinkTagIds.includes(tag.id) ? '#D4A843' : '#E0D5C8'}
                      borderRadius={6}
                      onPress={() => toggleKinkTag(tag.id)}
                    >
                      <Text
                        color={formData.kinkTagIds.includes(tag.id) ? 'white' : '#8B7E74'}
                        fontWeight="500"
                        fontSize="$1"
                      >
                        {tag.name}
                      </Text>
                    </Button>
                  ))}
                </XStack>
              </YStack>
            )}

            {errors.submit && (
              <YStack
                backgroundColor="#FEE2E2"
                borderColor="#FCA5A5"
                borderWidth={1}
                borderRadius={8}
                padding="$3"
              >
                <Text fontSize="$2" color="#DC2626" fontWeight="500">
                  {errors.submit}
                </Text>
              </YStack>
            )}

            <XStack gap="$3">
              <Button
                flex={1}
                backgroundColor="#B87333"
                borderRadius={8}
                paddingVertical="$3"
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text color="white" fontWeight="600">
                  {isSubmitting ? 'Sparar...' : 'Spara ändringar'}
                </Text>
              </Button>

              <Button
                flex={1}
                backgroundColor="transparent"
                borderWidth={2}
                borderColor="#8B7E74"
                borderRadius={8}
                paddingVertical="$3"
                onPress={() => router.back()}
                disabled={isSubmitting}
              >
                <Text color="#8B7E74" fontWeight="600">
                  Avbryt
                </Text>
              </Button>
            </XStack>
          </YStack>
        </form>
      </YStack>
    </ScrollView>
  )
}
