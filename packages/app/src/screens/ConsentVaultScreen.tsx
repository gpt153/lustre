import { YStack, XStack, Text, Button, H2, ScrollView, Spinner } from 'tamagui'
import { useConsent } from '../hooks/useConsent'

type RecordingStatus = 'PROCESSING' | 'READY' | 'DELETED'

interface Props {
  onNewRecording: () => void
  onPlayback: (recordingId: string) => void
}

function StatusBadge({ status }: { status: RecordingStatus }) {
  const colorMap: Record<RecordingStatus, string> = {
    PROCESSING: '$yellow10',
    READY: '$green10',
    DELETED: '$gray10',
  }

  return (
    <Text
      fontSize="$1"
      fontWeight="600"
      color={colorMap[status]}
      borderWidth={1}
      borderColor={colorMap[status]}
      borderRadius="$2"
      paddingHorizontal="$xs"
      paddingVertical="$xs"
    >
      {status}
    </Text>
  )
}

export function ConsentVaultScreen({ onNewRecording, onPlayback }: Props) {
  const { recordings, isLoading, revokeRecording, deleteRecording, refetch } = useConsent()

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner />
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack padding="$md" gap="$md">
        <XStack alignItems="center" justifyContent="space-between">
          <H2 color="$color">ConsentVault</H2>
          <Button theme="active" size="$3" onPress={onNewRecording}>
            New Recording
          </Button>
        </XStack>

        {recordings.length === 0 ? (
          <YStack alignItems="center" justifyContent="center" paddingVertical="$xl">
            <Text color="$colorSecondary" fontSize="$4">
              Geen opnames
            </Text>
          </YStack>
        ) : (
          <YStack gap="$sm">
            {recordings.map((recording: {
              id: string
              status: RecordingStatus
              createdAt: string | Date
            }) => (
              <YStack
                key={recording.id}
                backgroundColor="$backgroundHover"
                borderRadius="$4"
                padding="$sm"
                gap="$sm"
              >
                <XStack alignItems="center" justifyContent="space-between">
                  <YStack gap="$xs">
                    <Text color="$color" fontSize="$2" fontWeight="600">
                      {new Date(recording.createdAt).toLocaleDateString('nl-NL', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </YStack>
                  <StatusBadge status={recording.status} />
                </XStack>

                <XStack gap="$xs" flexWrap="wrap">
                  {recording.status === 'READY' && (
                    <Button
                      size="$3"
                      theme="active"
                      onPress={() => onPlayback(recording.id)}
                    >
                      View
                    </Button>
                  )}
                  {recording.status !== 'DELETED' && (
                    <Button
                      size="$3"
                      backgroundColor="$backgroundHover"
                      onPress={async () => {
                        await revokeRecording({ recordingId: recording.id })
                        refetch()
                      }}
                    >
                      Revoke
                    </Button>
                  )}
                  <Button
                    size="$3"
                    backgroundColor="$red3"
                    onPress={async () => {
                      await deleteRecording({ recordingId: recording.id })
                      refetch()
                    }}
                  >
                    <Text color="$red10">Delete</Text>
                  </Button>
                </XStack>
              </YStack>
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}
