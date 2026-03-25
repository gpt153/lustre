import { ScrollView, YStack, XStack, Text, Button, Spinner } from 'tamagui'
import { useCoach } from '../hooks/useCoach'

interface CoachHistoryScreenProps {
  onNewSession: () => void
}

function formatDuration(secs: number): string {
  const mins = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${mins}:${s}`
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' })
}

function personaLabel(persona: 'COACH' | 'PARTNER'): string {
  return persona === 'COACH' ? 'Axel' : 'Sophia'
}

function modeLabel(mode: 'VOICE' | 'TEXT'): string {
  return mode === 'VOICE' ? 'Röst' : 'Text'
}

export function CoachHistoryScreen({ onNewSession }: CoachHistoryScreenProps) {
  const { sessions, isLoading } = useCoach()

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner />
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text fontSize={20} fontWeight="700" color="$color">
          Coach
        </Text>
        <Button
          size="$3"
          backgroundColor="$pink10"
          color="white"
          borderRadius="$4"
          onPress={onNewSession}
        >
          Ny session
        </Button>
      </XStack>

      <ScrollView flex={1}>
        {sessions.length === 0 ? (
          <YStack flex={1} alignItems="center" justifyContent="center" paddingTop="$10" gap="$3">
            <Text fontSize={16} color="$gray10">
              Inga sessioner ännu
            </Text>
            <Text fontSize={14} color="$gray9" textAlign="center" paddingHorizontal="$6">
              Starta en session med Axel eller Sophia för att komma igång.
            </Text>
          </YStack>
        ) : (
          <YStack paddingHorizontal="$4" paddingTop="$2" gap="$2">
            {sessions.map((session) => (
              <XStack
                key={session.id}
                backgroundColor="$gray2"
                borderRadius="$4"
                padding="$3"
                alignItems="center"
                gap="$3"
              >
                <YStack
                  width={44}
                  height={44}
                  borderRadius={22}
                  backgroundColor="$pink8"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize={18} fontWeight="700" color="white">
                    {personaLabel(session.persona)[0]}
                  </Text>
                </YStack>

                <YStack flex={1} gap="$1">
                  <XStack alignItems="center" gap="$2">
                    <Text fontSize={15} fontWeight="600" color="$color">
                      {personaLabel(session.persona)}
                    </Text>
                    <XStack
                      backgroundColor="$gray4"
                      borderRadius="$2"
                      paddingHorizontal="$2"
                      paddingVertical={2}
                    >
                      <Text fontSize={11} color="$gray11">
                        {modeLabel(session.mode)}
                      </Text>
                    </XStack>
                  </XStack>
                  <Text fontSize={12} color="$gray10">
                    {formatDate(session.createdAt)}
                  </Text>
                </YStack>

                <YStack alignItems="flex-end" gap="$1">
                  <Text fontSize={14} fontWeight="600" color="$color">
                    {formatDuration(session.durationSecs)}
                  </Text>
                  {session.tokensDebited > 0 && (
                    <Text fontSize={11} color="$gray10">
                      {session.tokensDebited} token
                    </Text>
                  )}
                </YStack>
              </XStack>
            ))}
          </YStack>
        )}
      </ScrollView>
    </YStack>
  )
}
