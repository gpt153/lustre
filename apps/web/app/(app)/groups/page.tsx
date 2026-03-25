'use client'

import { useState, useEffect, useRef } from 'react'
import { YStack, XStack, Text, Spinner, Button, Input } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const listQuery = trpc.group.list.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const searchQuery_trpc = trpc.group.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  )

  const groups = searchQuery.length > 0
    ? searchQuery_trpc.data ?? []
    : listQuery.data?.pages.flatMap((page) => page.groups) ?? []

  const isLoading = searchQuery.length > 0 ? searchQuery_trpc.isLoading : listQuery.isLoading

  const loadMoreRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!loadMoreRef.current || searchQuery.length > 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
          listQuery.fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [listQuery.hasNextPage, listQuery.isFetchingNextPage, searchQuery.length])

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={800} gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="700" color="$text">Groups</Text>
          <Link href="/groups/create" style={{ textDecoration: 'none' }}>
            <Button backgroundColor="$primary" borderRadius="$3" paddingHorizontal="$4">
              <Text color="white" fontWeight="600">Create Group</Text>
            </Button>
          </Link>
        </XStack>

        <Input
          placeholder="Search groups..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          fontSize="$3"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$2"
          padding="$3"
          color="$text"
          placeholderTextColor="$textSecondary"
        />

        {groups.length === 0 ? (
          <YStack alignItems="center" padding="$6">
            <Text color="$textSecondary">
              {searchQuery.length > 0 ? 'No groups found' : 'No groups yet. Create one!'}
            </Text>
          </YStack>
        ) : (
          <YStack gap="$3">
            {groups.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`} style={{ textDecoration: 'none' }}>
                <GroupCard group={group} />
              </Link>
            ))}
          </YStack>
        )}

        <div ref={loadMoreRef} style={{ height: 1 }} />

        {!searchQuery.length && listQuery.isFetchingNextPage && (
          <YStack padding="$4" alignItems="center">
            <Spinner color="$primary" />
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}

function GroupCard({ group }: {
  group: {
    id: string
    name: string
    description: string | null
    category: string
    visibility: string
    coverImageUrl: string | null
    _count: { members: number }
  }
}) {
  const descriptionSnippet = group.description
    ? group.description.length > 100
      ? group.description.substring(0, 100) + '...'
      : group.description
    : 'No description'

  return (
    <YStack
      backgroundColor="$background"
      borderRadius="$3"
      padding="$4"
      gap="$2"
      borderWidth={1}
      borderColor="$borderColor"
      hoverStyle={{ backgroundColor: '$borderColor' }}
    >
      <XStack justifyContent="space-between" alignItems="flex-start">
        <YStack flex={1} gap="$1">
          <Text fontWeight="700" color="$text" fontSize="$4">{group.name}</Text>
          <Text color="$textSecondary" fontSize="$2">{descriptionSnippet}</Text>
        </YStack>
        <YStack
          backgroundColor={group.visibility === 'PUBLIC' ? '$primary' : '$borderColor'}
          borderRadius="$2"
          paddingHorizontal="$2"
          paddingVertical="$1"
        >
          <Text
            fontSize="$1"
            fontWeight="600"
            color={group.visibility === 'PUBLIC' ? 'white' : '$text'}
          >
            {group.visibility === 'PUBLIC' ? 'OPEN' : 'PRIVATE'}
          </Text>
        </YStack>
      </XStack>
      <XStack gap="$4">
        <Text fontSize="$2" color="$textSecondary">
          {group._count.members} {group._count.members === 1 ? 'member' : 'members'}
        </Text>
        <Text fontSize="$2" color="$textSecondary">{group.category}</Text>
      </XStack>
    </YStack>
  )
}
