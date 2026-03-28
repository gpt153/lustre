import { useState } from 'react'
import { YStack, XStack, Button, Text } from 'tamagui'
import { DiscoverScreen, MatchesListScreen, SearchScreen, IntentionListScreen, IntentionFeedScreen, CreateIntentionScreen } from '@lustre/app'

type TabType = 'intentions' | 'discover' | 'matches' | 'search'
type IntentionView = 'list' | 'create' | { feed: string }

export default function DiscoverTab() {
  const [activeTab, setActiveTab] = useState<TabType>('intentions')
  const [intentionView, setIntentionView] = useState<IntentionView>('list')

  const tabs: { key: TabType; label: string }[] = [
    { key: 'intentions', label: 'Intentioner' },
    { key: 'discover', label: 'Swipe' },
    { key: 'matches', label: 'Matchningar' },
    { key: 'search', label: 'Sök' },
  ]

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack paddingHorizontal="$3" paddingTop="$3" paddingBottom="$2" gap="$2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            size="$3"
            backgroundColor={activeTab === tab.key ? '#B87333' : '$gray4'}
            color={activeTab === tab.key ? 'white' : '$gray11'}
            borderRadius="$4"
            onPress={() => {
              setActiveTab(tab.key)
              if (tab.key === 'intentions') setIntentionView('list')
            }}
          >
            {tab.label}
          </Button>
        ))}
      </XStack>

      {activeTab === 'intentions' && intentionView === 'list' && (
        <IntentionListScreen
          onCreatePress={() => setIntentionView('create')}
          onIntentionPress={(id) => setIntentionView({ feed: id })}
        />
      )}
      {activeTab === 'intentions' && intentionView === 'create' && (
        <CreateIntentionScreen onSuccess={() => setIntentionView('list')} />
      )}
      {activeTab === 'intentions' && typeof intentionView === 'object' && 'feed' in intentionView && (
        <IntentionFeedScreen intentionId={intentionView.feed} />
      )}
      {activeTab === 'discover' && <DiscoverScreen />}
      {activeTab === 'matches' && <MatchesListScreen />}
      {activeTab === 'search' && <SearchScreen />}
    </YStack>
  )
}
