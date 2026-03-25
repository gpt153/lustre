import { useLocalSearchParams, useRouter } from 'expo-router'
import { LearnModuleDetailScreen } from '@lustre/app/src/screens/LearnModuleDetailScreen'

export default function ModuleDetailTab() {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>()
  const router = useRouter()
  return (
    <LearnModuleDetailScreen
      moduleId={moduleId}
      onBack={() => router.back()}
      onLessonPress={(lessonId) => router.push(`/(tabs)/learn/${moduleId}/lesson/${lessonId}`)}
    />
  )
}
