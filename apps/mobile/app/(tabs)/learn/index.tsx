import { useRouter } from 'expo-router'
import { LearnModuleListScreen } from '@lustre/app/src/screens/LearnModuleListScreen'

export default function LearnTab() {
  const router = useRouter()
  return (
    <LearnModuleListScreen
      onModulePress={(moduleId) => router.push(`/(tabs)/learn/${moduleId}`)}
    />
  )
}
