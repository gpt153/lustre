import { EventListScreen } from '@lustre/app/src/screens/EventListScreen'
import { useRouter } from 'expo-router'

export default function ExploreEventsScreen() {
  const router = useRouter()
  return <EventListScreen onEventPress={(id) => router.push(`/events/${id}` as any)} />
}
