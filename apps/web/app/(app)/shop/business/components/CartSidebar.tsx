'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Button, Spinner } from 'tamagui'
import { useCheckout } from '@lustre/app/src/hooks/useShop'

interface CartItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  thumbnail: string | null
}

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  swishPhone: string
}

export function CartSidebar({ isOpen, onClose, items, total, swishPhone }: CartSidebarProps) {
  const checkout = useCheckout()
  const [result, setResult] = useState<{ medusaOrderId: string } | null>(null)

  const handleCheckout = () => {
    checkout.mutate(
      { swishPhone },
      {
        onSuccess: (data) => setResult(data),
      },
    )
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '384px',
        backgroundColor: 'white',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
        zIndex: 50,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <YStack flex={1} padding="$4" gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$5" fontWeight="700" color="$text">
            Varukorg
          </Text>
          <Button
            size="$3"
            variant="outlined"
            onPress={onClose}
          >
            <Text>✕</Text>
          </Button>
        </XStack>

        {result ? (
          <YStack gap="$3" padding="$4" backgroundColor="$backgroundHover" borderRadius="$3">
            <Text fontWeight="700" color="$text">Bestellung klar!</Text>
            <Text color="$textSecondary" fontSize="$2">
              Order-ID: {result.medusaOrderId}
            </Text>
            <Text color="$textSecondary" fontSize="$2">
              Öppna Swish-appen för att betala.
            </Text>
          </YStack>
        ) : items.length === 0 ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Text color="$textSecondary">Varukorgen är tom</Text>
          </YStack>
        ) : (
          <>
            <YStack gap="$3" flex={1}>
              {items.map((item) => (
                <XStack key={item.id} gap="$3" alignItems="center">
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }}
                    />
                  )}
                  <YStack flex={1}>
                    <Text fontWeight="600" color="$text" numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text color="$textSecondary" fontSize="$2">
                      {item.quantity} × {Math.round(item.unit_price / 100)} kr
                    </Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>

            <YStack gap="$3">
              <XStack justifyContent="space-between">
                <Text fontWeight="700" color="$text">Totalt</Text>
                <Text fontWeight="700" color="$primary">
                  {Math.round(total / 100)} kr
                </Text>
              </XStack>
              <Button
                backgroundColor="$primary"
                borderRadius="$3"
                onPress={handleCheckout}
                disabled={checkout.isPending}
              >
                <XStack gap="$2" alignItems="center">
                  {checkout.isPending && <Spinner color="white" size="small" />}
                  <Text color="white" fontWeight="700">
                    Betala med Swish
                  </Text>
                </XStack>
              </Button>
              {checkout.isError && (
                <Text color="$red10" fontSize="$2">
                  Betalning misslyckades. Försök igen.
                </Text>
              )}
            </YStack>
          </>
        )}
      </YStack>
    </div>
  )
}
