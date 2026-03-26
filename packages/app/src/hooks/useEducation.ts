import { trpc } from '@lustre/api'

interface UseEducationOptions {
  topicSlug?: string
  category?: string
}

export function useEducation(options?: UseEducationOptions) {
  const topicsQuery = trpc.education.listTopics.useQuery(
    options?.category ? { category: options.category } : {}
  )
  const articlesQuery = trpc.education.listArticles.useQuery(
    { topicSlug: options?.topicSlug },
    { enabled: !!options?.topicSlug }
  )
  const markReadMutation = trpc.education.markArticleRead.useMutation()

  return {
    topics: topicsQuery.data ?? [],
    articles: articlesQuery.data ?? [],
    isLoading: topicsQuery.isLoading,
    isArticlesLoading: articlesQuery.isLoading,
    markRead: (articleId: string) => markReadMutation.mutate({ articleId }),
  }
}
