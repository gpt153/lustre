import { useRouter } from 'expo-router'
import { CoachHistoryScreen } from '@lustre/app/src/screens/CoachHistoryScreen'

export default function LearnCoachIndexScreen() {
  const router = useRouter()

  return (
    <CoachHistoryScreen
      onNewSession={() => router.push('/(tabs)/learn/coach/start')}
    />
  )
}
