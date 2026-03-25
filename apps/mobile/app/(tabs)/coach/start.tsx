import { useRouter } from 'expo-router'
import { CoachStartScreen } from '@lustre/app/src/screens/CoachStartScreen'

export default function CoachStartTab() {
  const router = useRouter()

  return (
    <CoachStartScreen
      onSessionStarted={(sessionId, token, wsUrl, roomName, mode, persona) => {
        router.replace({
          pathname: '/(tabs)/coach/session',
          params: { sessionId, token, wsUrl, roomName, mode, persona },
        })
      }}
      onBack={() => router.back()}
    />
  )
}
