'use client'

import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function personaLabel(persona: string): string {
  return persona === 'COACH' ? 'Axel (Coach)' : 'Sophia (Partner)'
}

export default function CoachPage() {
  const listQuery = trpc.coach.list.useQuery()

  if (listQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  const sessions = listQuery.data ?? []

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={800} gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="700" color="$text">Coach Sessions</Text>
          <Link href="/coach/start" style={{ textDecoration: 'none' }}>
            <Button backgroundColor="$primary" borderRadius="$3" paddingHorizontal="$4">
              <Text color="white" fontWeight="600">New Session</Text>
            </Button>
          </Link>
        </XStack>

        {sessions.length === 0 ? (
          <YStack
            alignItems="center"
            padding="$8"
            backgroundColor="$background"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text color="$textSecondary" fontSize="$4" textAlign="center">
              No sessions yet.{'\n'}Start a new session to practice with your AI coach.
            </Text>
          </YStack>
        ) : (
          <YStack gap="$0" borderRadius="$3" borderWidth={1} borderColor="$borderColor" overflow="hidden">
            {/* Table header */}
            <XStack
              backgroundColor="$borderColor"
              paddingHorizontal="$4"
              paddingVertical="$3"
              gap="$4"
            >
              <Text fontSize="$2" fontWeight="700" color="$text" flex={2}>Persona</Text>
              <Text fontSize="$2" fontWeight="700" color="$text" flex={1}>Mode</Text>
              <Text fontSize="$2" fontWeight="700" color="$text" flex={1}>Duration</Text>
              <Text fontSize="$2" fontWeight="700" color="$text" flex={1}>Tokens</Text>
              <Text fontSize="$2" fontWeight="700" color="$text" flex={2}>Date</Text>
              <Text fontSize="$2" fontWeight="700" color="$text" flex={1}>Status</Text>
            </XStack>

            {sessions.map((session, index) => (
              <XStack
                key={session.id}
                paddingHorizontal="$4"
                paddingVertical="$3"
                gap="$4"
                alignItems="center"
                backgroundColor={index % 2 === 0 ? '$background' : '$backgroundHover'}
                borderTopWidth={index === 0 ? 0 : 1}
                borderColor="$borderColor"
              >
                <Text fontSize="$3" color="$text" flex={2}>{personaLabel(session.persona)}</Text>
                <Text fontSize="$3" color="$textSecondary" flex={1}>{session.mode === 'VOICE' ? 'Voice' : 'Text'}</Text>
                <Text fontSize="$3" color="$textSecondary" flex={1}>{formatDuration(session.durationSecs)}</Text>
                <Text fontSize="$3" color="$textSecondary" flex={1}>{session.tokensDebited}</Text>
                <Text fontSize="$3" color="$textSecondary" flex={2}>{formatDate(session.createdAt)}</Text>
                <XStack flex={1}>
                  <YStack
                    backgroundColor={
                      session.status === 'ACTIVE'
                        ? '$primary'
                        : session.status === 'ENDED'
                        ? '$borderColor'
                        : '$backgroundHover'
                    }
                    borderRadius="$2"
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                  >
                    <Text
                      fontSize="$1"
                      fontWeight="600"
                      color={session.status === 'ACTIVE' ? 'white' : '$text'}
                    >
                      {session.status}
                    </Text>
                  </YStack>
                </XStack>
              </XStack>
            ))}
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}
