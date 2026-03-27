'use client'

import { YStack, XStack, Text, ScrollView, Button, Input, Label, Spinner } from 'tamagui'
import { useState, useEffect } from 'react'
import { trpc } from '@lustre/api'
import { useAuth } from '@lustre/app'
import Link from 'next/link'

export default function PaymentSettingsPage() {
  const { isAuthenticated } = useAuth()
  const [swishAmount, setSwishAmount] = useState('100')
  const [swishThreshold, setSwishThreshold] = useState('200')
  const [showAddCard, setShowAddCard] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardExpiryMonth, setCardExpiryMonth] = useState('')
  const [cardExpiryYear, setCardExpiryYear] = useState('')
  const [cardHolderName, setCardHolderName] = useState('')
  const [cardError, setCardError] = useState<string | null>(null)

  const swishStatusQuery = trpc.swishPayment.getSwishRecurringStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  })

  const cardsQuery = trpc.segpay.listCards.useQuery(undefined, {
    enabled: isAuthenticated,
  })

  const setupSwish = trpc.swishPayment.setupSwishRecurring.useMutation()
  const cancelSwish = trpc.swishPayment.cancelSwishRecurring.useMutation()
  const addCard = trpc.segpay.addCard.useMutation()
  const setDefaultCard = trpc.segpay.setDefaultCard.useMutation()
  const removeCard = trpc.segpay.removeCard.useMutation()

  useEffect(() => {
    if (swishStatusQuery.data) {
      setSwishAmount(swishStatusQuery.data.autoTopupAmount.toString())
      setSwishThreshold(swishStatusQuery.data.lowBalanceThreshold.toString())
    }
  }, [swishStatusQuery.data])

  if (!isAuthenticated) {
    return (
      <YStack padding="$4" alignItems="center" justifyContent="center" minHeight="80vh">
        <Text fontSize="$5" color="$text">
          Logga in i Lustre-appen för att se din betalningsöversikt
        </Text>
      </YStack>
    )
  }

  if (swishStatusQuery.isLoading || cardsQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" size="large" />
      </YStack>
    )
  }

  const swishEnabled = swishStatusQuery.data && swishStatusQuery.data.status === 'ACTIVE'
  const cards = cardsQuery.data ?? []

  const handleEnableSwish = async () => {
    if (!swishAmount || !swishThreshold) return
    try {
      await setupSwish.mutateAsync({
        autoTopupAmount: parseInt(swishAmount),
        lowBalanceThreshold: parseInt(swishThreshold),
      })
      swishStatusQuery.refetch()
    } catch (error) {
      console.error('Failed to setup Swish:', error)
    }
  }

  const handleDisableSwish = async () => {
    try {
      await cancelSwish.mutateAsync()
      swishStatusQuery.refetch()
    } catch (error) {
      console.error('Failed to cancel Swish:', error)
    }
  }

  const handleSetDefault = async (cardId: string) => {
    try {
      await setDefaultCard.mutateAsync({ cardId })
      cardsQuery.refetch()
    } catch (error) {
      console.error('Failed to set default card:', error)
    }
  }

  const handleRemoveCard = async (cardId: string) => {
    try {
      await removeCard.mutateAsync({ cardId })
      cardsQuery.refetch()
    } catch (error) {
      console.error('Failed to remove card:', error)
    }
  }

  const handleAddCard = async () => {
    setCardError(null)

    const month = parseInt(cardExpiryMonth)
    const year = parseInt(cardExpiryYear)

    if (!cardNumber || !cardCvv || !cardHolderName || isNaN(month) || isNaN(year)) {
      setCardError('Fyll i alla fält korrekt')
      return
    }

    if (month < 1 || month > 12) {
      setCardError('Ogiltig utgångsmånad (1-12)')
      return
    }

    try {
      await addCard.mutateAsync({
        number: cardNumber,
        cvv: cardCvv,
        expiryMonth: month,
        expiryYear: year,
        holderName: cardHolderName,
      })
      setShowAddCard(false)
      setCardNumber('')
      setCardCvv('')
      setCardExpiryMonth('')
      setCardExpiryYear('')
      setCardHolderName('')
      cardsQuery.refetch()
    } catch (error) {
      setCardError('Kunde inte lägga till kort. Kontrollera uppgifterna och försök igen.')
    }
  }

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
            Betalsätt
          </Text>
          <Text color="$textSecondary" fontSize="$3">
            Hantera automatisk påfyllning och betalkort
          </Text>
        </YStack>

        <YStack gap="$4">
          <YStack gap="$3">
            <Text fontSize="$5" fontWeight="700" color="$text">
              Automatisk påfyllning (Swish)
            </Text>

            {swishEnabled ? (
              <YStack gap="$3" padding="$4" backgroundColor="$background" borderRadius="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text color="$text" fontWeight="600">
                    Påfyllning aktiverad
                  </Text>
                  <Text fontSize="$2" color="$primary" fontWeight="600">
                    ✓ AKTIV
                  </Text>
                </XStack>

                <YStack gap="$2">
                  <Text color="$text" fontSize="$2">
                    Påfylla: {swishAmount} SEK när saldo understiger {swishThreshold} SEK
                  </Text>
                </YStack>

                <Button
                  backgroundColor="$red10"
                  onPress={handleDisableSwish}
                  disabled={cancelSwish.isPending}
                >
                  <Text color="white" fontWeight="600">
                    {cancelSwish.isPending ? 'Inaktiverar...' : 'Inaktivera påfyllning'}
                  </Text>
                </Button>
              </YStack>
            ) : (
              <YStack gap="$3" padding="$4" backgroundColor="$background" borderRadius="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text color="$text" fontWeight="600">
                    Påfyllning inaktiverad
                  </Text>
                  <Text fontSize="$2" color="$textSecondary" fontWeight="600">
                    INAKTIV
                  </Text>
                </XStack>

                <YStack gap="$3">
                  <YStack gap="$2">
                    <Label color="$text">Påfyllningsbelopp (SEK)</Label>
                    <Input
                      value={swishAmount}
                      onChangeText={setSwishAmount}
                      placeholder="100"
                      keyboardType="numeric"
                      borderWidth={1}
                      borderColor="$borderColor"
                      padding="$3"
                      borderRadius="$2"
                    />
                  </YStack>

                  <YStack gap="$2">
                    <Label color="$text">Lågt saldo-gräns (SEK)</Label>
                    <Input
                      value={swishThreshold}
                      onChangeText={setSwishThreshold}
                      placeholder="200"
                      keyboardType="numeric"
                      borderWidth={1}
                      borderColor="$borderColor"
                      padding="$3"
                      borderRadius="$2"
                    />
                  </YStack>

                  <Button
                    backgroundColor="$primary"
                    onPress={handleEnableSwish}
                    disabled={setupSwish.isPending || !swishAmount || !swishThreshold}
                  >
                    <Text color="white" fontWeight="600">
                      {setupSwish.isPending ? 'Aktiverar...' : 'Aktivera automatisk påfyllning'}
                    </Text>
                  </Button>
                </YStack>
              </YStack>
            )}
          </YStack>

          <YStack gap="$3">
            <Text fontSize="$5" fontWeight="700" color="$text">
              Betalkort
            </Text>

            {cards.length === 0 ? (
              <YStack alignItems="center" padding="$6" backgroundColor="$background" borderRadius="$2">
                <Text color="$textSecondary" marginBottom="$3">
                  Inga kort registrerade ännu
                </Text>
                {!showAddCard && (
                  <Button
                    backgroundColor="$primary"
                    onPress={() => setShowAddCard(true)}
                  >
                    <Text color="white" fontWeight="600">
                      Lägg till kort
                    </Text>
                  </Button>
                )}
              </YStack>
            ) : (
              <YStack gap="$3">
                {cards.map((card) => (
                  <YStack
                    key={card.id}
                    padding="$4"
                    backgroundColor="$background"
                    borderRadius="$2"
                    borderWidth={card.isDefault ? 2 : 1}
                    borderColor={card.isDefault ? '$primary' : '$borderColor'}
                    gap="$3"
                  >
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack flex={1}>
                        <Text color="$text" fontWeight="600">
                          Kort slutande på {card.last4}
                        </Text>
                        <Text color="$textSecondary" fontSize="$2">
                          {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                        </Text>
                      </YStack>
                      {card.isDefault && (
                        <Text fontSize="$2" color="$primary" fontWeight="600">
                          STANDARD
                        </Text>
                      )}
                    </XStack>

                    <XStack gap="$2">
                      {!card.isDefault && (
                        <Button
                          flex={1}
                          size="$3"
                          backgroundColor="$primary"
                          onPress={() => handleSetDefault(card.id)}
                          disabled={setDefaultCard.isPending}
                        >
                          <Text color="white" fontWeight="600" fontSize="$2">
                            Gör standard
                          </Text>
                        </Button>
                      )}
                      <Button
                        flex={1}
                        size="$3"
                        backgroundColor="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                        onPress={() => handleRemoveCard(card.id)}
                        disabled={removeCard.isPending}
                      >
                        <Text color="$text" fontWeight="600" fontSize="$2">
                          Ta bort
                        </Text>
                      </Button>
                    </XStack>
                  </YStack>
                ))}

                {!showAddCard && (
                  <Button
                    backgroundColor="$primary"
                    onPress={() => setShowAddCard(true)}
                  >
                    <Text color="white" fontWeight="600">
                      Lägg till nytt kort
                    </Text>
                  </Button>
                )}
              </YStack>
            )}

            {showAddCard && (
              <YStack gap="$3" padding="$4" backgroundColor="$background" borderRadius="$2" borderWidth={1} borderColor="$primary">
                <Text fontSize="$4" fontWeight="600" color="$text">
                  Lägg till nytt kort
                </Text>

                {cardError && (
                  <Text color="$red10" fontSize="$2">
                    {cardError}
                  </Text>
                )}

                <YStack gap="$2">
                  <Label color="$text">Kortinnehavare</Label>
                  <Input
                    value={cardHolderName}
                    onChangeText={setCardHolderName}
                    placeholder="Förnamn Efternamn"
                    borderWidth={1}
                    borderColor="$borderColor"
                    padding="$3"
                    borderRadius="$2"
                    autoComplete="cc-name"
                  />
                </YStack>

                <YStack gap="$2">
                  <Label color="$text">Kortnummer</Label>
                  <Input
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="1234 5678 9012 3456"
                    keyboardType="numeric"
                    borderWidth={1}
                    borderColor="$borderColor"
                    padding="$3"
                    borderRadius="$2"
                    autoComplete="cc-number"
                  />
                </YStack>

                <XStack gap="$3">
                  <YStack gap="$2" flex={1}>
                    <Label color="$text">Månad</Label>
                    <Input
                      value={cardExpiryMonth}
                      onChangeText={setCardExpiryMonth}
                      placeholder="MM"
                      keyboardType="numeric"
                      borderWidth={1}
                      borderColor="$borderColor"
                      padding="$3"
                      borderRadius="$2"
                      autoComplete="cc-exp-month"
                    />
                  </YStack>

                  <YStack gap="$2" flex={1}>
                    <Label color="$text">År</Label>
                    <Input
                      value={cardExpiryYear}
                      onChangeText={setCardExpiryYear}
                      placeholder="ÅÅÅÅ"
                      keyboardType="numeric"
                      borderWidth={1}
                      borderColor="$borderColor"
                      padding="$3"
                      borderRadius="$2"
                      autoComplete="cc-exp-year"
                    />
                  </YStack>

                  <YStack gap="$2" flex={1}>
                    <Label color="$text">CVV</Label>
                    <Input
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      placeholder="123"
                      keyboardType="numeric"
                      borderWidth={1}
                      borderColor="$borderColor"
                      padding="$3"
                      borderRadius="$2"
                      secureTextEntry
                      autoComplete="cc-csc"
                    />
                  </YStack>
                </XStack>

                <XStack gap="$2" marginTop="$2">
                  <Button
                    flex={1}
                    backgroundColor="$primary"
                    onPress={handleAddCard}
                    disabled={addCard.isPending}
                  >
                    <Text color="white" fontWeight="600">
                      {addCard.isPending ? 'Lägger till...' : 'Spara kort'}
                    </Text>
                  </Button>
                  <Button
                    flex={1}
                    backgroundColor="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                    onPress={() => {
                      setShowAddCard(false)
                      setCardError(null)
                      setCardNumber('')
                      setCardCvv('')
                      setCardExpiryMonth('')
                      setCardExpiryYear('')
                      setCardHolderName('')
                    }}
                    disabled={addCard.isPending}
                  >
                    <Text color="$text" fontWeight="600">
                      Avbryt
                    </Text>
                  </Button>
                </XStack>
              </YStack>
            )}
          </YStack>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
