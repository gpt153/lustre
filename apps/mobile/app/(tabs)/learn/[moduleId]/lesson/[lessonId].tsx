import { useLocalSearchParams, useRouter } from 'expo-router'
import { LearnLessonScreen } from '@lustre/app/src/screens/LearnLessonScreen'

export default function LessonScreen() {
  const { moduleId, lessonId } = useLocalSearchParams<{ moduleId: string; lessonId: string }>()
  const router = useRouter()
  return (
    <LearnLessonScreen
      moduleId={moduleId}
      lessonId={lessonId}
      onBack={() => router.back()}
      onStartSession={(persona, lessonContext) => {
        router.push({
          pathname: '/(tabs)/coach/start',
          params: { persona, lessonContext },
        })
      }}
    />
  )
}
