'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { YStack, Text, ScrollView, XStack, Spinner, Input, Button } from 'tamagui'
import { trpc } from '@lustre/api'
import { TRPCClientError } from '@trpc/client'
import { AiQualifiedBadge } from '@lustre/app'

export default function GatekeeperConversationPage() {
  const params = useParams()
  const conversationId = params.conversationId as string

  const [balanceError, setBalanceError] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')

  const { data: conversation, isLoading } = trpc.gatekeeper.getConversation.useQuery(
    { conversationId },
    { enabled: !!conversationId }
  )

  const respondMutation = trpc.gatekeeper.respond.useMutation()

  const handleRespond = async () => {
    if (!responseMessage.trim()) return

    try {
      await respondMutation.mutateAsync({
        conversationId,
        message: responseMessage,
      })
      setResponseMessage('')
    } catch (err) {
      if (
        err instanceof TRPCClientError &&
        err.data?.code === 'PRECONDITION_FAILED'
      ) {
        setBalanceError(true)
        return
      }
      throw err
    }
  }

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
        {balanceError && (
          <XStack
            backgroundColor="#fff3cd"
            padding="$3"
            borderRadius="$2"
            alignItems="center"
            justifyContent="space-between"
            marginBottom="$4"
          >
            <YStack flex={1} gap="$1">
              <Text fontSize="$3" color="#333">
                Otillräckliga tokens.{' '}
                <Text
                  as="a"
                  href="https://pay.lovelustre.com/pay"
                  target="_blank"
                  rel="noreferrer"
                  color="#0066cc"
                  textDecorationLine="underline"
                  cursor="pointer"
                >
                  Fyll på ditt konto →
                </Text>
              </Text>
            </YStack>
            <Button
              onPress={() => setBalanceError(false)}
              backgroundColor="transparent"
              borderWidth={0}
              padding="$0"
              minHeight="auto"
              height="auto"
              cursor="pointer"
            >
              <Text fontSize="$4" color="#999">✕</Text>
            </Button>
          </XStack>
        )}

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

        {conversation.status !== 'PASSED' && conversation.status !== 'FAILED' && (
          <YStack gap="$3" marginTop="$4">
            <Input
              placeholder="Skriv ditt svar..."
              value={responseMessage}
              onChangeText={setResponseMessage}
              multiline
              minHeight={80}
              paddingHorizontal="$3"
              paddingVertical="$3"
              borderRadius="$3"
              borderWidth={1}
              borderColor="$borderColor"
            />
            <Button
              onPress={handleRespond}
              disabled={respondMutation.isPending || !responseMessage.trim()}
              opacity={respondMutation.isPending ? 0.7 : 1}
              backgroundColor="$primary"
              color="white"
            >
              {respondMutation.isPending ? (
                <XStack gap="$2" alignItems="center">
                  <Spinner size="small" color="white" />
                  <Text color="white" fontWeight="600">Skickar...</Text>
                </XStack>
              ) : (
                <Text color="white" fontWeight="600">Skicka svar</Text>
              )}
            </Button>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}
