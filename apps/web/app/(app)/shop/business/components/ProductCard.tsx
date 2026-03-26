'use client'

import Link from 'next/link'
import { YStack, XStack, Text } from 'tamagui'

interface ProductCardProps {
  id: string
  title: string
  thumbnail: string | null
  price: string
}

export function ProductCard({ id, title, thumbnail, price }: ProductCardProps) {
  return (
    <Link href={`/shop/business/${id}`} style={{ textDecoration: 'none' }}>
      <YStack
        backgroundColor="$background"
        borderRadius="$3"
        overflow="hidden"
        borderWidth={1}
        borderColor="$borderColor"
        hoverStyle={{ borderColor: '$primary', opacity: 0.9 }}
        cursor="pointer"
        gap="$0"
      >
        <div
          style={{
            width: '100%',
            height: '200px',
            backgroundColor: '#E0E0E0',
            overflow: 'hidden',
          }}
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#E0E0E0' }} />
          )}
        </div>
        <YStack padding="$3" gap="$2">
          <Text fontWeight="700" color="$text" numberOfLines={2}>
            {title}
          </Text>
          <Text fontWeight="700" fontSize="$4" color="$primary">
            {price}
          </Text>
          <Text fontSize="$2" color="$textSecondary">
            Visa
          </Text>
        </YStack>
      </YStack>
    </Link>
  )
}
