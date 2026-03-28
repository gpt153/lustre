import { useState } from 'react'
import { ScrollView } from 'react-native'
import { YStack, XStack, Text, Button, Spinner, Input } from 'tamagui'
import { useCreateCampaign, useUpdateTargeting, useAddCreative } from '../hooks/useAds'

type AdFormat = 'FEED' | 'STORY' | 'EVENT_SPONSOR'
type BillingModel = 'CPM' | 'CPC'

const FORMAT_LABELS: Record<AdFormat, string> = {
  FEED: 'Flöde',
  STORY: 'Story',
  EVENT_SPONSOR: 'Evenemangs­sponsor',
}

const BILLING_LABELS: Record<BillingModel, string> = {
  CPM: 'CPM (per 1000 visningar)',
  CPC: 'CPC (per klick)',
}

const GENDER_OPTIONS = [
  { value: 'MAN', label: 'Man' },
  { value: 'WOMAN', label: 'Kvinna' },
  { value: 'NON_BINARY', label: 'Icke-binär' },
  { value: 'TRANS_MAN', label: 'Transman' },
  { value: 'TRANS_WOMAN', label: 'Transkvinna' },
  { value: 'GENDERQUEER', label: 'Genderqueer' },
  { value: 'GENDERFLUID', label: 'Genderfluid' },
  { value: 'AGENDER', label: 'Agender' },
  { value: 'BIGENDER', label: 'Bigender' },
  { value: 'TWO_SPIRIT', label: 'Two Spirit' },
  { value: 'OTHER', label: 'Annat' },
]

const ORIENTATION_OPTIONS = [
  { value: 'STRAIGHT', label: 'Heterosexuell' },
  { value: 'GAY', label: 'Gay' },
  { value: 'LESBIAN', label: 'Lesbisk' },
  { value: 'BISEXUAL', label: 'Bisexuell' },
  { value: 'PANSEXUAL', label: 'Pansexuell' },
  { value: 'QUEER', label: 'Queer' },
  { value: 'ASEXUAL', label: 'Asexuell' },
  { value: 'DEMISEXUAL', label: 'Demisexuell' },
  { value: 'OTHER', label: 'Annat' },
]

const RELATIONSHIP_OPTIONS = [
  { value: 'SINGLE', label: 'Singel' },
  { value: 'PARTNERED', label: 'I relation' },
  { value: 'MARRIED', label: 'Gift' },
  { value: 'OPEN_RELATIONSHIP', label: 'Öppen relation' },
  { value: 'POLYAMOROUS', label: 'Polyamorös' },
  { value: 'OTHER', label: 'Annat' },
]

function SelectOption<T extends string>({
  value,
  selected,
  label,
  onToggle,
}: {
  value: T
  selected: boolean
  label: string
  onToggle: (value: T) => void
}) {
  return (
    <Button
      size="$3"
      borderRadius="$10"
      borderWidth={1}
      borderColor={selected ? '$primary' : '$borderColor'}
      backgroundColor={selected ? '$primary' : '$background'}
      onPress={() => onToggle(value)}
    >
      <Text
        fontSize="$2"
        color={selected ? 'white' : '$textSecondary'}
        fontWeight={selected ? '700' : '400'}
      >
        {label}
      </Text>
    </Button>
  )
}

interface AdCreateScreenProps {
  onSuccess: (campaignId: string) => void
  onCancel: () => void
}

export function AdCreateScreen({ onSuccess, onCancel }: AdCreateScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [campaignId, setCampaignId] = useState<string | null>(null)

  // Step 1 fields
  const [name, setName] = useState('')
  const [format, setFormat] = useState<AdFormat>('FEED')
  const [billingModel, setBillingModel] = useState<BillingModel>('CPM')
  const [dailyBudget, setDailyBudget] = useState('')
  const [totalBudget, setTotalBudget] = useState('')

  // Step 2 fields
  const [ageMin, setAgeMin] = useState(18)
  const [ageMax, setAgeMax] = useState(65)
  const [genders, setGenders] = useState<string[]>([])
  const [orientations, setOrientations] = useState<string[]>([])
  const [relationshipTypes, setRelationshipTypes] = useState<string[]>([])

  // Step 3 fields
  const [headline, setHeadline] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')

  const [error, setError] = useState<string | null>(null)

  const createCampaign = useCreateCampaign()
  const updateTargeting = useUpdateTargeting()
  const addCreative = useAddCreative()

  function toggleItem(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  async function handleStep1Next() {
    setError(null)
    const daily = parseFloat(dailyBudget)
    if (!name.trim()) {
      setError('Ange ett kampanjnamn')
      return
    }
    if (isNaN(daily) || daily < 100) {
      setError('Daglig budget måste vara minst 100 SEK')
      return
    }

    const total = totalBudget ? parseFloat(totalBudget) : undefined
    if (total !== undefined && isNaN(total)) {
      setError('Ogiltig totalbudget')
      return
    }

    createCampaign.mutate(
      {
        name: name.trim(),
        format,
        billingModel,
        dailyBudgetSEK: daily,
        totalBudgetSEK: total,
      },
      {
        onSuccess: (campaign) => {
          setCampaignId(campaign.id)
          setStep(2)
        },
        onError: (err) => {
          setError(err.message)
        },
      },
    )
  }

  async function handleStep2Save() {
    if (!campaignId) return
    setError(null)

    updateTargeting.mutate(
      {
        campaignId,
        ageMin,
        ageMax,
        genders: genders.length > 0 ? (genders as any) : undefined,
        orientations: orientations.length > 0 ? (orientations as any) : undefined,
        relationshipTypes: relationshipTypes.length > 0 ? (relationshipTypes as any) : undefined,
      },
      {
        onSuccess: () => {
          setStep(3)
        },
        onError: (err) => {
          setError(err.message)
        },
      },
    )
  }

  async function handleStep3Add() {
    if (!campaignId) return
    setError(null)

    if (!headline.trim()) {
      setError('Rubrik krävs')
      return
    }
    if (!ctaUrl.trim()) {
      setError('Länk (CTA) krävs')
      return
    }

    addCreative.mutate(
      {
        campaignId,
        headline: headline.trim(),
        body: body.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        ctaUrl: ctaUrl.trim(),
      },
      {
        onSuccess: () => {
          onSuccess(campaignId)
        },
        onError: (err) => {
          setError(err.message)
        },
      },
    )
  }

  const stepTitles = ['Kampanjinfo', 'Inriktning', 'Annons']

  return (
    <YStack flex={1}>
      {/* Step indicator */}
      <XStack padding="$md" gap="$xs" alignItems="center">
        {stepTitles.map((title, index) => {
          const stepNum = (index + 1) as 1 | 2 | 3
          const isActive = step === stepNum
          const isDone = step > stepNum
          return (
            <XStack key={stepNum} flex={1} alignItems="center" gap="$xs">
              <YStack
                width={28}
                height={28}
                borderRadius={14}
                backgroundColor={isActive || isDone ? '$primary' : '$backgroundHover'}
                alignItems="center"
                justifyContent="center"
              >
                <Text color={isActive || isDone ? 'white' : '$textSecondary'} fontSize="$2" fontWeight="700">
                  {stepNum}
                </Text>
              </YStack>
              <Text
                fontSize="$2"
                color={isActive ? '$text' : '$textSecondary'}
                fontWeight={isActive ? '700' : '400'}
                flex={1}
              >
                {title}
              </Text>
            </XStack>
          )
        })}
      </XStack>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack padding="$md" gap="$md" flex={1}>
          {/* Step 1: Campaign info */}
          {step === 1 && (
            <YStack gap="$md">
              <Text fontSize="$5" fontWeight="700" color="$text">
                Kampanjinformation
              </Text>

              <YStack gap="$xs">
                <Text fontSize="$3" color="$textSecondary" fontWeight="600">
                  Kampanjnamn
                </Text>
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Sommarkampanj 2026"
                  borderRadius="$3"
                />
              </YStack>

              <YStack gap="$xs">
                <Text fontSize="$3" color="$textSecondary" fontWeight="600">
                  Format
                </Text>
                <XStack gap="$xs" flexWrap="wrap">
                  {(Object.keys(FORMAT_LABELS) as AdFormat[]).map((f) => (
                    <SelectOption
                      key={f}
                      value={f}
                      selected={format === f}
                      label={FORMAT_LABELS[f]}
                      onToggle={() => setFormat(f)}
                    />
                  ))}
                </XStack>
              </YStack>

              <YStack gap="$xs">
                <Text fontSize="$3" color="$textSecondary" fontWeight="600">
                  Betalningsmodell
                </Text>
                <XStack gap="$xs" flexWrap="wrap">
                  {(Object.keys(BILLING_LABELS) as BillingModel[]).map((b) => (
                    <SelectOption
                      key={b}
                      value={b}
                      selected={billingModel === b}
                      label={BILLING_LABELS[b]}
                      onToggle={() => setBillingModel(b)}
                    />
                  ))}
                </XStack>
              </YStack>

              <YStack gap="$xs">
                <Text fontSize="$3" color="$textSecondary" fontWeight="600">
                  Daglig budget (SEK, minst 100)
                </Text>
                <Input
                  value={dailyBudget}
                  onChangeText={setDailyBudget}
                  placeholder="500"
                  keyboardType="numeric"
                  borderRadius="$3"
                />
              </YStack>

              <YStack gap="$xs">
                <Text fontSize="$3" color="$textSecondary" fontWeight="600">
                  Totalbudget (SEK, valfritt)
                </Text>
                <Input
                  value={totalBudget}
                  onChangeText={setTotalBudget}
                  placeholder="5000"
                  keyboardType="numeric"
                  borderRadius="$3"
                />
              </YStack>
            </YStack>
          )}

          {/* Step 2: Targeting */}
          {step === 2 && (
            <YStack gap="$md">
              <Text fontSize="$5" fontWeight="700" color="$text">
                Inriktning
              </Text>

              <YStack gap="$sm">
                <Text fontSize="$3" color="$textSecondary" fontWeight="600">
                  Åldersintervall: {ageMin}–{ageMax} år
                </Text>
                <XStack gap="$sm" alignItems="center">
                  <Text fontSize="$2" color="$textSecondary" width={30}>
                    Min
                  </Text>
                  <YStack flex={1}>
                    <Input
                      value={String(ageMin)}
                      onChangeText={(v) => {
                        const n = parseInt(v, 10)
                        if (!isNaN(n) && n >= 18 && n <= ageMax) setAgeMin(n)
                      }}
                      keyboardType="numeric"
                      borderRadius="$3"
                    />
                  </YStack>
                  <Text fontSize="$2" color="$textSecondary" width={30}>
                    Max
                  </Text>
                  <YStack flex={1}>
                    <Input
                      value={String(ageMax)}
                      onChangeText={(v) => {
                        const n = parseInt(v, 10)
                        if (!isNaN(n) && n >= ageMin && n <= 99) setAgeMax(n)
                      }}
                      keyboardType="numeric"
                      borderRadius="$3"
                    />
                  </YStack>
                </XStack>
              </YStack>

              <YStack gap="$xs">
                <Text fontSize="$3" color="$textSecondary" fontWeight="600">
                  Kön (lämna tomt för alla)
                </Text>
                <XStack gap="$xs" flexWrap="wrap">
                  {GENDER_OPTIONS.map((opt) => (
                    <SelectOption
                      key={opt.value}
                      value={opt.value}
                      selected={genders.includes(opt.value)}
                      label={opt.label}
                      onToggle={(v) => toggleItem(genders, setGenders, v)}
                    />
                  ))}
                </XStack>
              </YStack>

              <YStack gap="$xs">
                <Text fontSize="$3" color="$textSecondary" fontWeight="600">
                  Sexuell läggning (lämna tomt för alla)
                </Text>
                <XStack gap="$xs" flexWrap="wrap">
                  {ORIENTATION_OPTIONS.map((opt) => (
                    <SelectOption
                      key={opt.value}
                      value={opt.value}
                      selected={orientations.includes(opt.value)}
                      label={opt.label}
                      onToggle={(v) => toggleItem(orientations, setOrientations, v)}
                    />
                  ))}
                </XStack>
              </YStack>

              <YStack gap="$xs">
                <Text fontSize="$3" color="$textSecondary" fontWeight="600">
                  Relationsstatus (lämna tomt för alla)
                </Text>
                <XStack gap="$xs" flexWrap="wrap">
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <SelectOption
                      key={opt.value}
                      value={opt.value}
                      selected={relationshipTypes.includes(opt.value)}
                      label={opt.label}
                      onToggle={(v) => toggleItem(relationshipTypes, setRelationshipTypes, v)}
                    />
                  ))}
                </XStack>
              </YStack>
            </YStack>
          )}

          {/* Step 3: Creative */}
          {step === 3 && (
            <YStack gap="$md">
              <Text fontSize="$5" fontWeight="700" color="$text">
                Annonsinnehåll
              </Text>

              <YStack gap="$xs">
                <XStack justifyContent="space-between">
                  <Text fontSize="$3" color="$textSecondary" fontWeight="600">
                    Rubrik (max 80 tecken)
                  </Text>
                  <Text fontSize="$2" color={headline.length > 80 ? '$red10' : '$textSecondary'}>
                    {headline.length}/80
                  </Text>
                </XStack>
                <Input
                  value={headline}
                  onChangeText={(v) => setHeadline(v.slice(0, 80))}
                  placeholder="Din catchy rubrik här"
                  borderRadius="$3"
                />
              </YStack>

              <YStack gap="$xs">
                <XStack justifyContent="space-between">
                  <Text fontSize="$3" color="$textSecondary" fontWeight="600">
                    Brödtext (max 200 tecken, valfritt)
                  </Text>
                  <Text fontSize="$2" color={body.length > 200 ? '$red10' : '$textSecondary'}>
                    {body.length}/200
                  </Text>
                </XStack>
                <Input
                  value={body}
                  onChangeText={(v) => setBody(v.slice(0, 200))}
                  placeholder="Beskriv ditt erbjudande..."
                  borderRadius="$3"
                  multiline
                  numberOfLines={3}
                />
              </YStack>

              <YStack gap="$xs">
                <Text fontSize="$3" color="$textSecondary" fontWeight="600">
                  Bild-URL (valfritt)
                </Text>
                <Input
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  placeholder="https://example.com/bild.jpg"
                  keyboardType="url"
                  autoCapitalize="none"
                  borderRadius="$3"
                />
              </YStack>

              <YStack gap="$xs">
                <Text fontSize="$3" color="$textSecondary" fontWeight="600">
                  Länk (CTA)
                </Text>
                <Input
                  value={ctaUrl}
                  onChangeText={setCtaUrl}
                  placeholder="https://example.com"
                  keyboardType="url"
                  autoCapitalize="none"
                  borderRadius="$3"
                />
              </YStack>
            </YStack>
          )}

          {error && (
            <YStack
              backgroundColor="$red2"
              borderRadius="$3"
              padding="$sm"
              borderWidth={1}
              borderColor="$red6"
            >
              <Text color="$red10" fontSize="$3">
                {error}
              </Text>
            </YStack>
          )}

          {/* Action buttons */}
          <XStack gap="$sm" justifyContent="flex-end" paddingBottom="$md">
            {step === 1 && (
              <Button
                size="$3"
                borderRadius="$3"
                variant="outlined"
                onPress={onCancel}
              >
                <Text color="$textSecondary">Avbryt</Text>
              </Button>
            )}

            {step === 2 && (
              <Button
                size="$3"
                borderRadius="$3"
                variant="outlined"
                onPress={() => setStep(1)}
              >
                <Text color="$textSecondary">Tillbaka</Text>
              </Button>
            )}

            {step === 3 && (
              <Button
                size="$3"
                borderRadius="$3"
                variant="outlined"
                onPress={() => setStep(2)}
              >
                <Text color="$textSecondary">Tillbaka</Text>
              </Button>
            )}

            {step === 1 && (
              <Button
                backgroundColor="$primary"
                borderRadius="$3"
                size="$3"
                onPress={handleStep1Next}
                disabled={createCampaign.isPending}
              >
                <XStack gap="$xs" alignItems="center">
                  {createCampaign.isPending && <Spinner color="white" size="small" />}
                  <Text color="white" fontWeight="700">
                    Nästa
                  </Text>
                </XStack>
              </Button>
            )}

            {step === 2 && (
              <Button
                backgroundColor="$primary"
                borderRadius="$3"
                size="$3"
                onPress={handleStep2Save}
                disabled={updateTargeting.isPending}
              >
                <XStack gap="$xs" alignItems="center">
                  {updateTargeting.isPending && <Spinner color="white" size="small" />}
                  <Text color="white" fontWeight="700">
                    Spara inriktning
                  </Text>
                </XStack>
              </Button>
            )}

            {step === 3 && (
              <Button
                backgroundColor="$primary"
                borderRadius="$3"
                size="$3"
                onPress={handleStep3Add}
                disabled={addCreative.isPending}
              >
                <XStack gap="$xs" alignItems="center">
                  {addCreative.isPending && <Spinner color="white" size="small" />}
                  <Text color="white" fontWeight="700">
                    Lägg till annons
                  </Text>
                </XStack>
              </Button>
            )}
          </XStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
