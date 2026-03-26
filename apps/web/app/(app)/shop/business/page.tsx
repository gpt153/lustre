'use client'

import { useState, useDeferredValue } from 'react'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import { useProducts } from '@lustre/app/src/hooks/useShop'
import { ProductCard } from './components/ProductCard'

export default function BusinessShopPage() {
  const [searchInput, setSearchInput] = useState('')
  const q = useDeferredValue(searchInput)

  const { data, isLoading } = useProducts({ q: q || undefined })
  const products = data?.products ?? []

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={1200} gap="$6">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="700" color="$text">
            Företagsbutiker
          </Text>
        </XStack>

        <input
          type="search"
          placeholder="Sök produkter..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 16,
            width: '100%',
            maxWidth: 400,
          }}
        />

        {isLoading ? (
          <YStack alignItems="center" padding="$8">
            <Spinner color="$primary" />
          </YStack>
        ) : products.length === 0 ? (
          <YStack alignItems="center" padding="$8">
            <Text color="$textSecondary" fontSize="$4">
              Inga produkter ännu
            </Text>
          </YStack>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {products.map((product) => {
              const variant = product.variants?.[0]
              const priceAmount = variant?.calculated_price?.calculated_amount
              const price =
                priceAmount !== undefined ? `${Math.round(priceAmount / 100)} kr` : 'Pris saknas'

              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  thumbnail={product.thumbnail}
                  price={price}
                />
              )
            })}
          </div>
        )}
      </YStack>
    </YStack>
  )
}
