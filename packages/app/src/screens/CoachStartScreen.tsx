import { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { YStack, XStack, Text, Button, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import { useCoach } from '../hooks/useCoach'
import { InsufficientBalanceModal } from '../components/InsufficientBalanceModal'

interface CoachStartScreenProps {
  onSessionStarted: (
    sessionId: string,
    token: string,
    wsUrl: string,
    roomName: string,
    mode: 'VOICE' | 'TEXT',
    persona: 'COACH' | 'PARTNER'
  ) => void
  onBack: () => void
}

const PERSONAS: { key: 'COACH' | 'PARTNER'; name: string; description: string }[] = [
  {
    key: 'COACH',
    name: 'Axel',
    description: 'En stöttande coach som hjälper dig att växa och nå dina mål.',
  },
  {
    key: 'PARTNER',
    name: 'Sophia',
    description: 'En övningspartner för att träna sociala situationer och samtal.',
  },
]

const MODES: { key: 'VOICE' | 'TEXT'; label: string }[] = [
  { key: 'VOICE', label: 'Röst' },
  { key: 'TEXT', label: 'Text' },
]

export function CoachStartScreen({ onSessionStarted, onBack }: CoachStartScreenProps) {
  const [selectedPersona, setSelectedPersona] = useState<'COACH' | 'PARTNER'>('COACH')
  const [selectedMode, setSelectedMode] = useState<'VOICE' | 'TEXT'>('VOICE')
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBalanceModal, setShowBalanceModal] = useState(false)

  const { createSession } = useCoach()
  const startMutation = trpc.coach.start.useMutation()

  async function handleStart() {
    setIsStarting(true)
    setError(null)
    try {
      const result = await createSession(selectedPersona, selectedMode)
      if ('error' in result && result.error === 'INSUFFICIENT_BALANCE') {
        setShowBalanceModal(true)
        return
      }
      if (!result.session || !result.token || !result.wsUrl || !result.roomName) {
        setError('Kunde inte starta sessionen. Försök igen.')
        return
      }
      await startMutation.mutateAsync({ sessionId: result.session.id })
      onSessionStarted(result.session.id, result.token, result.wsUrl, result.roomName, selectedMode, selectedPersona)
    } catch {
      setError('Kunde inte starta sessionen. Försök igen.')
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <YStack flex={1} backgroundColor="$background" paddingHorizontal="$4" paddingTop="$4">
      <XStack alignItems="center" marginBottom="$5">
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text fontSize={16} color="$pink10">
            ← Tillbaka
          </Text>
        </TouchableOpacity>
      </XStack>

      <Text fontSize={22} fontWeight="700" color="$color" marginBottom="$2">
        Välj coach
      </Text>
      <Text fontSize={14} color="$gray10" marginBottom="$4">
        Vem vill du ha en session med?
      </Text>

      <YStack gap="$3" marginBottom="$6">
        {PERSONAS.map((persona) => {
          const isSelected = selectedPersona === persona.key
          return (
            <TouchableOpacity key={persona.key} onPress={() => setSelectedPersona(persona.key)}>
              <XStack
                backgroundColor={isSelected ? '$pink3' : '$gray2'}
                borderRadius="$4"
                borderWidth={2}
                borderColor={isSelected ? '$pink9' : '$gray4'}
                padding="$4"
                alignItems="flex-start"
                gap="$3"
              >
                <YStack
                  width={48}
                  height={48}
                  borderRadius={24}
                  backgroundColor={isSelected ? '$pink8' : '$gray6'}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize={20} fontWeight="700" color="white">
                    {persona.name[0]}
                  </Text>
                </YStack>
                <YStack flex={1} gap="$1">
                  <Text fontSize={16} fontWeight="600" color="$color">
                    {persona.name}
                  </Text>
                  <Text fontSize={13} color="$gray10">
                    {persona.description}
                  </Text>
                </YStack>
                {isSelected && (
                  <Text fontSize={18} color="$pink9">
                    ✓
                  </Text>
                )}
              </XStack>
            </TouchableOpacity>
          )
        })}
      </YStack>

      <Text fontSize={18} fontWeight="600" color="$color" marginBottom="$3">
        Välj läge
      </Text>

      <XStack gap="$3" marginBottom="$6">
        {MODES.map((mode) => {
          const isSelected = selectedMode === mode.key
          return (
            <TouchableOpacity
              key={mode.key}
              onPress={() => setSelectedMode(mode.key)}
              style={{ flex: 1 }}
            >
              <YStack
                backgroundColor={isSelected ? '$pink3' : '$gray2'}
                borderRadius="$4"
                borderWidth={2}
                borderColor={isSelected ? '$pink9' : '$gray4'}
                paddingVertical="$4"
                alignItems="center"
                justifyContent="center"
                gap="$2"
              >
                <Text fontSize={24}>{mode.key === 'VOICE' ? '🎙️' : '💬'}</Text>
                <Text
                  fontSize={15}
                  fontWeight="600"
                  color={isSelected ? '$pink10' : '$color'}
                >
                  {mode.label}
                </Text>
              </YStack>
            </TouchableOpacity>
          )
        })}
      </XStack>

      {error && (
        <Text fontSize={13} color="$red10" marginBottom="$3" textAlign="center">
          {error}
        </Text>
      )}

      <Button
        size="$5"
        backgroundColor="$pink10"
        color="white"
        borderRadius="$4"
        onPress={handleStart}
        disabled={isStarting}
        icon={isStarting ? <Spinner color="white" /> : undefined}
      >
        {isStarting ? 'Startar…' : 'Starta session'}
      </Button>

      <InsufficientBalanceModal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
      />
    </YStack>
  )
}
