import { trpc } from '@lustre/api'

export function useFeed() {
  const feedQuery = trpc.post.feed.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const likeMutation = trpc.post.like.useMutation()
  const unlikeMutation = trpc.post.unlike.useMutation()
  const showLessMutation = trpc.post.showLess.useMutation()

  const posts = feedQuery.data?.pages.flatMap((page) => page.posts) ?? []

  const like = async (postId: string) => {
    await likeMutation.mutateAsync({ postId })
    feedQuery.refetch()
  }

  const unlike = async (postId: string) => {
    await unlikeMutation.mutateAsync({ postId })
    feedQuery.refetch()
  }

  const showLess = async (postId: string) => {
    await showLessMutation.mutateAsync({ postId })
    feedQuery.refetch()
  }

  return {
    posts,
    isLoading: feedQuery.isLoading,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    hasNextPage: feedQuery.hasNextPage ?? false,
    fetchNextPage: feedQuery.fetchNextPage,
    refetch: feedQuery.refetch,
    like,
    unlike,
    showLess,
  }
}
