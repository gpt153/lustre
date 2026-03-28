import { useState, useEffect, useRef } from 'react'
import { TouchableOpacity } from 'react-native'
import { YStack, XStack, Text, Button, Spinner } from 'tamagui'
import { useCoach } from '../hooks/useCoach'

interface CoachSessionScreenProps {
  sessionId: string
  token: string
  wsUrl: string
  roomName: string
  mode: 'VOICE' | 'TEXT'
  persona: 'COACH' | 'PARTNER'
  onEnd: () => void
}

function formatTimer(elapsed: number): string {
  const mins = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, '0')
  const secs = (elapsed % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

function personaName(persona: 'COACH' | 'PARTNER'): string {
  return persona === 'COACH' ? 'Axel' : 'Sophia'
}

export function CoachSessionScreen({
  sessionId,
  token,
  wsUrl,
  roomName,
  mode,
  persona,
  onEnd,
}: CoachSessionScreenProps) {
  const [elapsed, setElapsed] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { endSession } = useCoach()

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  async function handleEnd() {
    if (isEnding) return
    setIsEnding(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    try {
      await endSession(sessionId, elapsed)
    } finally {
      onEnd()
    }
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack
        paddingHorizontal="$md"
        paddingTop="$lg"
        paddingBottom="$md"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <YStack
          width={64}
          height={64}
          borderRadius={32}
          backgroundColor="$pink8"
          alignItems="center"
          justifyContent="center"
          marginBottom="$2"
        >
          <Text fontSize={28} fontWeight="700" color="white">
            {personaName(persona)[0]}
          </Text>
        </YStack>
        <Text fontSize={18} fontWeight="700" color="$color">
          {personaName(persona)}
        </Text>
        <Text fontSize={13} color="$gray10" marginTop="$1">
          {mode === 'VOICE' ? 'Röstsamtal' : 'Textchatt'} · Aktiv
        </Text>
      </YStack>

      {/* Timer */}
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$md">
        <YStack alignItems="center" gap="$xs">
          <Text fontSize={56} fontWeight="300" color="$color" letterSpacing={2}>
            {formatTimer(elapsed)}
          </Text>
          <Text fontSize={13} color="$gray10">
            Sessionstid
          </Text>
        </YStack>

        {mode === 'VOICE' && (
          <YStack
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor={isMuted ? '$red3' : '$green3'}
            alignItems="center"
            justifyContent="center"
            marginTop="$4"
          >
            <Text fontSize={36}>{isMuted ? '🔇' : '🎙️'}</Text>
          </YStack>
        )}
      </YStack>

      {/* Controls */}
      <YStack paddingHorizontal="$lg" paddingBottom="$2xl" gap="$md">
        {mode === 'VOICE' && (
          <XStack justifyContent="center">
            <TouchableOpacity
              onPress={() => setIsMuted((v) => !v)}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: isMuted ? '#ef4444' : '#374151',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text fontSize={28}>{isMuted ? '🔇' : '🎤'}</Text>
            </TouchableOpacity>
          </XStack>
        )}

        <Button
          size="$5"
          backgroundColor="$red10"
          color="white"
          borderRadius="$4"
          onPress={handleEnd}
          disabled={isEnding}
          icon={isEnding ? <Spinner color="white" /> : undefined}
        >
          {isEnding ? 'Avslutar…' : 'Avsluta'}
        </Button>
      </YStack>
    </YStack>
  )
}
