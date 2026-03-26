import { useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router'
import * as ScreenCapture from 'expo-screen-capture'
import { ChatRoomScreen } from '@lustre/app/src/screens/ChatRoomScreen'

export default function ChatConversationScreen() {
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
    <ChatRoomScreen
      conversationId={conversationId}
      displayName={displayName || 'User'}
    />
  )
}
