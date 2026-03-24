'use client'

import { useState, useEffect, useRef } from 'react'
import { YStack, XStack, Text, Spinner, Button, Image, TextArea } from 'tamagui'
import { trpc } from '@lustre/api'

export default function HomePage() {
  const [showCreate, setShowCreate] = useState(false)

  const feedQuery = trpc.post.feed.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const likeMutation = trpc.post.like.useMutation()
  const unlikeMutation = trpc.post.unlike.useMutation()
  const showLessMutation = trpc.post.showLess.useMutation()

  const posts = feedQuery.data?.pages.flatMap((page) => page.posts) ?? []

  const handleLike = async (postId: string) => {
    await likeMutation.mutateAsync({ postId })
    feedQuery.refetch()
  }

  const handleUnlike = async (postId: string) => {
    await unlikeMutation.mutateAsync({ postId })
    feedQuery.refetch()
  }

  const handleShowLess = async (postId: string) => {
    await showLessMutation.mutateAsync({ postId })
    feedQuery.refetch()
  }

  const loadMoreRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!loadMoreRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
          feedQuery.fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [feedQuery.hasNextPage, feedQuery.isFetchingNextPage])

  if (feedQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={600} gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="700" color="$text">Feed</Text>
          <Button
            backgroundColor="$primary"
            borderRadius="$3"
            paddingHorizontal="$4"
            onPress={() => setShowCreate(!showCreate)}
          >
            <Text color="white" fontWeight="600">{showCreate ? 'Cancel' : 'New Post'}</Text>
          </Button>
        </XStack>

        {showCreate && (
          <CreatePostInline
            onSuccess={() => {
              setShowCreate(false)
              feedQuery.refetch()
            }}
          />
        )}

        {posts.length === 0 ? (
          <YStack alignItems="center" padding="$6">
            <Text color="$textSecondary">No posts yet. Be the first!</Text>
          </YStack>
        ) : (
          posts.map((post) => (
            <WebPostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onUnlike={handleUnlike}
              onShowLess={handleShowLess}
            />
          ))
        )}

        <div ref={loadMoreRef} style={{ height: 1 }} />

        {feedQuery.isFetchingNextPage && (
          <YStack padding="$4" alignItems="center">
            <Spinner color="$primary" />
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}

function CreatePostInline({ onSuccess }: { onSuccess: () => void }) {
  const [text, setText] = useState('')
  const createPost = trpc.post.create.useMutation()

  const handleSubmit = async () => {
    if (!text.trim()) return
    await createPost.mutateAsync({ text: text.trim() })
    setText('')
    onSuccess()
  }

  return (
    <YStack backgroundColor="$background" borderRadius="$3" padding="$4" gap="$3" borderWidth={1} borderColor="$borderColor">
      <TextArea
        placeholder="What's on your mind?"
        value={text}
        onChangeText={(val: string) => setText(val)}
        maxLength={2000}
        fontSize="$3"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$2"
        padding="$3"
        color="$text"
        minHeight={100}
      />
      <XStack justifyContent="space-between" alignItems="center">
        <Text color="$textSecondary" fontSize="$1">{text.length}/2000</Text>
        <Button
          backgroundColor="$primary"
          borderRadius="$3"
          paddingHorizontal="$4"
          onPress={handleSubmit}
          disabled={!text.trim() || createPost.isPending}
        >
          {createPost.isPending ? (
            <Spinner color="white" size="small" />
          ) : (
            <Text color="white" fontWeight="600">Post</Text>
          )}
        </Button>
      </XStack>
    </YStack>
  )
}

function WebPostCard({ post, onLike, onUnlike, onShowLess }: {
  post: {
    id: string
    text: string | null
    createdAt: Date
    author: { id: string; displayName: string | null; avatarUrl: string | null }
    media: Array<{ id: string; url: string; thumbnailMedium: string | null }>
    likeCount: number
    isLiked: boolean
  }
  onLike: (id: string) => void
  onUnlike: (id: string) => void
  onShowLess: (id: string) => void
}) {
  const timeAgo = getTimeAgo(post.createdAt)

  return (
    <YStack backgroundColor="$background" borderRadius="$3" padding="$4" gap="$3" borderWidth={1} borderColor="$borderColor">
      <XStack alignItems="center" gap="$2">
        {post.author.avatarUrl ? (
          <Image
            source={{ uri: post.author.avatarUrl }}
            width={40}
            height={40}
            borderRadius={20}
          />
        ) : (
          <YStack width={40} height={40} borderRadius={20} backgroundColor="$borderColor" alignItems="center" justifyContent="center">
            <Text fontSize="$4">{(post.author.displayName ?? '?')[0]}</Text>
          </YStack>
        )}
        <YStack flex={1}>
          <Text fontWeight="600" color="$text">{post.author.displayName ?? 'Anonymous'}</Text>
          <Text fontSize="$1" color="$textSecondary">{timeAgo}</Text>
        </YStack>
        <Button size="$2" chromeless onPress={() => onShowLess(post.id)}>
          <Text color="$textSecondary">...</Text>
        </Button>
      </XStack>

      {post.text && <Text color="$text" fontSize="$3">{post.text}</Text>}

      {post.media.length > 0 && (
        <XStack flexWrap="wrap" gap="$2">
          {post.media.map((item) => (
            <Image
              key={item.id}
              source={{ uri: item.thumbnailMedium || item.url }}
              width={post.media.length === 1 ? '100%' : '48%'}
              height={250}
              borderRadius="$2"
              objectFit="cover"
            />
          ))}
        </XStack>
      )}

      <XStack alignItems="center" gap="$3">
        <Button size="$3" chromeless onPress={() => post.isLiked ? onUnlike(post.id) : onLike(post.id)}>
          <Text color={post.isLiked ? '$primary' : '$textSecondary'}>
            {post.isLiked ? '♥' : '♡'} {post.likeCount > 0 ? post.likeCount : ''}
          </Text>
        </Button>
      </XStack>
    </YStack>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}
