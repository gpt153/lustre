import { YStack, XStack, Text, Image, Button } from 'tamagui'
import { CardBase } from '@lustre/ui'
import { PostImageGallery } from './PostImageGallery'

interface PostCardProps {
  post: {
    id: string
    text: string | null
    createdAt: Date
    author: { id: string; displayName: string | null; avatarUrl: string | null }
    media: Array<{ id: string; url: string; thumbnailMedium: string | null }>
    likeCount: number
    isLiked: boolean
  }
  onLike: (postId: string) => void
  onUnlike: (postId: string) => void
  onShowLess: (postId: string) => void
}

export function PostCard({ post, onLike, onUnlike, onShowLess }: PostCardProps) {
  const timeAgo = getTimeAgo(post.createdAt)

  return (
    <CardBase gap="$sm">
      <XStack alignItems="center" gap="$xs">
        {post.author.avatarUrl ? (
          <Image
            source={{ uri: post.author.avatarUrl }}
            width={48}
            height={48}
            borderRadius={9999}
          />
        ) : (
          <YStack width={48} height={48} borderRadius={9999} backgroundColor="#857467" alignItems="center" justifyContent="center">
            <Text fontSize="$4" color="$warmWhite">{(post.author.displayName ?? '?')[0]}</Text>
          </YStack>
        )}
        <YStack flex={1}>
          <Text fontWeight="600" color="$text">{post.author.displayName ?? 'Anonymous'}</Text>
          <Text fontSize="$1" color="$textSecondary">{timeAgo}</Text>
        </YStack>
        <Button
          size="$2"
          chromeless
          onPress={() => onShowLess(post.id)}
        >
          <Text color="$textSecondary" fontSize="$2">...</Text>
        </Button>
      </XStack>

      {post.text && (
        <Text color="$text" fontSize="$3">{post.text}</Text>
      )}

      {post.media.length > 0 && (
        <PostImageGallery media={post.media} />
      )}

      <XStack alignItems="center" gap="$sm">
        <Button
          size="$3"
          chromeless
          onPress={() => post.isLiked ? onUnlike(post.id) : onLike(post.id)}
        >
          <Text color={post.isLiked ? '#894d0d' : '$textSecondary'}>
            {post.isLiked ? '♥' : '♡'} {post.likeCount > 0 ? post.likeCount : ''}
          </Text>
        </Button>
      </XStack>
    </CardBase>
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
