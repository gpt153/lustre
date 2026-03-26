'use client'

import { YStack, XStack, Text, ScrollView, Button, Spinner } from 'tamagui'
import { useEffect, useState } from 'react'
import { trpc } from '@lustre/api'
import { useAuth } from '@lustre/app'
import Link from 'next/link'

interface TransactionGroup {
  date: string
  total: number
  transactions: Array<{
    id: string
    amount: number
    type: string
    description: string | null
    serviceRef: string | null
    createdAt: Date
  }>
}

export default function PayPage() {
  const { isAuthenticated } = useAuth()
  const [transactionGroups, setTransactionGroups] = useState<TransactionGroup[]>([])

  const balanceQuery = trpc.token.getBalance.useQuery(undefined, {
    enabled: isAuthenticated,
  })

  const historyQuery = trpc.token.getHistory.useQuery(undefined, {
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (historyQuery.data?.transactions) {
      const grouped: Record<string, TransactionGroup> = {}

      historyQuery.data.transactions.forEach((tx) => {
        const date = new Date(tx.createdAt)
        const dateStr = date.toLocaleDateString('sv-SE')

        if (!grouped[dateStr]) {
          grouped[dateStr] = {
            date: dateStr,
            total: 0,
            transactions: [],
          }
        }

        grouped[dateStr].transactions.push(tx)
        grouped[dateStr].total += tx.amount
      })

      const sorted = Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setTransactionGroups(sorted)
    }
  }, [historyQuery.data])

  if (!isAuthenticated) {
    return (
      <YStack padding="$4" alignItems="center" justifyContent="center" minHeight="80vh">
        <Text fontSize="$5" color="$text">
          Logga in i Lustre-appen för att se din betalningsöversikt
        </Text>
      </YStack>
    )
  }

  if (balanceQuery.isLoading || historyQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" size="large" />
      </YStack>
    )
  }

  const balance = balanceQuery.data?.balance ?? 0
  const balanceDecimal = balanceQuery.data?.balanceDecimal ?? '0'

  return (
    <ScrollView>
      <YStack padding="$4" gap="$6" maxWidth={600} alignSelf="center" width="100%">
        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="700" color="$text">
            Saldo
          </Text>
        </YStack>

        <YStack
          backgroundColor="#E91E63"
          borderRadius="$3"
          padding="$6"
          gap="$4"
          style={{ color: 'white' }}
        >
          <YStack gap="$2">
            <Text fontSize="$3" color="#fff" opacity={0.9}>
              Ditt saldo
            </Text>
            <YStack gap="$1">
              <Text fontSize="$8" fontWeight="700" color="#fff">
                {balanceDecimal} SEK
              </Text>
              <Text fontSize="$2" color="#fff" opacity={0.8}>
                {balance} tokens
              </Text>
            </YStack>
          </YStack>

          <XStack gap="$3">
            <Link href="/pay/topup" style={{ flex: 1 }}>
              <Button
                flex={1}
                backgroundColor="rgba(255,255,255,0.3)"
                borderColor="#fff"
                borderWidth={1}
                color="#fff"
              >
                <Text color="#fff" fontWeight="600">
                  Påfyll
                </Text>
              </Button>
            </Link>
            <Link href="/pay/settings" style={{ flex: 1 }}>
              <Button
                flex={1}
                backgroundColor="rgba(255,255,255,0.3)"
                borderColor="#fff"
                borderWidth={1}
                color="#fff"
              >
                <Text color="#fff" fontWeight="600">
                  Inställningar
                </Text>
              </Button>
            </Link>
          </XStack>
        </YStack>

        <YStack gap="$4">
          <Text fontSize="$5" fontWeight="700" color="$text">
            Transaktioner
          </Text>

          {transactionGroups.length === 0 ? (
            <YStack alignItems="center" padding="$6">
              <Text color="$textSecondary" fontSize="$3">
                Inga transaktioner ännu
              </Text>
            </YStack>
          ) : (
            transactionGroups.map((group) => (
              <YStack key={group.date} gap="$3">
                <YStack gap="$2">
                  <Text fontSize="$4" fontWeight="600" color="$text">
                    {formatDate(group.date)}
                  </Text>
                  <Text fontSize="$2" color="$textSecondary">
                    Total: {group.total.toFixed(2)} SEK
                  </Text>
                </YStack>

                {group.transactions.map((tx) => (
                  <YStack
                    key={tx.id}
                    gap="$2"
                    padding="$3"
                    backgroundColor="$background"
                    borderRadius="$2"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack flex={1} gap="$1">
                        <Text color="$text" fontWeight="500">
                          {tx.description || tx.type}
                        </Text>
                        {tx.serviceRef && (
                          <Text fontSize="$2" color="$textSecondary">
                            Ref: {tx.serviceRef}
                          </Text>
                        )}
                      </YStack>
                      <Text color={tx.amount > 0 ? '$primary' : '$text'} fontWeight="600" fontSize="$4">
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} SEK
                      </Text>
                    </XStack>
                    <Text fontSize="$1" color="$textSecondary">
                      {formatTime(new Date(tx.createdAt))}
                    </Text>
                  </YStack>
                ))}
              </YStack>
            ))
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Idag'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Igår'
  }

  return date.toLocaleDateString('sv-SE', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
