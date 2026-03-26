import { FlatList, TouchableOpacity } from 'react-native'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { useCampaigns } from '../hooks/useAds'

type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXHAUSTED' | 'COMPLETED'

const STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'Utkast',
  ACTIVE: 'Aktiv',
  PAUSED: 'Pausad',
  EXHAUSTED: 'Budget slut',
  COMPLETED: 'Avslutad',
}

const STATUS_COLORS: Record<CampaignStatus, string> = {
  DRAFT: '#9E9E9E',
  ACTIVE: '#4CAF50',
  PAUSED: '#FF9800',
  EXHAUSTED: '#F44336',
  COMPLETED: '#607D8B',
}

interface CampaignRowProps {
  name: string
  status: CampaignStatus
  dailyBudgetSEK: number
  spentSEK: number
  onPress: () => void
}

function CampaignRow({ name, status, dailyBudgetSEK, spentSEK, onPress }: CampaignRowProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <YStack
        backgroundColor="$background"
        borderRadius="$3"
        borderWidth={1}
        borderColor="$borderColor"
        padding="$4"
        gap="$2"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$4" fontWeight="700" color="$text" flex={1} numberOfLines={1}>
            {name}
          </Text>
          <XStack
            backgroundColor={STATUS_COLORS[status]}
            borderRadius="$10"
            paddingHorizontal="$2"
            paddingVertical="$1"
          >
            <Text fontSize="$2" color="white" fontWeight="600">
              {STATUS_LABELS[status]}
            </Text>
          </XStack>
        </XStack>
        <XStack gap="$4">
          <Text fontSize="$3" color="$textSecondary">
            Daglig budget:{' '}
            <Text fontWeight="600" color="$text">
              {dailyBudgetSEK} kr
            </Text>
          </Text>
          <Text fontSize="$3" color="$textSecondary">
            Förbrukat:{' '}
            <Text fontWeight="600" color="$text">
              {Number(spentSEK).toFixed(2)} kr
            </Text>
          </Text>
        </XStack>
      </YStack>
    </TouchableOpacity>
  )
}

interface AdsManagerScreenProps {
  onCampaignPress: (campaignId: string) => void
  onCreatePress: () => void
}

export function AdsManagerScreen({ onCampaignPress, onCreatePress }: AdsManagerScreenProps) {
  const { data: campaigns, isLoading } = useCampaigns()

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  return (
    <YStack flex={1}>
      <XStack
        justifyContent="space-between"
        alignItems="center"
        padding="$4"
        paddingBottom="$2"
      >
        <Text fontSize="$6" fontWeight="700" color="$text">
          Mina kampanjer
        </Text>
        <Button
          backgroundColor="$primary"
          borderRadius="$3"
          size="$3"
          onPress={onCreatePress}
        >
          <Text color="white" fontWeight="700" fontSize="$3">
            Skapa kampanj
          </Text>
        </Button>
      </XStack>

      {!campaigns || campaigns.length === 0 ? (
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$8" gap="$4">
          <Text color="$textSecondary" fontSize="$4" textAlign="center">
            Du har inga kampanjer ännu
          </Text>
          <Button
            backgroundColor="$primary"
            borderRadius="$3"
            onPress={onCreatePress}
          >
            <Text color="white" fontWeight="700">
              Skapa din första kampanj
            </Text>
          </Button>
        </YStack>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <CampaignRow
              name={item.name}
              status={item.status as CampaignStatus}
              dailyBudgetSEK={item.dailyBudgetSEK}
              spentSEK={item.spentSEK}
              onPress={() => onCampaignPress(item.id)}
            />
          )}
        />
      )}
    </YStack>
  )
}
