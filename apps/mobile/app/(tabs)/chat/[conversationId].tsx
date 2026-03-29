import { useEffect } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import * as ScreenCapture from 'expo-screen-capture'
import { ChatRoomScreen } from '@lustre/app/src/screens/ChatRoomScreen'

export default function ChatRoomTab() {
  const { conversationId, displayName } = useLocalSearchParams<{
    conversationId: string
    displayName: string
  }>()

  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync()
    return () => {
      ScreenCapture.allowScreenCaptureAsync()
    }
  }, [])

  if (!conversationId) {
    return null
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FDF8F3' }}>
      <ChatRoomScreen
        conversationId={conversationId}
        displayName={displayName || 'User'}
      />
    </View>
  )
}
