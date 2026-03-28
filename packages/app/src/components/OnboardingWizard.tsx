import { useState, useEffect } from 'react'
import { YStack, XStack, Text, H2, Button, Input, TextArea, ScrollView } from 'tamagui'

const GENDERS = ['MAN', 'WOMAN', 'NON_BINARY', 'TRANS_MAN', 'TRANS_WOMAN', 'GENDERQUEER', 'GENDERFLUID', 'AGENDER', 'BIGENDER', 'TWO_SPIRIT', 'OTHER']
const ORIENTATIONS = ['STRAIGHT', 'GAY', 'LESBIAN', 'BISEXUAL', 'PANSEXUAL', 'QUEER', 'ASEXUAL', 'DEMISEXUAL', 'OTHER']
const CONTENT_PREFS = ['SOFT', 'OPEN', 'EXPLICIT', 'NO_DICK_PICS']
const RELATIONSHIP_TYPES = ['SINGLE', 'PARTNERED', 'MARRIED', 'OPEN_RELATIONSHIP', 'POLYAMOROUS', 'OTHER']
const SEEKING_OPTIONS = ['FRIENDSHIP', 'DATING', 'CASUAL', 'RELATIONSHIP', 'PLAY_PARTNER', 'NETWORKING', 'OTHER']

const STEP_NAMES: Record<number, string> = {
  1: 'basics',
  2: 'identity',
  3: 'preferences',
  4: 'photos',
  5: 'bio',
}

interface OnboardingWizardProps {
  onComplete: (data: {
    displayName: string
    age: number
    gender: string
    orientation: string
    contentPreference: string
    relationshipType?: string
    bio?: string
    seeking: string[]
  }) => void
  isSubmitting?: boolean
  onStep?: (step: number, stepName: string) => void
}

export function OnboardingWizard({ onComplete, isSubmitting = false, onStep }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [orientation, setOrientation] = useState('')
  const [contentPreference, setContentPreference] = useState('')
  const [relationshipType, setRelationshipType] = useState('')
  const [bio, setBio] = useState('')
  const [seeking, setSeeking] = useState<string[]>([])

  useEffect(() => {
    if (onStep) {
      const stepName = STEP_NAMES[step]
      onStep(step, stepName)
    }
  }, [step, onStep])

  const toggleSeeking = (s: string) => {
    setSeeking(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const canProceed = () => {
    switch (step) {
      case 1: return displayName.length >= 2 && displayName.length <= 50 && parseInt(age) >= 18 && parseInt(age) <= 99
      case 2: return gender !== '' && orientation !== ''
      case 3: return contentPreference !== ''
      case 4: return true // Fotouppladding hanteras separat
      case 5: return true // Bio och letar efter är frivilliga
      default: return false
    }
  }

  const handleNext = () => {
    if (step < 5) setStep(step + 1)
    else {
      if (onStep) {
        onStep(6, 'complete')
      }
      onComplete({
        displayName,
        age: parseInt(age, 10),
        gender,
        orientation,
        contentPreference,
        relationshipType: relationshipType || undefined,
        bio: bio || undefined,
        seeking,
      })
    }
  }

  return (
    <ScrollView>
      <YStack padding="$md" gap="$md" minHeight="100%">
        <XStack justifyContent="center" gap="$xs" marginBottom="$2">
          {[1,2,3,4,5].map(s => (
            <YStack key={s} width={40} height={4} borderRadius={2}
              backgroundColor={s <= step ? '$primary' : '$borderColor'} />
          ))}
        </XStack>

        {step === 1 && (
          <YStack gap="$md">
            <H2 color="$text">Välkommen!</H2>
            <Text color="$textSecondary">Låt oss sätta upp din profil.</Text>
            <YStack gap="$xs">
              <Text color="$textSecondary" fontSize="$2">Visningsnamn</Text>
              <Input value={displayName} onChangeText={setDisplayName} placeholder="Välj ett visningsnamn" />
            </YStack>
            <YStack gap="$xs">
              <Text color="$textSecondary" fontSize="$2">Ålder</Text>
              <Input value={age} onChangeText={setAge} keyboardType="numeric" placeholder="Din ålder" />
            </YStack>
          </YStack>
        )}

        {step === 2 && (
          <YStack gap="$md">
            <H2 color="$text">Identitet</H2>
            <YStack gap="$xs">
              <Text color="$textSecondary" fontSize="$2">Kön</Text>
              <XStack flexWrap="wrap" gap="$xs">
                {GENDERS.map(g => (
                  <Button key={g} size="$2" onPress={() => setGender(g)}
                    backgroundColor={gender === g ? '$primary' : '$backgroundHover'}
                    color={gender === g ? 'white' : '$text'}>
                    {g.replace(/_/g, ' ').toLowerCase()}
                  </Button>
                ))}
              </XStack>
            </YStack>
            <YStack gap="$xs">
              <Text color="$textSecondary" fontSize="$2">Orientering</Text>
              <XStack flexWrap="wrap" gap="$xs">
                {ORIENTATIONS.map(o => (
                  <Button key={o} size="$2" onPress={() => setOrientation(o)}
                    backgroundColor={orientation === o ? '$primary' : '$backgroundHover'}
                    color={orientation === o ? 'white' : '$text'}>
                    {o.replace(/_/g, ' ').toLowerCase()}
                  </Button>
                ))}
              </XStack>
            </YStack>
          </YStack>
        )}

        {step === 3 && (
          <YStack gap="$md">
            <H2 color="$text">Preferenser</H2>
            <YStack gap="$xs">
              <Text color="$textSecondary" fontSize="$2">Innehållspreferens</Text>
              <XStack flexWrap="wrap" gap="$xs">
                {CONTENT_PREFS.map(c => (
                  <Button key={c} size="$2" onPress={() => setContentPreference(c)}
                    backgroundColor={contentPreference === c ? '$primary' : '$backgroundHover'}
                    color={contentPreference === c ? 'white' : '$text'}>
                    {c.replace(/_/g, ' ').toLowerCase()}
                  </Button>
                ))}
              </XStack>
            </YStack>
            <YStack gap="$xs">
              <Text color="$textSecondary" fontSize="$2">Relationstyp (frivilligt)</Text>
              <XStack flexWrap="wrap" gap="$xs">
                {RELATIONSHIP_TYPES.map(r => (
                  <Button key={r} size="$2" onPress={() => setRelationshipType(r === relationshipType ? '' : r)}
                    backgroundColor={relationshipType === r ? '$primary' : '$backgroundHover'}
                    color={relationshipType === r ? 'white' : '$text'}>
                    {r.replace(/_/g, ' ').toLowerCase()}
                  </Button>
                ))}
              </XStack>
            </YStack>
          </YStack>
        )}

        {step === 4 && (
          <YStack gap="$md">
            <H2 color="$text">Foton</H2>
            <Text color="$textSecondary">Fotouppladding är tillgänglig efter att profilen skapats. Du kan lägga till foton från din profilsida.</Text>
          </YStack>
        )}

        {step === 5 && (
          <YStack gap="$md">
            <H2 color="$text">Nästan klart!</H2>
            <YStack gap="$xs">
              <Text color="$textSecondary" fontSize="$2">Om mig (frivilligt)</Text>
              <TextArea value={bio} onChangeText={setBio} placeholder="Berätta om dig själv..." numberOfLines={4} />
            </YStack>
            <YStack gap="$xs">
              <Text color="$textSecondary" fontSize="$2">Letar efter (frivilligt)</Text>
              <XStack flexWrap="wrap" gap="$xs">
                {SEEKING_OPTIONS.map(s => (
                  <Button key={s} size="$2" onPress={() => toggleSeeking(s)}
                    backgroundColor={seeking.includes(s) ? '$primary' : '$backgroundHover'}
                    color={seeking.includes(s) ? 'white' : '$text'}>
                    {s.replace(/_/g, ' ').toLowerCase()}
                  </Button>
                ))}
              </XStack>
            </YStack>
          </YStack>
        )}

        <XStack justifyContent="space-between" marginTop="auto" paddingTop="$4">
          {step > 1 ? (
            <Button onPress={() => setStep(step - 1)} backgroundColor="$backgroundHover" color="$text">Tillbaka</Button>
          ) : <YStack />}
          <Button onPress={handleNext} disabled={!canProceed() || isSubmitting}
            backgroundColor="$primary" color="white">
            {step === 5 ? (isSubmitting ? 'Skapar...' : 'Skapa profil') : 'Nästa'}
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
