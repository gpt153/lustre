import { useLocalSearchParams, useRouter } from 'expo-router'
import { CallScreen } from '@lustre/app/src/screens/CallScreen'

export default function CallPage() {
  const { callId, conversationId, displayName } = useLocalSearchParams<{
    callId: string
    conversationId: string
    displayName: string
  }>()
  const router = useRouter()

  return (
    <CallScreen
      callId={callId}
      conversationId={conversationId}
      displayName={displayName ?? 'Unknown'}
      onNavigateBack={() => router.back()}
    />
  )
}
