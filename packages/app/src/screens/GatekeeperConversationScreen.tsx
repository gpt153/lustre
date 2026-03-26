import { useState, useRef, useEffect } from 'react'
import { FlatList } from 'react-native'
import { YStack, XStack, Text, Input, Button } from 'tamagui'
import { useGatekeeper } from '../hooks/useGatekeeper'
import { AiQualifiedBadge } from '../components/AiQualifiedBadge'
import { InsufficientBalanceModal } from '../components/InsufficientBalanceModal'

interface Message {
  role: 'USER' | 'AI'
  content: string
}

interface GatekeeperConversationScreenProps {
  recipientId: string
  recipientName: string
  onComplete?: (result: { passed: boolean; summary?: string }) => void
}

export function GatekeeperConversationScreen({
  recipientId,
  recipientName,
  onComplete,
}: GatekeeperConversationScreenProps) {
  const { initiate, respond, isInitiating, isResponding } = useGatekeeper()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [decision, setDecision] = useState<'CONTINUE' | 'PASS' | 'FAIL' | null>(null)
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  const isComplete = decision === 'PASS' || decision === 'FAIL'
  const isLoading = isInitiating || isResponding

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading || isComplete) return

    setInput('')
    setMessages(prev => [...prev, { role: 'USER', content: text }])

    if (!conversationId) {
      const result = await initiate(recipientId, text)
      setConversationId(result.conversationId)
      setMessages(prev => [...prev, { role: 'AI', content: result.aiMessage }])
      setDecision(result.decision)
      if (result.decision === 'PASS' || result.decision === 'FAIL') {
        onComplete?.({ passed: result.decision === 'PASS', summary: result.summary })
      }
    } else {
      const result = await respond(conversationId, text)
      if ('error' in result && result.error === 'INSUFFICIENT_BALANCE') {
        setShowBalanceModal(true)
        return
      }
      setMessages(prev => [...prev, { role: 'AI', content: result.aiMessage }])
      setDecision(result.decision)
      if (result.decision === 'PASS' || result.decision === 'FAIL') {
        onComplete?.({ passed: result.decision === 'PASS', summary: result.summary })
      }
    }
  }

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true })
  }, [messages])

  const renderMessage = ({ item }: { item: Message }) => (
    <XStack
      justifyContent={item.role === 'USER' ? 'flex-end' : 'flex-start'}
      paddingHorizontal="$3"
      paddingVertical="$1"
    >
      <YStack
        backgroundColor={item.role === 'USER' ? '$primary' : '$gray4'}
        paddingHorizontal="$3"
        paddingVertical="$2"
        borderRadius="$4"
        maxWidth="80%"
      >
        <Text color={item.role === 'USER' ? 'white' : '$text'}>
          {item.content}
        </Text>
      </YStack>
    </XStack>
  )

  return (
    <>
      <YStack flex={1}>
        <YStack padding="$3" borderBottomWidth={1} borderColor="$borderColor">
          <Text color="$textSecondary" fontSize="$2">
            Gatekeeper för {recipientName}
          </Text>
          {decision === 'PASS' && (
            <XStack alignItems="center" gap="$2" marginTop="$1">
              <AiQualifiedBadge />
              <Text color="$green11" fontSize="$2">Kvalificerad!</Text>
            </XStack>
          )}
          {decision === 'FAIL' && (
            <Text color="$red10" fontSize="$2" marginTop="$1">
              Inte kompatibel just nu
            </Text>
          )}
        </YStack>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, index) => index.toString()}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 8 }}
        />

        {!isComplete && (
          <XStack padding="$3" gap="$2" borderTopWidth={1} borderColor="$borderColor">
            <Input
              flex={1}
              value={input}
              onChangeText={setInput}
              placeholder="Skriv ett meddelande..."
              onSubmitEditing={sendMessage}
              editable={!isLoading}
            />
            <Button
              onPress={sendMessage}
              backgroundColor="$primary"
              color="white"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? '...' : 'Skicka'}
            </Button>
          </XStack>
        )}
      </YStack>
      <InsufficientBalanceModal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
      />
    </>
  )
}
