import { useRouter, useLocalSearchParams } from 'expo-router'
import { EducationArticleListScreen } from '@lustre/app/src/screens/EducationArticleListScreen'

export default function TopicPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()

  if (!slug) {
    return null
  }

  return (
    <EducationArticleListScreen
      topicSlug={slug}
      onArticlePress={(articleId) => router.push(`/(tabs)/learn/article/${articleId}`)}
      onBack={() => router.back()}
    />
  )
}
