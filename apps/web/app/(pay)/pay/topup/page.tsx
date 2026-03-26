'use client'

import { YStack, XStack, Text, ScrollView, Button, Input, Spinner } from 'tamagui'
import { useState, useEffect } from 'react'
import { trpc } from '@lustre/api'
import { useAuth } from '@lustre/app'
import Link from 'next/link'


export default function TopupPage() {
  const { isAuthenticated } = useAuth()
  const [amount, setAmount] = useState('500')
  const [selectedCardId, setSelectedCardId] = useState<string>('')
  const [showConfirm, setShowConfirm] = useState(false)

  const cardsQuery = trpc.segpay.listCards.useQuery(undefined, {
    enabled: isAuthenticated,
  })

  const topupMutation = trpc.segpay.topup.useMutation()

  useEffect(() => {
    if (cardsQuery.data && cardsQuery.data.length > 0) {
      const defaultCard = cardsQuery.data.find((c) => c.isDefault)
      setSelectedCardId(defaultCard ? defaultCard.id : cardsQuery.data[0].id)
    }
  }, [cardsQuery.data])

  if (!isAuthenticated) {
    return (
      <YStack padding="$4" alignItems="center" justifyContent="center" minHeight="80vh">
        <Text fontSize="$5" color="$text">
          Logga in i Lustre-appen för att se din betalningsöversikt
        </Text>
      </YStack>
    )
  }

  if (cardsQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" size="large" />
      </YStack>
    )
  }

  const cards = cardsQuery.data ?? []

  const handleTopup = async () => {
    if (!amount || !selectedCardId) return
    try {
      await topupMutation.mutateAsync({
        cardId: selectedCardId,
        amountSEK: parseInt(amount),
      })
      setAmount('500')
      setShowConfirm(false)
      cardsQuery.refetch()
    } catch (error) {
      console.error('Topup failed:', error)
    }
  }

  const amountInTokens = Math.round(parseInt(amount) / 0.1) // Assuming 0.1 SEK per token

  return (
    <ScrollView>
      <YStack padding="$4" gap="$6" maxWidth={600} alignSelf="center" width="100%">
        <YStack gap="$2">
          <Link href="/pay" style={{ color: '#B87333', textDecoration: 'none', marginBottom: 16 }}>
            <Text fontSize="$3" color="#B87333">
              ← Tillbaka
            </Text>
          </Link>
          <Text fontSize="$6" fontWeight="700" color="$text">
            Påfyll ditt saldo
          </Text>
          <Text color="$textSecondary" fontSize="$3">
            Välj belopp och betalkort
          </Text>
        </YStack>

        {cards.length === 0 ? (
          <YStack alignItems="center" padding="$6" gap="$3">
            <Text color="$textSecondary" fontSize="$4" textAlign="center">
              Du har inga betalkort registrerade
            </Text>
            <Link href="/pay/settings" style={{ width: '100%' }}>
              <Button flex={1} backgroundColor="$primary" width="100%">
                <Text color="white" fontWeight="600">
                  Gå till inställningar för att lägga till kort
                </Text>
              </Button>
            </Link>
          </YStack>
        ) : (
          <YStack gap="$6">
            <YStack gap="$3">
              <YStack gap="$2">
                <Text color="$text" fontWeight="600" fontSize="$3">
                  Belopp (SEK)
                </Text>
                <XStack gap="$2">
                  {[100, 250, 500, 1000].map((val) => (
                    <Button
                      key={val}
                      flex={1}
                      backgroundColor={amount === val.toString() ? '$primary' : '$background'}
                      borderWidth={1}
                      borderColor={amount === val.toString() ? '$primary' : '$borderColor'}
                      onPress={() => setAmount(val.toString())}
                    >
                      <Text
                        color={amount === val.toString() ? 'white' : '$text'}
                        fontWeight="600"
                        fontSize="$2"
                      >
                        {val}
                      </Text>
                    </Button>
                  ))}
                </XStack>
                <Input
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Eget belopp"
                  keyboardType="numeric"
                  borderWidth={1}
                  borderColor="$borderColor"
                  padding="$3"
                  borderRadius="$2"
                  marginTop="$2"
                />
              </YStack>

              <YStack
                backgroundColor="#f5f5f5"
                padding="$4"
                borderRadius="$2"
                gap="$2"
              >
                <XStack justifyContent="space-between">
                  <Text color="$textSecondary" fontSize="$3">
                    Belopp
                  </Text>
                  <Text color="$text" fontWeight="600" fontSize="$3">
                    {amount} SEK
                  </Text>
                </XStack>
                <XStack justifyContent="space-between">
                  <Text color="$textSecondary" fontSize="$3">
                    Ungefärligt antal tokens
                  </Text>
                  <Text color="$text" fontWeight="600" fontSize="$3">
                    ~{amountInTokens}
                  </Text>
                </XStack>
              </YStack>
            </YStack>

            <YStack gap="$3">
              <Text color="$text" fontWeight="600" fontSize="$3">
                Betalkort
              </Text>

              {cards.length === 1 ? (
                <YStack
                  padding="$4"
                  backgroundColor="$background"
                  borderRadius="$2"
                  borderWidth={2}
                  borderColor="$primary"
                  gap="$2"
                >
                  <Text color="$text" fontWeight="600">
                    Kort slutande på {cards[0].last4}
                  </Text>
                  <Text color="$textSecondary" fontSize="$2">
                    {cards[0].expiryMonth.toString().padStart(2, '0')}/{cards[0].expiryYear}
                  </Text>
                </YStack>
              ) : (
                <YStack gap="$2">
                  {cards.map((card) => (
                    <Button
                      key={card.id}
                      onPress={() => setSelectedCardId(card.id)}
                      backgroundColor={selectedCardId === card.id ? '$primary' : '$background'}
                      borderWidth={1}
                      borderColor={selectedCardId === card.id ? '$primary' : '$borderColor'}
                      padding="$4"
                      borderRadius="$2"
                      justifyContent="flex-start"
                    >
                      <YStack gap="$1">
                        <Text
                          color={selectedCardId === card.id ? 'white' : '$text'}
                          fontWeight="600"
                        >
                          Kort slutande på {card.last4}
                        </Text>
                        <Text
                          color={selectedCardId === card.id ? 'rgba(255,255,255,0.8)' : '$textSecondary'}
                          fontSize="$2"
                        >
                          {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                        </Text>
                        {card.isDefault && (
                          <Text
                            color={selectedCardId === card.id ? 'rgba(255,255,255,0.9)' : '$primary'}
                            fontSize="$2"
                            fontWeight="500"
                          >
                            STANDARD
                          </Text>
                        )}
                      </YStack>
                    </Button>
                  ))}
                </YStack>
              )}
            </YStack>

            {showConfirm ? (
              <YStack gap="$3" padding="$4" backgroundColor="#f5f5f5" borderRadius="$2">
                <YStack gap="$2">
                  <Text color="$text" fontSize="$4" fontWeight="700">
                    Bekräfta påfyllning
                  </Text>
                  <XStack justifyContent="space-between">
                    <Text color="$textSecondary">Belopp:</Text>
                    <Text color="$text" fontWeight="600">
                      {amount} SEK
                    </Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text color="$textSecondary">Kort:</Text>
                    <Text color="$text" fontWeight="600">
                      ****{selectedCardId && cards.find((c) => c.id === selectedCardId)?.last4}
                    </Text>
                  </XStack>
                </YStack>

                <XStack gap="$2">
                  <Button
                    flex={1}
                    backgroundColor="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                    onPress={() => setShowConfirm(false)}
                  >
                    <Text color="$text" fontWeight="600">
                      Avbryt
                    </Text>
                  </Button>
                  <Button
                    flex={1}
                    backgroundColor="$primary"
                    onPress={handleTopup}
                    disabled={topupMutation.isPending}
                  >
                    <Text color="white" fontWeight="600">
                      {topupMutation.isPending ? 'Behandlar...' : 'Bekräfta'}
                    </Text>
                  </Button>
                </XStack>
              </YStack>
            ) : (
              <Button
                backgroundColor="$primary"
                onPress={() => setShowConfirm(true)}
                disabled={!amount || !selectedCardId}
              >
                <Text color="white" fontWeight="600" fontSize="$4">
                  Fortsätt
                </Text>
              </Button>
            )}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}
