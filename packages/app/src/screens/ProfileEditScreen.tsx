import { useState, useCallback } from 'react'
import { Pressable, useWindowDimensions, StyleSheet, Switch } from 'react-native'
import { YStack, XStack, Text, ScrollView, Input, TextArea } from 'tamagui'
import { PolaroidCard } from '@lustre/ui'
import { PROMPT_OPTIONS } from '@lustre/api'
// Design tokens from @lustre/tokens (POLAROID_COLORS) are referenced via local COLORS constant
import { PromptPicker } from '../components/PromptPicker'
import { PromptEditor } from '../components/PromptEditor'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'

// ── Constants ───────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#894d0d',
  copper: '#B87333',
  warmWhite: '#FDF8F3',
  charcoal: '#2C2421',
  surfaceContainerHigh: '#f4e5e0',
  outlineVariant: '#d8c3b4',
  outline: '#857467',
  tertiaryFixed: '#ffdbd1',
  onTertiaryFixed: '#3b0900',
  surfaceContainerLow: '#fff1ec',
  onSurface: '#211a17',
}

const PHOTO_ROTATIONS = [-2, 3, -1, 2, -3, 1]
const MAX_PHOTOS = 6

const GENDERS = ['MAN', 'WOMAN', 'NON_BINARY', 'TRANS_MAN', 'TRANS_WOMAN', 'GENDERQUEER', 'GENDERFLUID', 'AGENDER', 'BIGENDER', 'TWO_SPIRIT', 'OTHER']
const ORIENTATIONS = ['STRAIGHT', 'GAY', 'LESBIAN', 'BISEXUAL', 'PANSEXUAL', 'QUEER', 'ASEXUAL', 'DEMISEXUAL', 'OTHER']
const RELATIONSHIP_TYPES = ['SINGLE', 'PARTNERED', 'MARRIED', 'OPEN_RELATIONSHIP', 'POLYAMOROUS', 'OTHER']

// ── Types ───────────────────────────────────────────────────────────────────────

interface Photo {
  id: string
  url: string
  thumbnailSmall: string | null
  thumbnailMedium: string | null
  thumbnailLarge: string | null
  position: number
  isPublic: boolean
}

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
    photos?: Photo[]
    kinkTags?: Array<{ kinkTag: { id: string; name: string } }>
    prompts?: Array<{ promptKey: string; response: string; order: number }>
  }
  onSave: (values: any) => void
  onSavePrompts?: (prompts: Array<{ promptKey: string; response: string; order: number }>) => void
  onCancel: () => void
  onUploadPhoto?: () => void
  onDeletePhoto?: (photoId: string) => void
  isSaving?: boolean
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      fontFamily="$heading"
      fontWeight="700"
      fontSize={12}
      color={COLORS.outline}
      textTransform="uppercase"
      letterSpacing={1.5}
      marginLeft={4}
    >
      {children}
    </Text>
  )
}

function PhotoSlotEmpty({ size, onPress }: { size: number; onPress?: () => void }) {
  const height = size / (88 / 107)
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Lagg till foto"
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.emptySlot,
        {
          width: size,
          height,
          opacity: pressed ? 0.7 : 1,
          backgroundColor: pressed ? COLORS.surfaceContainerLow : 'rgba(255,241,236,0.3)',
        },
      ]}
    >
      <Text fontSize={28} fontWeight="300" color={COLORS.outlineVariant}>
        +
      </Text>
    </Pressable>
  )
}

function PolaroidPhotoCell({
  photo,
  cardWidth,
  rotation,
  onDelete,
}: {
  photo: Photo
  cardWidth: number
  rotation: number
  onDelete?: () => void
}) {
  const activeRotation = useSharedValue(rotation)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${activeRotation.value}deg` }],
  }))

  const handlePressIn = () => {
    activeRotation.value = withSpring(0, { damping: 25, stiffness: 200, mass: 0.8 })
  }

  const handlePressOut = () => {
    activeRotation.value = withSpring(rotation, { damping: 25, stiffness: 200, mass: 0.8 })
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={`Foto ${photo.position}`}
      >
        <PolaroidCard
          cardWidth={cardWidth}
          imageUrl={photo.thumbnailMedium || photo.url}
          rotation={0}
        />
        {onDelete && (
          <Pressable
            onPress={onDelete}
            style={styles.deleteButton}
            accessibilityLabel="Ta bort foto"
            accessibilityRole="button"
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Text style={styles.deleteIcon}>✕</Text>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  )
}

function InterestTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <XStack
      backgroundColor={COLORS.tertiaryFixed}
      paddingHorizontal={16}
      paddingVertical={8}
      borderRadius={9999}
      alignItems="center"
      gap={4}
    >
      <Text fontSize={14} fontWeight="500" color={COLORS.onTertiaryFixed}>
        {label}
      </Text>
      <Pressable
        onPress={onRemove}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        accessibilityLabel={`Ta bort ${label}`}
      >
        <Text fontSize={12} color={COLORS.onTertiaryFixed}>✕</Text>
      </Pressable>
    </XStack>
  )
}

function SettingsToggle({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string
  description: string
  value: boolean
  onValueChange: (v: boolean) => void
}) {
  return (
    <XStack alignItems="center" justifyContent="space-between" paddingVertical={8}>
      <YStack flex={1} marginRight={16}>
        <Text fontFamily="$heading" fontWeight="600" color={COLORS.onSurface} fontSize={16}>
          {label}
        </Text>
        <Text fontSize={14} color={COLORS.outline}>
          {description}
        </Text>
      </YStack>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#eedfda', true: COLORS.primary }}
        thumbColor="#ffffff"
      />
    </XStack>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────────

export function ProfileEditScreen({
  initialValues,
  onSave,
  onSavePrompts,
  onCancel,
  onUploadPhoto,
  onDeletePhoto,
  isSaving = false,
}: ProfileEditProps) {
  const { width: screenWidth } = useWindowDimensions()
  const [displayName, setDisplayName] = useState(initialValues.displayName)
  const [bio, setBio] = useState(initialValues.bio || '')
  const [age, setAge] = useState(String(initialValues.age))
  const [gender, setGender] = useState(initialValues.gender)
  const [orientation, setOrientation] = useState(initialValues.orientation)
  const [relationshipType, setRelationshipType] = useState(initialValues.relationshipType || '')
  const [prompts, setPrompts] = useState<Prompt[]>(initialValues.prompts || [])
  const [showPromptPicker, setShowPromptPicker] = useState(false)

  // Settings toggles
  const [showDistance, setShowDistance] = useState(true)
  const [showAge, setShowAge] = useState(true)
  const [notifications, setNotifications] = useState(true)

  const photos = initialValues.photos || []
  const interests = initialValues.kinkTags || []

  const selectedPromptKeys = prompts.map(p => p.promptKey)
  const canAddMorePrompts = prompts.length < 3

  // Photo grid dimensions: 3 columns with gaps
  const gridGap = 12
  const gridPadding = 24
  const photoCardWidth = (screenWidth - gridPadding * 2 - gridGap * 2) / 3

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

  // Build cells for the 3-column grid
  const renderPhotoGrid = useCallback(() => {
    const cells: React.ReactNode[] = []

    // Render existing photos
    for (let i = 0; i < MAX_PHOTOS; i++) {
      if (i < photos.length) {
        const photo = photos[i]
        cells.push(
          <PolaroidPhotoCell
            key={photo.id}
            photo={photo}
            cardWidth={photoCardWidth}
            rotation={PHOTO_ROTATIONS[i % PHOTO_ROTATIONS.length]}
            onDelete={onDeletePhoto ? () => onDeletePhoto(photo.id) : undefined}
          />
        )
      } else {
        cells.push(
          <PhotoSlotEmpty
            key={`empty-${i}`}
            size={photoCardWidth}
            onPress={onUploadPhoto}
          />
        )
      }
    }

    // Arrange in rows of 3
    const rows: React.ReactNode[] = []
    for (let row = 0; row < Math.ceil(cells.length / 3); row++) {
      rows.push(
        <XStack key={`row-${row}`} gap={gridGap} justifyContent="flex-start">
          {cells.slice(row * 3, row * 3 + 3)}
        </XStack>
      )
    }

    return rows
  }, [photos, photoCardWidth, onUploadPhoto, onDeletePhoto])

  return (
    <>
      {/* Header */}
      <XStack
        backgroundColor={COLORS.warmWhite}
        paddingHorizontal={24}
        height={64}
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={0}
        shadowColor="#2E1500"
        shadowOffset={{ width: 0, height: 8 }}
        shadowOpacity={0.08}
        shadowRadius={24}
        zIndex={50}
      >
        <XStack alignItems="center" gap={16}>
          <Pressable
            onPress={onCancel}
            accessibilityLabel="Tillbaka"
            accessibilityRole="button"
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}
          >
            <Text fontSize={24} color={COLORS.copper}>←</Text>
          </Pressable>
          <Text
            fontFamily="$heading"
            fontWeight="700"
            fontSize={18}
            letterSpacing={-0.3}
            color={COLORS.primary}
          >
            Redigera profil
          </Text>
        </XStack>
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          accessibilityLabel="Spara"
          accessibilityRole="button"
          style={({ pressed }) => ({
            opacity: isSaving ? 0.5 : pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
        >
          <Text
            fontFamily="$heading"
            fontWeight="700"
            fontSize={18}
            letterSpacing={-0.3}
            color={COLORS.copper}
          >
            {isSaving ? 'Sparar...' : 'Spara'}
          </Text>
        </Pressable>
      </XStack>

      <ScrollView backgroundColor={COLORS.warmWhite}>
        <YStack paddingHorizontal={gridPadding} paddingTop={24} paddingBottom={120} gap={48}>

          {/* ── Photo Grid Section ────────────────────────────────────────── */}
          <YStack gap={16}>
            <XStack justifyContent="space-between" alignItems="flex-end">
              <Text fontFamily="$heading" fontSize={24} fontWeight="700" color={COLORS.primary}>
                Ditt galleri
              </Text>
              <Text
                fontFamily="Caveat_400Regular"
                fontSize={18}
                color={COLORS.outline}
                fontStyle="italic"
              >
                spridda minnen
              </Text>
            </XStack>
            <YStack gap={gridGap}>
              {renderPhotoGrid()}
            </YStack>
            <Text fontSize={12} color="#9E8A7A" marginTop={4}>
              {photos.length}/{MAX_PHOTOS} foton
            </Text>
          </YStack>

          {/* ── Form Fields Section ───────────────────────────────────────── */}
          <YStack gap={24}>
            {/* Name */}
            <YStack gap={8}>
              <SectionLabel>Namn</SectionLabel>
              <Input
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Ditt visningsnamn"
                backgroundColor={COLORS.surfaceContainerHigh}
                borderWidth={0}
                borderRadius={16}
                paddingHorizontal={16}
                paddingVertical={12}
                fontFamily="$heading"
                color={COLORS.onSurface}
                fontSize={16}
                focusStyle={{
                  borderWidth: 1,
                  borderColor: COLORS.primary,
                  backgroundColor: '#ffffff',
                }}
              />
            </YStack>

            {/* Age */}
            <YStack gap={8}>
              <SectionLabel>Alder</SectionLabel>
              <Input
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="Din alder"
                backgroundColor={COLORS.surfaceContainerHigh}
                borderWidth={0}
                borderRadius={16}
                paddingHorizontal={16}
                paddingVertical={12}
                fontFamily="$body"
                color={COLORS.onSurface}
                fontSize={16}
                focusStyle={{
                  borderWidth: 1,
                  borderColor: COLORS.primary,
                  backgroundColor: '#ffffff',
                }}
              />
            </YStack>

            {/* Bio */}
            <YStack gap={8}>
              <SectionLabel>Bio</SectionLabel>
              <TextArea
                value={bio}
                onChangeText={setBio}
                placeholder="Beskriv dig sjalv..."
                numberOfLines={3}
                backgroundColor={COLORS.surfaceContainerHigh}
                borderWidth={0}
                borderRadius={16}
                paddingHorizontal={16}
                paddingVertical={12}
                fontFamily="$body"
                color={COLORS.onSurface}
                fontSize={16}
                focusStyle={{
                  borderWidth: 1,
                  borderColor: COLORS.primary,
                  backgroundColor: '#ffffff',
                }}
              />
            </YStack>

            {/* Interests / Kink Tags */}
            {interests.length > 0 && (
              <YStack gap={8}>
                <SectionLabel>Intressen</SectionLabel>
                <XStack flexWrap="wrap" gap={8}>
                  {interests.map((tag) => (
                    <InterestTag
                      key={tag.kinkTag.id}
                      label={tag.kinkTag.name}
                      onRemove={() => {/* TODO: wire up kink tag removal */}}
                    />
                  ))}
                </XStack>
              </YStack>
            )}

            {/* Gender */}
            <YStack gap={8}>
              <SectionLabel>Kon</SectionLabel>
              <XStack flexWrap="wrap" gap={8}>
                {GENDERS.map(g => (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g)}
                    style={({ pressed }) => [
                      styles.chipButton,
                      gender === g ? styles.chipActive : styles.chipInactive,
                      { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
                    ]}
                  >
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color={gender === g ? '#ffffff' : COLORS.onSurface}
                    >
                      {g.replace(/_/g, ' ').toLowerCase()}
                    </Text>
                  </Pressable>
                ))}
              </XStack>
            </YStack>

            {/* Orientation */}
            <YStack gap={8}>
              <SectionLabel>Orientering</SectionLabel>
              <XStack flexWrap="wrap" gap={8}>
                {ORIENTATIONS.map(o => (
                  <Pressable
                    key={o}
                    onPress={() => setOrientation(o)}
                    style={({ pressed }) => [
                      styles.chipButton,
                      orientation === o ? styles.chipActive : styles.chipInactive,
                      { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
                    ]}
                  >
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color={orientation === o ? '#ffffff' : COLORS.onSurface}
                    >
                      {o.replace(/_/g, ' ').toLowerCase()}
                    </Text>
                  </Pressable>
                ))}
              </XStack>
            </YStack>

            {/* Relationship Type */}
            <YStack gap={8}>
              <SectionLabel>Relationstyp</SectionLabel>
              <XStack flexWrap="wrap" gap={8}>
                {RELATIONSHIP_TYPES.map(r => (
                  <Pressable
                    key={r}
                    onPress={() => setRelationshipType(r === relationshipType ? '' : r)}
                    style={({ pressed }) => [
                      styles.chipButton,
                      relationshipType === r ? styles.chipActive : styles.chipInactive,
                      { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
                    ]}
                  >
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color={relationshipType === r ? '#ffffff' : COLORS.onSurface}
                    >
                      {r.replace(/_/g, ' ').toLowerCase()}
                    </Text>
                  </Pressable>
                ))}
              </XStack>
            </YStack>

            {/* Prompts */}
            <YStack gap={8}>
              <SectionLabel>Fragor</SectionLabel>
              <YStack gap={8}>
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
                  <Pressable
                    onPress={() => setShowPromptPicker(true)}
                    style={({ pressed }) => [
                      styles.addPromptButton,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Text fontSize={16} fontWeight="600" color={COLORS.primary}>
                      + Lagg till fraga
                    </Text>
                  </Pressable>
                )}
              </YStack>
            </YStack>
          </YStack>

          {/* ── Settings Toggles Section ──────────────────────────────────── */}
          <YStack gap={16}>
            <Text fontFamily="$heading" fontSize={20} fontWeight="700" color={COLORS.primary}>
              Installningar
            </Text>
            <YStack gap={4}>
              <SettingsToggle
                label="Visa avstand"
                description="Lat andra se hur nara du ar"
                value={showDistance}
                onValueChange={setShowDistance}
              />
              <SettingsToggle
                label="Visa alder"
                description="Visa din alder pa profilen"
                value={showAge}
                onValueChange={setShowAge}
              />
              <SettingsToggle
                label="Notifikationer"
                description="Aviseringar for nya matchningar och meddelanden"
                value={notifications}
                onValueChange={setNotifications}
              />
            </YStack>
          </YStack>

          {/* ── Decorative Footer ─────────────────────────────────────────── */}
          <YStack alignItems="center" paddingVertical={32}>
            <Text
              fontFamily="Caveat_400Regular"
              fontSize={24}
              color="rgba(137,77,13,0.4)"
              fontStyle="italic"
            >
              Lustre
            </Text>
            <Text
              fontSize={10}
              textTransform="uppercase"
              letterSpacing={3}
              color={COLORS.outline}
              opacity={0.5}
              marginTop={8}
            >
              Handgjord for dig
            </Text>
          </YStack>
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

// ── Styles ──────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  emptySlot: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d8c3b4',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 14,
  },
  chipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  chipActive: {
    backgroundColor: '#894d0d',
    shadowColor: '#894d0d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chipInactive: {
    backgroundColor: '#eedfda',
  },
  addPromptButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216, 195, 180, 0.20)',
    borderRadius: 9999,
  },
})
