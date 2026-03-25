import { useRouter, useLocalSearchParams } from 'expo-router'
import { CoachSessionScreen } from '@lustre/app/src/screens/CoachSessionScreen'

export default function CoachSessionTab() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    sessionId: string
    token: string
    wsUrl: string
    roomName: string
    mode: 'VOICE' | 'TEXT'
    persona: 'COACH' | 'PARTNER'
  }>()

  return (
    <CoachSessionScreen
      sessionId={params.sessionId}
      token={params.token}
      wsUrl={params.wsUrl}
      roomName={params.roomName}
      mode={params.mode}
      persona={params.persona}
      onEnd={() => router.replace('/(tabs)/coach')}
    />
  )
}
