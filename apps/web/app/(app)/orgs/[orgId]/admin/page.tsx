'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'

export default function OrgAdminPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string

  const orgQuery = trpc.org.get.useQuery({ orgId })
  const membersQuery = trpc.org.getMembers.useQuery({ orgId })
  const verificationMutation = trpc.org.requestVerification.useMutation()
  const [verificationRequested, setVerificationRequested] = React.useState(false)

  if (orgQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!orgQuery.data) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary">Organization not found</Text>
      </YStack>
    )
  }

  const org = orgQuery.data
  const canAdmin = org.memberRole === 'OWNER' || org.memberRole === 'ADMIN'

  if (!canAdmin) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary">You do not have permission to access this page</Text>
      </YStack>
    )
  }

  const handleRequestVerification = async () => {
    try {
      await verificationMutation.mutateAsync({ orgId })
      setVerificationRequested(true)
    } catch (error) {
      console.error('Failed to request verification:', error)
      alert('Failed to request verification')
    }
  }

  const members = membersQuery.data ?? []

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={800} gap="$4">
        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="700" color="$text">Administer: {org.name}</Text>
        </YStack>

        <YStack backgroundColor="$background" borderRadius="$3" padding="$4" gap="$3" borderWidth={1} borderColor="$borderColor">
          <YStack gap="$2">
            <Text fontWeight="600" color="$text" fontSize="$4">Verification</Text>
            {org.verified ? (
              <YStack
                backgroundColor="$borderColor"
                borderRadius="$2"
                paddingHorizontal="$3"
                paddingVertical="$2"
              >
                <Text color="$text" fontWeight="600">This organization is verified</Text>
              </YStack>
            ) : (
              <Button
                backgroundColor="$primary"
                borderRadius="$3"
                paddingHorizontal="$4"
                paddingVertical="$2"
                onPress={handleRequestVerification}
                disabled={verificationRequested || verificationMutation.isPending}
              >
                {verificationMutation.isPending ? (
                  <Spinner color="white" size="small" />
                ) : (
                  <Text color="white" fontWeight="600">
                    {verificationRequested ? 'Verification Requested' : 'Request Verification'}
                  </Text>
                )}
              </Button>
            )}
          </YStack>
        </YStack>

        <YStack gap="$3">
          <Text fontSize="$5" fontWeight="700" color="$text">Members</Text>
          {membersQuery.isLoading ? (
            <YStack alignItems="center" padding="$4">
              <Spinner color="$primary" />
            </YStack>
          ) : members.length === 0 ? (
            <Text color="$textSecondary">No members</Text>
          ) : (
            <YStack gap="$2" borderWidth={1} borderColor="$borderColor" borderRadius="$3" padding="$3">
              {members.map((member) => (
                <XStack key={member.userId} alignItems="center" gap="$2" paddingVertical="$2" justifyContent="space-between">
                  <XStack alignItems="center" gap="$2" flex={1}>
                    <YStack
                      width={36}
                      height={36}
                      borderRadius={18}
                      backgroundColor="$borderColor"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="$3" fontWeight="600">
                        {(member.user.displayName ?? '?')[0]}
                      </Text>
                    </YStack>
                    <YStack flex={1}>
                      <Text fontWeight="600" color="$text">{member.user.displayName ?? 'Anonymous'}</Text>
                      <Text fontSize="$1" color="$textSecondary">Joined {formatDate(member.joinedAt)}</Text>
                    </YStack>
                  </XStack>
                  <YStack
                    backgroundColor="$borderColor"
                    borderRadius="$2"
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                  >
                    <Text fontSize="$1" fontWeight="600" color="$text">
                      {member.role}
                    </Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          )}
        </YStack>
      </YStack>
    </YStack>
  )
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths}m ago`
  return d.toLocaleDateString()
}
