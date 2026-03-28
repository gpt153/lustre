import { useState } from 'react'
import { YStack, XStack, Text, H2, ScrollView } from 'tamagui'
import { CardBase, LustreButton, LustreInput } from '@lustre/ui'
import { PROMPT_OPTIONS } from '@lustre/api'
import { PromptPicker } from '../components/PromptPicker'
import { PromptEditor } from '../components/PromptEditor'

const GENDERS = ['MAN', 'WOMAN', 'NON_BINARY', 'TRANS_MAN', 'TRANS_WOMAN', 'GENDERQUEER', 'GENDERFLUID', 'AGENDER', 'BIGENDER', 'TWO_SPIRIT', 'OTHER']
const ORIENTATIONS = ['STRAIGHT', 'GAY', 'LESBIAN', 'BISEXUAL', 'PANSEXUAL', 'QUEER', 'ASEXUAL', 'DEMISEXUAL', 'OTHER']
const RELATIONSHIP_TYPES = ['SINGLE', 'PARTNERED', 'MARRIED', 'OPEN_RELATIONSHIP', 'POLYAMOROUS', 'OTHER']

interface Prompt {
  promptKey: string
  response: string
  order: number
}

interface ProfileEditProps {
  initialValues: {
    displayName: string
    bio: string | null
    age: number
    gender: string
    orientation: string
    relationshipType: string | null
    prompts?: Array<{ promptKey: string; response: string; order: number }>
  }
  onSave: (values: any) => void
  onSavePrompts?: (prompts: Array<{ promptKey: string; response: string; order: number }>) => void
  onCancel: () => void
  isSaving?: boolean
}

export function ProfileEditScreen({ initialValues, onSave, onSavePrompts, onCancel, isSaving = false }: ProfileEditProps) {
  const [displayName, setDisplayName] = useState(initialValues.displayName)
  const [bio, setBio] = useState(initialValues.bio || '')
  const [age, setAge] = useState(String(initialValues.age))
  const [gender, setGender] = useState(initialValues.gender)
  const [orientation, setOrientation] = useState(initialValues.orientation)
  const [relationshipType, setRelationshipType] = useState(initialValues.relationshipType || '')
  const [prompts, setPrompts] = useState<Prompt[]>(initialValues.prompts || [])
  const [showPromptPicker, setShowPromptPicker] = useState(false)

  const selectedPromptKeys = prompts.map(p => p.promptKey)
  const canAddMorePrompts = prompts.length < 3

  const handleSelectPrompt = (promptKey: string) => {
    const newPrompt: Prompt = {
      promptKey,
      response: '',
      order: prompts.length,
    }
    setPrompts([...prompts, newPrompt])
  }

  const handleChangePromptResponse = (index: number, text: string) => {
    const updated = [...prompts]
    updated[index].response = text
    setPrompts(updated)
  }

  const handleDeletePrompt = (index: number) => {
    const updated = prompts.filter((_, i) => i !== index)
    setPrompts(updated)
  }

  const handleSave = () => {
    onSave({
      displayName,
      bio: bio || null,
      age: parseInt(age, 10),
      gender,
      orientation,
      relationshipType: relationshipType || null,
    })
    if (onSavePrompts) {
      onSavePrompts(prompts)
    }
  }

  return (
    <>
      <ScrollView backgroundColor="#FDF8F3">
        <YStack padding="$md" gap="$md" paddingBottom="$8">
          <H2 color="#2C2421" fontFamily="$heading">
            Redigera profil
          </H2>

          <YStack gap="$xs">
            <Text color="#8B7E74" fontSize={14} fontFamily="$heading">
              Visningsnamn
            </Text>
            <LustreInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Visningsnamn"
            />
          </YStack>

          <YStack gap="$xs">
            <Text color="#8B7E74" fontSize={14} fontFamily="$heading">
              Ålder
            </Text>
            <LustreInput
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Din ålder"
            />
          </YStack>

          <YStack gap="$xs">
            <Text color="#8B7E74" fontSize={14} fontFamily="$heading">
              Kön
            </Text>
            <XStack flexWrap="wrap" gap="$xs">
              {GENDERS.map(g => (
                <LustreButton
                  key={g}
                  size="$2"
                  onPress={() => setGender(g)}
                  backgroundColor={gender === g ? '#B87333' : '#F5EDE4'}
                  color={gender === g ? '#FDF8F3' : '#2C2421'}
                  borderRadius={8}
                  paddingHorizontal="$xs"
                  paddingVertical="$xs"
                >
                  {g.replace(/_/g, ' ').toLowerCase()}
                </LustreButton>
              ))}
            </XStack>
          </YStack>

          <YStack gap="$xs">
            <Text color="#8B7E74" fontSize={14} fontFamily="$heading">
              Orientering
            </Text>
            <XStack flexWrap="wrap" gap="$xs">
              {ORIENTATIONS.map(o => (
                <LustreButton
                  key={o}
                  size="$2"
                  onPress={() => setOrientation(o)}
                  backgroundColor={orientation === o ? '#B87333' : '#F5EDE4'}
                  color={orientation === o ? '#FDF8F3' : '#2C2421'}
                  borderRadius={8}
                  paddingHorizontal="$xs"
                  paddingVertical="$xs"
                >
                  {o.replace(/_/g, ' ').toLowerCase()}
                </LustreButton>
              ))}
            </XStack>
          </YStack>

          <YStack gap="$xs">
            <Text color="#8B7E74" fontSize={14} fontFamily="$heading">
              Relationstyp
            </Text>
            <XStack flexWrap="wrap" gap="$xs">
              {RELATIONSHIP_TYPES.map(r => (
                <LustreButton
                  key={r}
                  size="$2"
                  onPress={() => setRelationshipType(r === relationshipType ? '' : r)}
                  backgroundColor={relationshipType === r ? '#B87333' : '#F5EDE4'}
                  color={relationshipType === r ? '#FDF8F3' : '#2C2421'}
                  borderRadius={8}
                  paddingHorizontal="$xs"
                  paddingVertical="$xs"
                >
                  {r.replace(/_/g, ' ').toLowerCase()}
                </LustreButton>
              ))}
            </XStack>
          </YStack>

          <YStack gap="$xs">
            <Text color="#8B7E74" fontSize={14} fontFamily="$heading">
              Frågor
            </Text>

            <YStack gap="$xs">
              {prompts.map((prompt, index) => (
                <PromptEditor
                  key={`${prompt.promptKey}-${index}`}
                  promptKey={prompt.promptKey}
                  promptLabel={PROMPT_OPTIONS[prompt.promptKey]}
                  response={prompt.response}
                  onChangeResponse={(text) => handleChangePromptResponse(index, text)}
                  onDelete={() => handleDeletePrompt(index)}
                />
              ))}

              {canAddMorePrompts && (
                <LustreButton
                  variant="secondary"
                  onPress={() => setShowPromptPicker(true)}
                  width="100%"
                  paddingVertical="$sm"
                >
                  + Lägg till fråga
                </LustreButton>
              )}
            </YStack>
          </YStack>

          <XStack gap="$sm" justifyContent="flex-end" paddingTop="$md">
            <LustreButton
              variant="secondary"
              onPress={onCancel}
              disabled={isSaving}
            >
              Avbryt
            </LustreButton>
            <LustreButton
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Sparar...' : 'Spara'}
            </LustreButton>
          </XStack>
        </YStack>
      </ScrollView>

      <PromptPicker
        visible={showPromptPicker}
        onSelect={handleSelectPrompt}
        onClose={() => setShowPromptPicker(false)}
        selectedKeys={selectedPromptKeys}
      />
    </>
  )
}
