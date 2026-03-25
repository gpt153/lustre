'use client'

import { useState, useEffect, useRef } from 'react'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

export default function OrgsPage() {
  const listQuery = trpc.org.list.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const orgs = listQuery.data?.pages.flatMap((page) => page.orgs) ?? []

  const loadMoreRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!loadMoreRef.current) return
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
  }, [listQuery.hasNextPage, listQuery.isFetchingNextPage])

  if (listQuery.isLoading) {
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
          <Text fontSize="$6" fontWeight="700" color="$text">Organizations</Text>
          <Link href="/orgs/create" style={{ textDecoration: 'none' }}>
            <Button backgroundColor="$primary" borderRadius="$3" paddingHorizontal="$4">
              <Text color="white" fontWeight="600">Create Org</Text>
            </Button>
          </Link>
        </XStack>

        {orgs.length === 0 ? (
          <YStack alignItems="center" padding="$6">
            <Text color="$textSecondary">No organizations yet. Create one!</Text>
          </YStack>
        ) : (
          <YStack gap="$3">
            {orgs.map((org) => (
              <Link key={org.id} href={`/orgs/${org.id}`} style={{ textDecoration: 'none' }}>
                <OrgCard org={org} />
              </Link>
            ))}
          </YStack>
        )}

        <div ref={loadMoreRef} style={{ height: 1 }} />

        {listQuery.isFetchingNextPage && (
          <YStack padding="$4" alignItems="center">
            <Spinner color="$primary" />
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}

function OrgCard({ org }: {
  org: {
    id: string
    name: string
    description: string | null
    type: string
    locationName: string | null
    _count: { members: number }
    verified: boolean
  }
}) {
  const descriptionSnippet = org.description
    ? org.description.length > 100
      ? org.description.substring(0, 100) + '...'
      : org.description
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
          <XStack gap="$2" alignItems="center">
            <Text fontWeight="700" color="$text" fontSize="$4">{org.name}</Text>
            {org.verified && (
              <YStack
                backgroundColor="$primary"
                borderRadius="$2"
                paddingHorizontal="$2"
                paddingVertical="$1"
              >
                <Text fontSize="$1" fontWeight="600" color="white">VERIFIED</Text>
              </YStack>
            )}
          </XStack>
          <Text color="$textSecondary" fontSize="$2">{descriptionSnippet}</Text>
        </YStack>
        <YStack
          backgroundColor="$borderColor"
          borderRadius="$2"
          paddingHorizontal="$2"
          paddingVertical="$1"
        >
          <Text
            fontSize="$1"
            fontWeight="600"
            color="$text"
          >
            {org.type}
          </Text>
        </YStack>
      </XStack>
      <XStack gap="$4">
        <Text fontSize="$2" color="$textSecondary">
          {org._count.members} {org._count.members === 1 ? 'member' : 'members'}
        </Text>
        {org.locationName && (
          <Text fontSize="$2" color="$textSecondary">{org.locationName}</Text>
        )}
      </XStack>
    </YStack>
  )
}
