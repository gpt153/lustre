import { useRouter } from 'expo-router'
import { EducationTopicListScreen } from '@lustre/app/src/screens/EducationTopicListScreen'

export default function SexualHealthPage() {
  const router = useRouter()
  return (
    <EducationTopicListScreen
      onTopicPress={(slug) => router.push(`/(tabs)/learn/topic/${slug}`)}
    />
  )
}
