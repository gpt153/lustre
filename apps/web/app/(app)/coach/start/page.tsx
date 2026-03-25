'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { trpc } from '@lustre/api'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@lustre/app/src/stores/authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

type Persona = 'COACH' | 'PARTNER'
type Mode = 'VOICE' | 'TEXT'

export default function CoachStartPage() {
  const router = useRouter()
  const accessToken = useAuthStore((state) => state.accessToken)

  const [selectedPersona, setSelectedPersona] = useState<Persona>('COACH')
  const [selectedMode, setSelectedMode] = useState<Mode>('VOICE')
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSession = trpc.coach.create.useMutation()
  const startSession = trpc.coach.start.useMutation()

  const handleStart = async () => {
    if (isStarting) return
    setIsStarting(true)
    setError(null)

    try {
      // 1. Fetch LiveKit token from REST endpoint
      const tokenRes = await fetch(`${API_URL}/api/coach/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          mode: selectedMode.toLowerCase(),
          persona: selectedPersona.toLowerCase(),
        }),
      })

      if (!tokenRes.ok) {
        const body = await tokenRes.text()
        throw new Error(`Failed to fetch coach token: ${body}`)
      }

      const data = await tokenRes.json() as {
        token: string
        wsUrl: string
        roomName: string
      }

      // 2. Create the session record
      const session = await createSession.mutateAsync({
        persona: selectedPersona,
        mode: selectedMode,
        roomName: data.roomName,
      })

      // 3. Mark session as started
      await startSession.mutateAsync({ sessionId: session.id })

      // 4. Navigate to active session page
      const params = new URLSearchParams({
        sessionId: session.id,
        token: data.token,
        wsUrl: data.wsUrl,
        roomName: data.roomName,
        mode: selectedMode,
        persona: selectedPersona,
      })

      router.push(`/coach/session?${params.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
      setIsStarting(false)
    }
  }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={600} gap="$6">
        <Text fontSize="$6" fontWeight="700" color="$text">New Coach Session</Text>

        {/* Persona selection */}
        <YStack gap="$3">
          <Text fontSize="$4" fontWeight="600" color="$text">Choose your coach</Text>
          <XStack gap="$4">
            <PersonaCard
              name="Axel"
              subtitle="Coach"
              description="Direct, goal-oriented coaching to help you grow and improve."
              selected={selectedPersona === 'COACH'}
              onSelect={() => setSelectedPersona('COACH')}
            />
            <PersonaCard
              name="Sophia"
              subtitle="Partner"
              description="Empathetic partner practice for connection and communication."
              selected={selectedPersona === 'PARTNER'}
              onSelect={() => setSelectedPersona('PARTNER')}
            />
          </XStack>
        </YStack>

        {/* Mode selection */}
        <YStack gap="$3">
          <Text fontSize="$4" fontWeight="600" color="$text">Session mode</Text>
          <XStack gap="$3">
            <ModeButton
              label="Voice"
              description="Real-time voice conversation"
              selected={selectedMode === 'VOICE'}
              onSelect={() => setSelectedMode('VOICE')}
            />
            <ModeButton
              label="Text"
              description="Written chat conversation"
              selected={selectedMode === 'TEXT'}
              onSelect={() => setSelectedMode('TEXT')}
            />
          </XStack>
        </YStack>

        {error && (
          <YStack
            backgroundColor="#FFF0F0"
            borderRadius="$3"
            padding="$3"
            borderWidth={1}
            borderColor="#FFCCCC"
          >
            <Text color="#CC0000" fontSize="$3">{error}</Text>
          </YStack>
        )}

        <Button
          backgroundColor="$primary"
          borderRadius="$3"
          paddingVertical="$4"
          onPress={handleStart}
          disabled={isStarting}
          opacity={isStarting ? 0.7 : 1}
        >
          {isStarting ? (
            <XStack gap="$2" alignItems="center" justifyContent="center">
              <Spinner color="white" size="small" />
              <Text color="white" fontWeight="600" fontSize="$4">Starting session...</Text>
            </XStack>
          ) : (
            <Text color="white" fontWeight="600" fontSize="$4">Start Session</Text>
          )}
        </Button>
      </YStack>
    </YStack>
  )
}

function PersonaCard({
  name,
  subtitle,
  description,
  selected,
  onSelect,
}: {
  name: string
  subtitle: string
  description: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      borderRadius="$4"
      padding="$4"
      gap="$2"
      borderWidth={2}
      borderColor={selected ? '$primary' : '$borderColor'}
      cursor="pointer"
      onPress={onSelect}
      hoverStyle={{ borderColor: '$primary' }}
      pressStyle={{ opacity: 0.85 }}
    >
      <XStack alignItems="center" gap="$2">
        <YStack
          width={44}
          height={44}
          borderRadius={22}
          backgroundColor={selected ? '$primary' : '$borderColor'}
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="$5" color={selected ? 'white' : '$text'}>{name[0]}</Text>
        </YStack>
        <YStack>
          <Text fontSize="$4" fontWeight="700" color="$text">{name}</Text>
          <Text fontSize="$2" color={selected ? '$primary' : '$textSecondary'}>{subtitle}</Text>
        </YStack>
      </XStack>
      <Text fontSize="$2" color="$textSecondary" lineHeight={18}>{description}</Text>
      {selected && (
        <XStack
          backgroundColor="$primary"
          borderRadius="$2"
          paddingHorizontal="$2"
          paddingVertical="$1"
          alignSelf="flex-start"
        >
          <Text fontSize="$1" color="white" fontWeight="600">Selected</Text>
        </XStack>
      )}
    </YStack>
  )
}

function ModeButton({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string
  description: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      borderRadius="$3"
      padding="$4"
      gap="$1"
      borderWidth={2}
      borderColor={selected ? '$primary' : '$borderColor'}
      cursor="pointer"
      onPress={onSelect}
      hoverStyle={{ borderColor: '$primary' }}
      pressStyle={{ opacity: 0.85 }}
    >
      <Text fontSize="$4" fontWeight="700" color={selected ? '$primary' : '$text'}>{label}</Text>
      <Text fontSize="$2" color="$textSecondary">{description}</Text>
    </YStack>
  )
}
