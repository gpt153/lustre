'use client'

import { useState, useEffect } from 'react'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

export default function OrderStatusPage({ params }: { params: { orderId: string } }) {
  const [autoRefetch, setAutoRefetch] = useState(true)

  const orderQuery = trpc.order.getStatus.useQuery(
    { orderId: params.orderId },
    { refetchInterval: autoRefetch ? 5000 : false }
  )

  const confirmDeliveryMutation = trpc.order.confirmDelivery.useMutation()

  const handleConfirmDelivery = async () => {
    try {
      await confirmDeliveryMutation.mutateAsync({ orderId: params.orderId })
      orderQuery.refetch()
    } catch (error) {
      alert('Failed to confirm delivery')
    }
  }

  useEffect(() => {
    if (orderQuery.data?.status === 'DELIVERED' || orderQuery.data?.status === 'CANCELLED') {
      setAutoRefetch(false)
    }
  }, [orderQuery.data?.status])

  if (orderQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!orderQuery.data) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary">Order not found</Text>
      </YStack>
    )
  }

  const order = orderQuery.data
  const currentStatusIndex = STATUS_ORDER.indexOf(order.status)

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={800} gap="$6">
        <Link href="/shop" style={{ textDecoration: 'none' }}>
          <Button
            size="$2"
            backgroundColor="$background"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$2"
            paddingHorizontal="$3"
          >
            <Text color="$text">← Back</Text>
          </Button>
        </Link>

        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="700" color="$text">Order #{order.id.slice(0, 8).toUpperCase()}</Text>
          <Text fontSize="$3" color="$textSecondary">
            Placed on {new Date(order.createdAt).toLocaleDateString('sv-SE')}
          </Text>
        </YStack>

        <YStack gap="$4" backgroundColor="$background" borderRadius="$3" padding="$4" borderWidth={1} borderColor="$borderColor">
          <YStack gap="$4">
            {STATUS_ORDER.map((status, idx) => {
              const statusData = order.timeline.find((t) => t.status === status)
              const isCompleted = idx <= currentStatusIndex
              const isCurrent = idx === currentStatusIndex

              return (
                <XStack key={status} alignItems="flex-start" gap="$3">
                  <YStack alignItems="center" gap="$2">
                    <YStack
                      width={40}
                      height={40}
                      borderRadius={20}
                      backgroundColor={isCompleted ? '$primary' : '$borderColor'}
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={isCurrent ? 3 : 0}
                      borderColor={isCurrent ? '$primary' : undefined}
                    >
                      <Text fontWeight="700" color={isCompleted ? 'white' : '$textSecondary'} fontSize="$3">
                        {idx + 1}
                      </Text>
                    </YStack>
                    {idx < STATUS_ORDER.length - 1 && (
                      <div style={{
                        width: 2,
                        height: 60,
                        backgroundColor: idx < currentStatusIndex ? '#B87333' : '#E5E5E5',
                      }} />
                    )}
                  </YStack>

                  <YStack flex={1} paddingTop="$2" gap="$1">
                    <Text fontWeight="700" color="$text" fontSize="$3">
                      {STATUS_LABELS[status]}
                    </Text>
                    {statusData && (
                      <Text fontSize="$2" color="$textSecondary">
                        {new Date(statusData.timestamp).toLocaleString('sv-SE')}
                      </Text>
                    )}
                  </YStack>
                </XStack>
              )
            })}
          </YStack>
        </YStack>

        {order.trackingNumber && (
          <YStack gap="$2" backgroundColor="$background" borderRadius="$3" padding="$4" borderWidth={1} borderColor="$borderColor">
            <Text fontWeight="600" color="$text">Tracking Number</Text>
            <Text fontSize="$4" fontWeight="700" color="$primary" fontFamily="monospace">
              {order.trackingNumber}
            </Text>
          </YStack>
        )}

        {order.status === 'SHIPPED' && order.isBuyer && (
          <Button
            onPress={handleConfirmDelivery}
            disabled={confirmDeliveryMutation.isPending}
            backgroundColor="$primary"
            borderRadius="$3"
            paddingVertical="$3"
          >
            <Text color="white" fontWeight="700" fontSize="$4">
              {confirmDeliveryMutation.isPending ? 'Confirming...' : 'Confirm Delivery'}
            </Text>
          </Button>
        )}
      </YStack>
    </YStack>
  )
}
