import { useState } from 'react'
import { YStack, XStack, Text, H2, Button, Input, TextArea, ScrollView } from 'tamagui'

const GENDERS = ['MAN', 'WOMAN', 'NON_BINARY', 'TRANS_MAN', 'TRANS_WOMAN', 'GENDERQUEER', 'GENDERFLUID', 'AGENDER', 'BIGENDER', 'TWO_SPIRIT', 'OTHER']
const ORIENTATIONS = ['STRAIGHT', 'GAY', 'LESBIAN', 'BISEXUAL', 'PANSEXUAL', 'QUEER', 'ASEXUAL', 'DEMISEXUAL', 'OTHER']
const RELATIONSHIP_TYPES = ['SINGLE', 'PARTNERED', 'MARRIED', 'OPEN_RELATIONSHIP', 'POLYAMOROUS', 'OTHER']

interface ProfileEditProps {
  initialValues: {
    displayName: string
    bio: string | null
    age: number
    gender: string
    orientation: string
    relationshipType: string | null
  }
  onSave: (values: any) => void
  onCancel: () => void
  isSaving?: boolean
}

export function ProfileEditScreen({ initialValues, onSave, onCancel, isSaving = false }: ProfileEditProps) {
  const [displayName, setDisplayName] = useState(initialValues.displayName)
  const [bio, setBio] = useState(initialValues.bio || '')
  const [age, setAge] = useState(String(initialValues.age))
  const [gender, setGender] = useState(initialValues.gender)
  const [orientation, setOrientation] = useState(initialValues.orientation)
  const [relationshipType, setRelationshipType] = useState(initialValues.relationshipType || '')

  const handleSave = () => {
    onSave({
      displayName,
      bio: bio || null,
      age: parseInt(age, 10),
      gender,
      orientation,
      relationshipType: relationshipType || null,
    })
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$4">
        <H2 color="$text">Redigera profil</H2>

        <YStack gap="$1">
          <Text color="$textSecondary" fontSize="$2">Visningsnamn</Text>
          <Input value={displayName} onChangeText={setDisplayName} placeholder="Visningsnamn" />
        </YStack>

        <YStack gap="$1">
          <Text color="$textSecondary" fontSize="$2">Ålder</Text>
          <Input value={age} onChangeText={setAge} keyboardType="numeric" placeholder="Din ålder" />
        </YStack>

        <YStack gap="$1">
          <Text color="$textSecondary" fontSize="$2">Om mig</Text>
          <TextArea value={bio} onChangeText={setBio} placeholder="Berätta om dig själv..." numberOfLines={4} />
        </YStack>

        <YStack gap="$1">
          <Text color="$textSecondary" fontSize="$2">Kön</Text>
          <XStack flexWrap="wrap" gap="$1">
            {GENDERS.map(g => (
              <Button key={g} size="$2" onPress={() => setGender(g)}
                backgroundColor={gender === g ? '$primary' : '$backgroundHover'}
                color={gender === g ? 'white' : '$text'}>
                {g.replace(/_/g, ' ').toLowerCase()}
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$1">
          <Text color="$textSecondary" fontSize="$2">Orientering</Text>
          <XStack flexWrap="wrap" gap="$1">
            {ORIENTATIONS.map(o => (
              <Button key={o} size="$2" onPress={() => setOrientation(o)}
                backgroundColor={orientation === o ? '$primary' : '$backgroundHover'}
                color={orientation === o ? 'white' : '$text'}>
                {o.replace(/_/g, ' ').toLowerCase()}
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$1">
          <Text color="$textSecondary" fontSize="$2">Relationstyp</Text>
          <XStack flexWrap="wrap" gap="$1">
            {RELATIONSHIP_TYPES.map(r => (
              <Button key={r} size="$2" onPress={() => setRelationshipType(r === relationshipType ? '' : r)}
                backgroundColor={relationshipType === r ? '$primary' : '$backgroundHover'}
                color={relationshipType === r ? 'white' : '$text'}>
                {r.replace(/_/g, ' ').toLowerCase()}
              </Button>
            ))}
          </XStack>
        </YStack>

        <XStack gap="$2" justifyContent="flex-end">
          <Button onPress={onCancel} backgroundColor="$backgroundHover" color="$text">Avbryt</Button>
          <Button onPress={handleSave} disabled={isSaving} backgroundColor="$primary" color="white">
            {isSaving ? 'Sparar...' : 'Spara'}
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
