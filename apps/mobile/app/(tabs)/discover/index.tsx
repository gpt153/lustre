import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { YStack } from 'tamagui'
import { DiscoverScreen, MatchesListScreen, SearchScreen } from '@lustre/app'
import { MatchCeremony } from '@/components/MatchCeremony'
import { CopperPick } from '@/components/CopperPick'
import { useCopperPick } from '@/hooks/useCopperPick'

type TabType = 'discover' | 'matches' | 'search'

interface MatchData {
  currentUserPhotoUrl: string
  matchedUserPhotoUrl: string
  matchedUserName?: string
  conversationId?: string
}

export default function DiscoverIndexScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('discover')
  const [matchData, setMatchData] = useState<MatchData | null>(null)

  const { hasCopperPick, copperPickProfile, dismissCopperPick } = useCopperPick()

  const handleMatch = useCallback((data: MatchData) => {
    setMatchData(data)
  }, [])

  const handleSendMessage = useCallback(() => {
    if (matchData?.conversationId) {
      router.push(`/(tabs)/chat/${matchData.conversationId}`)
    }
    setMatchData(null)
  }, [matchData, router])

  const handleContinueDiscovering = useCallback(() => {
    setMatchData(null)
    setActiveTab('discover')
  }, [])

  const handleDismiss = useCallback(() => {
    setMatchData(null)
  }, [])

  const handleCopperPickLike = useCallback(() => {
    dismissCopperPick()
    // Parent DiscoverScreen swipe action handled via normal flow after dismiss
  }, [dismissCopperPick])

  const handleCopperPickPass = useCallback(() => {
    dismissCopperPick()
  }, [dismissCopperPick])

  const handleCopperPickViewProfile = useCallback(() => {
    if (copperPickProfile?.userId) {
      router.push(`/profile/${copperPickProfile.userId}`)
    }
  }, [copperPickProfile, router])

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Copper Pick is shown fullscreen on top of the regular discover stack
          when hasCopperPick is true (once per day, first card of the session).
          It uses buttons only — no swipe gesture per spec. */}
      {activeTab === 'discover' && hasCopperPick && copperPickProfile ? (
        <View style={StyleSheet.absoluteFill}>
          <CopperPick
            profile={copperPickProfile}
            onLike={handleCopperPickLike}
            onPass={handleCopperPickPass}
            onViewProfile={handleCopperPickViewProfile}
          />
        </View>
      ) : null}

      {activeTab === 'discover' && (
        <DiscoverScreen />
      )}
      {activeTab === 'matches' && <MatchesListScreen />}
      {activeTab === 'search' && <SearchScreen />}

      {matchData && (
        <MatchCeremony
          visible
          currentUserPhotoUrl={matchData.currentUserPhotoUrl}
          matchedUserPhotoUrl={matchData.matchedUserPhotoUrl}
          matchedUserName={matchData.matchedUserName}
          onSendMessage={handleSendMessage}
          onContinueDiscovering={handleContinueDiscovering}
          onDismiss={handleDismiss}
        />
      )}
    </YStack>
  )
}
