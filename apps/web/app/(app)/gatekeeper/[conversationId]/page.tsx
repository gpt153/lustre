'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { YStack, Text, ScrollView, XStack, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import { AiQualifiedBadge } from '@lustre/app'

export default function GatekeeperConversationPage() {
  const params = useParams()
  const conversationId = params.conversationId as string

  const { data: conversation, isLoading } = trpc.gatekeeper.getConversation.useQuery(
    { conversationId },
    { enabled: !!conversationId }
  )

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner size="large" color="$primary" />
      </YStack>
    )
  }

  if (!conversation) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$red10" fontSize="$4">Konversation hittades inte</Text>
      </YStack>
    )
  }

  return (
    <ScrollView flex={1}>
      <YStack padding="$4" gap="$4" maxWidth={600} marginHorizontal="auto">
        <XStack justifyContent="space-between" alignItems="center">
          <Text color="$textSecondary" fontSize="$3" fontWeight="600">
            Gatekeeper-konversation
          </Text>
          {conversation.status === 'PASSED' && <AiQualifiedBadge size="medium" />}
        </XStack>

        {conversation.status === 'FAILED' && (
          <Text color="$red10" fontSize="$3" fontWeight="600">Inte kompatibel</Text>
        )}

        {conversation.summary && (
          <YStack backgroundColor="$green3" padding="$3" borderRadius="$3" gap="$2">
            <Text color="$green11" fontSize="$2" fontWeight="bold">Sammanfattning</Text>
            <Text color="$green11" fontSize="$3">{conversation.summary}</Text>
          </YStack>
        )}

        <YStack gap="$3">
          {conversation.messages && conversation.messages.map((msg: any) => (
            <XStack
              key={msg.id}
              justifyContent={msg.role === 'USER' ? 'flex-end' : 'flex-start'}
            >
              <YStack
                backgroundColor={msg.role === 'USER' ? '$primary' : '$gray4'}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$4"
                maxWidth="80%"
              >
                <Text color={msg.role === 'USER' ? 'white' : '$text'} fontSize="$3">
                  {msg.content}
                </Text>
              </YStack>
            </XStack>
          ))}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
