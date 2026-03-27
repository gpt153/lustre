'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Spinner, Card } from 'tamagui'
import { trpc } from '@lustre/api'

function getIntentionSeekingLabel(seeking: string): string {
  const labels: Record<string, string> = {
    CASUAL: 'Casual',
    RELATIONSHIP: 'Relation',
    FRIENDSHIP: 'Vänskap',
    EXPLORATION: 'Utforska',
    EVENT: 'Event',
    OTHER: 'Annat',
  }
  return labels[seeking] || seeking
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: 'Aktiv',
    PAUSED: 'Pausad',
    EXPIRED: 'Utgången',
    DELETED: 'Borttagen',
  }
  return labels[status] || status
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return '#D4A843'
    case 'PAUSED':
      return '#8B7E74'
    case 'EXPIRED':
      return '#C97A7A'
    default:
      return '#8B7E74'
  }
}

export default function IntentionsPage() {
  const router = useRouter()
  const { data: intentions, isLoading, refetch } = trpc.intention.list.useQuery()
  const pauseMutation = trpc.intention.pause.useMutation()
  const resumeMutation = trpc.intention.resume.useMutation()
  const deleteMutation = trpc.intention.delete.useMutation()

  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const activeCount = intentions?.filter((i) => i.status === 'ACTIVE').length ?? 0
  const isCreateDisabled = activeCount >= 3

  const handlePause = async (intentionId: string) => {
    setActionLoading(intentionId)
    try {
      await pauseMutation.mutateAsync({ id: intentionId })
      refetch()
    } catch (error) {
      console.error('Error pausing intention:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResume = async (intentionId: string) => {
    setActionLoading(intentionId)
    try {
      await resumeMutation.mutateAsync({ id: intentionId })
      refetch()
    } catch (error) {
      console.error('Error resuming intention:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (intentionId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna intention?')) {
      return
    }
    setActionLoading(intentionId)
    try {
      await deleteMutation.mutateAsync({ id: intentionId })
      refetch()
    } catch (error) {
      console.error('Error deleting intention:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <YStack flex={1} padding="$4" maxWidth={1200} marginHorizontal="auto">
        <YStack flex={1} alignItems="center" justifyContent="center" minHeight="60vh">
          <Spinner color="$primary" />
        </YStack>
      </YStack>
    )
  }

  const intentionList = intentions ?? []

  return (
    <YStack flex={1} padding="$4" maxWidth={1200} marginHorizontal="auto">
      <YStack gap="$4" marginBottom="$6">
        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="700" color="#2C2421">
            Mina Intentioner
          </Text>
          <Text fontSize="$3" color="#8B7E74">
            Hantera dina aktiva intentioner och hitta matchningar
          </Text>
        </YStack>

        <XStack gap="$3" flexWrap="wrap">
          <Text fontSize="$2" color="#8B7E74">
            Aktiva: {activeCount}/3
          </Text>
          {isCreateDisabled && (
            <Text fontSize="$2" color="#C97A7A">
              (Maximum 3 aktiva intentioner)
            </Text>
          )}
        </XStack>

        <Link href="/discover/intentions/new" style={{ textDecoration: 'none' }}>
          <Button
            backgroundColor={isCreateDisabled ? '#D4D4D4' : '#B87333'}
            borderRadius={8}
            paddingHorizontal="$4"
            paddingVertical="$3"
            disabled={isCreateDisabled}
            opacity={isCreateDisabled ? 0.6 : 1}
          >
            <Text color="white" fontWeight="600">
              Skapa ny intention
            </Text>
          </Button>
        </Link>
      </YStack>

      {intentionList.length === 0 ? (
        <YStack alignItems="center" justifyContent="center" padding="$6" minHeight="40vh">
          <Text color="#8B7E74" fontSize="$4">
            Du har inga intentioner än. Skapa en för att börja!
          </Text>
        </YStack>
      ) : (
        <YStack gap="$4">
          {intentionList.map((intention) => (
            <Link
              key={intention.id}
              href={`/discover/intentions/${intention.id}`}
              style={{ textDecoration: 'none' }}
            >
              <Card
                bordered
                borderColor="#E0D5C8"
                borderRadius={12}
                padding="$4"
                backgroundColor="#FDF8F3"
                hoverStyle={{
                  backgroundColor: '#FAF4ED',
                }}
                cursor="pointer"
                animation="quick"
              >
                <YStack gap="$3">
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <YStack gap="$1" flex={1}>
                      <XStack gap="$2" alignItems="center">
                        <Text fontSize="$4" fontWeight="600" color="#2C2421">
                          {getIntentionSeekingLabel(intention.seeking)}
                        </Text>
                        <Text
                          fontSize="$2"
                          fontWeight="500"
                          color="white"
                          backgroundColor={getStatusColor(intention.status)}
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          borderRadius={6}
                        >
                          {getStatusLabel(intention.status)}
                        </Text>
                      </XStack>
                      <Text fontSize="$3" color="#8B7E74">
                        Ålder: {intention.ageMin}-{intention.ageMax} år
                      </Text>
                      <Text fontSize="$3" color="#8B7E74">
                        Sökradie: {intention.distanceRadiusKm} km
                      </Text>
                      {intention.status !== 'EXPIRED' && intention.status !== 'DELETED' && (
                        <Text fontSize="$2" color="#C4956A">
                          {intention.daysRemaining} dagar kvar
                        </Text>
                      )}
                    </YStack>
                  </XStack>

                  {intention.kinkTags && intention.kinkTags.length > 0 && (
                    <YStack gap="$1">
                      <Text fontSize="$2" fontWeight="500" color="#8B7E74">
                        Kink-taggar:
                      </Text>
                      <XStack gap="$2" flexWrap="wrap">
                        {intention.kinkTags.map((kt) => (
                          <Text
                            key={kt.kinkTagId}
                            fontSize="$1"
                            backgroundColor="#E0D5C8"
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                            borderRadius={4}
                            color="#2C2421"
                          >
                            {kt.kinkTag?.name || 'Tag'}
                          </Text>
                        ))}
                      </XStack>
                    </YStack>
                  )}

                  <XStack gap="$2" marginTop="$2">
                    <Button
                      flex={1}
                      size="$3"
                      backgroundColor="transparent"
                      borderWidth={2}
                      borderColor="#B87333"
                      color="#B87333"
                      onPress={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      disabled={actionLoading === intention.id}
                    >
                      <Link
                        href={`/discover/intentions/${intention.id}/edit`}
                        style={{ textDecoration: 'none', width: '100%' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Text color="#B87333" fontWeight="600">
                          Redigera
                        </Text>
                      </Link>
                    </Button>

                    {intention.status === 'ACTIVE' && (
                      <Button
                        flex={1}
                        size="$3"
                        backgroundColor="transparent"
                        borderWidth={2}
                        borderColor="#8B7E74"
                        color="#8B7E74"
                        onPress={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handlePause(intention.id)
                        }}
                        disabled={actionLoading === intention.id}
                      >
                        <Text color="#8B7E74" fontWeight="600">
                          {actionLoading === intention.id ? '...' : 'Pausa'}
                        </Text>
                      </Button>
                    )}

                    {intention.status === 'PAUSED' && (
                      <Button
                        flex={1}
                        size="$3"
                        backgroundColor="transparent"
                        borderWidth={2}
                        borderColor="#D4A843"
                        color="#D4A843"
                        onPress={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleResume(intention.id)
                        }}
                        disabled={actionLoading === intention.id}
                      >
                        <Text color="#D4A843" fontWeight="600">
                          {actionLoading === intention.id ? '...' : 'Återuppta'}
                        </Text>
                      </Button>
                    )}

                    <Button
                      flex={1}
                      size="$3"
                      backgroundColor="transparent"
                      borderWidth={2}
                      borderColor="#C97A7A"
                      color="#C97A7A"
                      onPress={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete(intention.id)
                      }}
                      disabled={actionLoading === intention.id}
                    >
                      <Text color="#C97A7A" fontWeight="600">
                        {actionLoading === intention.id ? '...' : 'Ta bort'}
                      </Text>
                    </Button>
                  </XStack>
                </YStack>
              </Card>
            </Link>
          ))}
        </YStack>
      )}
    </YStack>
  )
}
