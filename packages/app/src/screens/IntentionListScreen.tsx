import { useState } from 'react'
import { FlatList, TouchableOpacity } from 'react-native'
import { YStack, XStack, Text, Button, Spinner } from 'tamagui'
import { useIntentions } from '../hooks/useIntentions'

interface IntentionListScreenProps {
  onCreatePress?: () => void
  onIntentionPress?: (id: string) => void
}

function IntentionCard({
  intention,
  onPress,
  onPausePress,
  onResumePress,
  onDeletePress,
}: {
  intention: any
  onPress: () => void
  onPausePress: () => void
  onResumePress: () => void
  onDeletePress: () => void
}) {
  const getStatusColor = (isPaused: boolean, isExpired: boolean) => {
    if (isExpired) return '$gray8'
    if (isPaused) return '$yellow8'
    return '$green8'
  }

  const getStatusLabel = (isPaused: boolean, isExpired: boolean) => {
    if (isExpired) return 'Utgången'
    if (isPaused) return 'Pausad'
    return 'Aktiv'
  }

  const isPaused = intention.pausedAt !== null
  const isExpired = intention.daysRemaining <= 0

  return (
    <TouchableOpacity onPress={onPress}>
      <YStack
        backgroundColor="$background"
        borderRadius="$3"
        padding="$sm"
        marginBottom="$2"
        borderWidth={1}
        borderColor="$borderColor"
        gap="$xs"
      >
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1} gap="$xs">
            <Text fontWeight="600" color="$text" fontSize="$4">
              {intention.seeking.toLowerCase()}
            </Text>
            <XStack gap="$xs" alignItems="center">
              <XStack
                backgroundColor={getStatusColor(isPaused, isExpired)}
                paddingHorizontal="$xs"
                paddingVertical="$xs"
                borderRadius="$2"
              >
                <Text fontSize="$1" color="white" fontWeight="600">
                  {getStatusLabel(isPaused, isExpired)}
                </Text>
              </XStack>
              {!isExpired && (
                <Text fontSize="$2" color="$gray11">
                  {intention.daysRemaining} dag{intention.daysRemaining !== 1 ? 'ar' : ''}
                </Text>
              )}
            </XStack>
          </YStack>
        </XStack>

        <XStack gap="$xs" justifyContent="flex-end">
          {!isExpired && (
            <Button
              size="$2"
              backgroundColor={isPaused ? '$blue8' : '$orange8'}
              color="white"
              borderRadius="$2"
              onPress={isPaused ? onResumePress : onPausePress}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text fontSize="$1" fontWeight="600">
                {isPaused ? 'Aktivera' : 'Pausa'}
              </Text>
            </Button>
          )}
          <Button
            size="$2"
            backgroundColor="$red8"
            color="white"
            borderRadius="$2"
            onPress={onDeletePress}
            pressStyle={{ opacity: 0.8 }}
          >
            <Text fontSize="$1" fontWeight="600">
              Ta bort
            </Text>
          </Button>
        </XStack>
      </YStack>
    </TouchableOpacity>
  )
}

export function IntentionListScreen({ onCreatePress, onIntentionPress }: IntentionListScreenProps) {
  const { intentions, isLoading, pause, resume, delete: deleteIntention } = useIntentions()
  const [pausingId, setPausingId] = useState<string | null>(null)
  const [resumingId, setResumingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const activeIntentions = intentions.filter((i) => i.pausedAt === null && i.daysRemaining > 0)
  const maxIntentionsReached = activeIntentions.length >= 3

  const handlePause = async (id: string) => {
    setPausingId(id)
    try {
      await pause({ id })
    } finally {
      setPausingId(null)
    }
  }

  const handleResume = async (id: string) => {
    setResumingId(id)
    try {
      await resume({ id })
    } finally {
      setResumingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteIntention({ id })
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$blue9" />
      </YStack>
    )
  }

  return (
    <FlatList
      data={intentions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: "$md", paddingBottom: 120 }}
      ListHeaderComponent={
        <YStack gap="$sm" marginBottom="$4">
          <Text fontSize="$6" fontWeight="600" color="$text">
            Mina intentioner
          </Text>
          <Button
            size="$4"
            backgroundColor={maxIntentionsReached ? '$gray4' : '$blue9'}
            color={maxIntentionsReached ? '$gray11' : 'white'}
            borderRadius="$4"
            onPress={onCreatePress}
            disabled={maxIntentionsReached}
          >
            <Text fontWeight="600">{maxIntentionsReached ? 'Max 3 aktiva' : 'Skapa ny'}</Text>
          </Button>
        </YStack>
      }
      ListEmptyComponent={
        <YStack alignItems="center" justifyContent="center" padding="$xl" gap="$xs">
          <Text fontSize="$4" color="$gray11" fontWeight="600">
            Inga intentioner ännu
          </Text>
          <Text fontSize="$3" color="$gray10">
            Skapa en för att komma igång
          </Text>
        </YStack>
      }
      renderItem={({ item }) => (
        <IntentionCard
          intention={item}
          onPress={() => onIntentionPress?.(item.id)}
          onPausePress={() => handlePause(item.id)}
          onResumePress={() => handleResume(item.id)}
          onDeletePress={() => handleDelete(item.id)}
        />
      )}
    />
  )
}
