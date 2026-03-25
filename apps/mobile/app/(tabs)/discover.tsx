import { useState } from 'react'
import { YStack } from 'tamagui'
import { DiscoverScreen, MatchesListScreen, SearchScreen } from '@lustre/app'

type TabType = 'discover' | 'matches' | 'search'

export default function DiscoverTab() {
  const [activeTab, setActiveTab] = useState<TabType>('discover')

  return (
    <YStack flex={1} backgroundColor="$background">
      {activeTab === 'discover' && <DiscoverScreen />}
      {activeTab === 'matches' && <MatchesListScreen />}
      {activeTab === 'search' && <SearchScreen />}
    </YStack>
  )
}
