import { ScrollView } from 'react-native'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { trpc } from '@lustre/api'

const STATUS_LABELS: Record<string, string> = {
  PLACED: 'Beställd',
  PAID: 'Betald',
  SHIPPED: 'Skickad',
  DELIVERED: 'Levererad',
  COMPLETED: 'Slutförd',
}

interface OrderStatusScreenProps {
  orderId: string
  onConfirmDelivery?: () => void
}

export function OrderStatusScreen({ orderId, onConfirmDelivery }: OrderStatusScreenProps) {
  const { data: order, isLoading } = trpc.order.getStatus.useQuery({ orderId })
  const confirmDeliveryMutation = trpc.order.confirmDelivery.useMutation()

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!order) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text color="$gray10">Beställningen hittades inte</Text>
      </YStack>
    )
  }

  const timeline = [
    {
      key: 'PLACED',
      label: 'Beställd',
      date: order.placedAt ? new Date(order.placedAt) : null,
      completed: true,
    },
    {
      key: 'PAID',
      label: 'Betald',
      date: order.paidAt ? new Date(order.paidAt) : null,
      completed: !!order.paidAt,
    },
    {
      key: 'SHIPPED',
      label: 'Skickad',
      date: order.shippedAt ? new Date(order.shippedAt) : null,
      completed: !!order.shippedAt,
    },
    {
      key: 'DELIVERED',
      label: 'Levererad',
      date: order.deliveredAt ? new Date(order.deliveredAt) : null,
      completed: !!order.deliveredAt,
    },
  ]

  const currentStepIndex = timeline.findIndex((t) => !t.completed)
  const isShipped = order.status === 'SHIPPED'

  const handleConfirmDelivery = () => {
    confirmDeliveryMutation.mutate(
      { orderId },
      {
        onSuccess: () => {
          onConfirmDelivery?.()
        },
      }
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView flex={1}>
        <YStack padding="$4" gap="$4">
          {/* Order Header */}
          <YStack gap="$2" borderBottomWidth={1} borderBottomColor="$borderColor" paddingBottom="$4">
            <Text fontSize={20} fontWeight="700" color="$color">
              Beställning #{order.id.slice(0, 8).toUpperCase()}
            </Text>
            <Text fontSize={14} color="$gray10">
              Orderstatus: {STATUS_LABELS[order.status] || order.status}
            </Text>
          </YStack>

          {/* Timeline */}
          <YStack gap="$3">
            {timeline.map((step, index) => (
              <XStack key={step.key} gap="$3" alignItems="flex-start">
                <YStack alignItems="center" gap="$3">
                  <XStack
                    width={32}
                    height={32}
                    borderRadius={16}
                    backgroundColor={step.completed ? '$pink8' : '$gray6'}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text
                      fontSize={16}
                      color={step.completed ? 'white' : '$gray10'}
                      fontWeight="700"
                    >
                      {step.completed ? '✓' : step.key[0]}
                    </Text>
                  </XStack>
                  {index < timeline.length - 1 && (
                    <YStack
                      width={2}
                      flex={1}
                      backgroundColor={step.completed ? '$pink8' : '$gray6'}
                      minHeight={40}
                    />
                  )}
                </YStack>

                <YStack flex={1} paddingTop="$1" gap="$1">
                  <Text
                    fontSize={14}
                    fontWeight={step.completed ? '600' : '500'}
                    color={step.completed ? '$color' : '$gray10'}
                  >
                    {step.label}
                  </Text>
                  {step.date && (
                    <Text fontSize={12} color="$gray10">
                      {step.date.toLocaleDateString('sv-SE')} {step.date.toLocaleTimeString('sv-SE')}
                    </Text>
                  )}
                </YStack>
              </XStack>
            ))}
          </YStack>

          {/* Tracking Information */}
          {order.trackingNumber && (
            <YStack gap="$2" borderTopWidth={1} borderTopColor="$borderColor" paddingTop="$4">
              <Text fontSize={14} fontWeight="600" color="$color">
                Spårningsnummer
              </Text>
              <XStack
                backgroundColor="$gray4"
                borderRadius="$3"
                padding="$3"
                alignItems="center"
              >
                <Text fontSize={13} color="$color" fontFamily="$mono" flex={1}>
                  {order.trackingNumber}
                </Text>
              </XStack>
            </YStack>
          )}

          {/* Order Details */}
          <YStack gap="$3" borderTopWidth={1} borderTopColor="$borderColor" paddingTop="$4">
            <Text fontSize={14} fontWeight="600" color="$color">
              Orderdetaljer
            </Text>

            <YStack gap="$2">
              {order.listing?.images && order.listing.images.length > 0 && (
                <YStack
                  width="100%"
                  height={150}
                  backgroundColor="$gray6"
                  borderRadius="$3"
                />
              )}
              {order.listing?.title && (
                <Text fontSize={14} fontWeight="600" color="$color">
                  {order.listing.title}
                </Text>
              )}
            </YStack>

            <XStack justifyContent="space-between">
              <Text fontSize={13} color="$gray10">
                Belopp
              </Text>
              <Text fontSize={14} fontWeight="600" color="$color">
                {(order.amountSEK / 100).toFixed(2)} kr
              </Text>
            </XStack>

            {order.shippingOption && (
              <XStack justifyContent="space-between">
                <Text fontSize={13} color="$gray10">
                  Leverans
                </Text>
                <Text fontSize={14} fontWeight="600" color="$color">
                  {order.shippingOption}
                </Text>
              </XStack>
            )}

            {order.buyer?.displayName && (
              <XStack justifyContent="space-between">
                <Text fontSize={13} color="$gray10">
                  Köpare
                </Text>
                <Text fontSize={14} fontWeight="600" color="$color">
                  {order.buyer.displayName}
                </Text>
              </XStack>
            )}

            {order.seller?.displayName && (
              <XStack justifyContent="space-between">
                <Text fontSize={13} color="$gray10">
                  Säljare
                </Text>
                <Text fontSize={14} fontWeight="600" color="$color">
                  {order.seller.displayName}
                </Text>
              </XStack>
            )}
          </YStack>

          {/* Auto Confirm Info */}
          {order.autoConfirmAt && (
            <YStack
              backgroundColor="$blue2"
              borderRadius="$3"
              padding="$3"
              borderLeftWidth={4}
              borderLeftColor="$blue8"
            >
              <Text fontSize={12} color="$blue8" lineHeight={18}>
                Leveransen bekräftas automatiskt:{' '}
                {new Date(order.autoConfirmAt).toLocaleDateString('sv-SE')}
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* Confirm Delivery Button */}
      {isShipped && (
        <YStack padding="$4" borderTopWidth={1} borderTopColor="$borderColor">
          <Button
            onPress={handleConfirmDelivery}
            disabled={confirmDeliveryMutation.isPending}
            backgroundColor="$pink8"
            color="white"
            size="$5"
          >
            {confirmDeliveryMutation.isPending ? 'Bekräftar...' : 'Bekräfta mottagning'}
          </Button>
        </YStack>
      )}
    </YStack>
  )
}
