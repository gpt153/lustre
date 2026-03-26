import { useRouter, useLocalSearchParams } from 'expo-router'
import { EducationArticleScreen } from '@lustre/app/src/screens/EducationArticleScreen'

export default function ArticlePage() {
  const { articleId } = useLocalSearchParams<{ articleId: string }>()
  const router = useRouter()

  if (!articleId) {
    return null
  }

  return <EducationArticleScreen articleId={articleId} onBack={() => router.back()} />
}
