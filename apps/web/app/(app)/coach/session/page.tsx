'use client'

import { useState, useEffect, Suspense } from 'react'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { trpc } from '@lustre/api'
import { useRouter, useSearchParams } from 'next/navigation'

function formatElapsed(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function personaLabel(persona: string): string {
  return persona === 'COACH' ? 'Axel (Coach)' : 'Sophia (Partner)'
}

function CoachSessionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get('sessionId') ?? ''
  const mode = searchParams.get('mode') ?? 'VOICE'
  const persona = searchParams.get('persona') ?? 'COACH'

  const [elapsed, setElapsed] = useState(0)
  const [isEnding, setIsEnding] = useState(false)

  const endSession = trpc.coach.end.useMutation()

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleEnd = async () => {
    if (isEnding || !sessionId) return
    setIsEnding(true)
    try {
      await endSession.mutateAsync({ sessionId, durationSecs: elapsed })
      router.push('/coach')
    } catch {
      setIsEnding(false)
    }
  }

  if (!sessionId) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary">Invalid session. No session ID provided.</Text>
        <Button
          marginTop="$4"
          backgroundColor="$primary"
          borderRadius="$3"
          paddingHorizontal="$4"
          onPress={() => router.push('/coach')}
        >
          <Text color="white" fontWeight="600">Back to Coach</Text>
        </Button>
      </YStack>
    )
  }

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh" padding="$4">
      <YStack
        width="100%"
        maxWidth={480}
        backgroundColor="$background"
        borderRadius="$4"
        padding="$8"
        gap="$6"
        borderWidth={1}
        borderColor="$borderColor"
        alignItems="center"
      >
        {/* Persona avatar */}
        <YStack
          width={80}
          height={80}
          borderRadius={40}
          backgroundColor="$primary"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="$8" color="white" fontWeight="700">
            {persona === 'COACH' ? 'A' : 'S'}
          </Text>
        </YStack>

        <YStack alignItems="center" gap="$1">
          <Text fontSize="$5" fontWeight="700" color="$text">{personaLabel(persona)}</Text>
          <XStack
            backgroundColor={mode === 'VOICE' ? '$primary' : '$borderColor'}
            borderRadius="$2"
            paddingHorizontal="$3"
            paddingVertical="$1"
          >
            <Text
              fontSize="$2"
              fontWeight="600"
              color={mode === 'VOICE' ? 'white' : '$text'}
            >
              {mode === 'VOICE' ? 'Voice Session' : 'Text Session'}
            </Text>
          </XStack>
        </YStack>

        {/* Timer */}
        <YStack alignItems="center" gap="$2">
          <Text fontSize="$2" color="$textSecondary" fontWeight="500" letterSpacing={1}>
            SESSION TIME
          </Text>
          <Text
            fontSize={48}
            fontWeight="700"
            color="$text"
            fontVariant={['tabular-nums']}
          >
            {formatElapsed(elapsed)}
          </Text>
        </YStack>

        {/* Active indicator */}
        <XStack alignItems="center" gap="$2">
          <YStack
            width={8}
            height={8}
            borderRadius={4}
            backgroundColor="#22C55E"
            animation="pulse"
          />
          <Text fontSize="$3" color="#22C55E" fontWeight="500">Session active</Text>
        </XStack>

        {/* End button */}
        <Button
          backgroundColor="#EF4444"
          borderRadius="$3"
          paddingVertical="$3"
          paddingHorizontal="$8"
          onPress={handleEnd}
          disabled={isEnding}
          opacity={isEnding ? 0.7 : 1}
          width="100%"
        >
          {isEnding ? (
            <XStack gap="$2" alignItems="center" justifyContent="center">
              <Spinner color="white" size="small" />
              <Text color="white" fontWeight="600" fontSize="$4">Ending session...</Text>
            </XStack>
          ) : (
            <Text color="white" fontWeight="600" fontSize="$4">End Session</Text>
          )}
        </Button>
      </YStack>
    </YStack>
  )
}

export default function CoachSessionPage() {
  return (
    <Suspense
      fallback={
        <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
          <Spinner color="$primary" />
        </YStack>
      }
    >
      <CoachSessionContent />
    </Suspense>
  )
}
