'use client'

import { YStack, XStack, Text, Button, H2 } from 'tamagui'
import Link from 'next/link'

interface InvitePageProps {
  params: {
    code: string
  }
}

export default function InvitePage({ params }: InvitePageProps) {
  const { code } = params

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$background" justifyContent="center" alignItems="center" padding="$4">
      <YStack maxWidth={500} gap="$6" alignItems="center">
        {/* Header */}
        <YStack gap="$3" alignItems="center">
          <H2 color="$color" textAlign="center" fontSize="$7" fontWeight="700">
            Du har blivit inbjuden till Lustre!
          </H2>
        </YStack>

        {/* Description */}
        <Text fontSize="$4" color="$gray11" textAlign="center" lineHeight="$1.5">
          Lustre är en säker, inkluderande plattform för vuxna som vill utforska ansiktet på sex med respekt, samtycke och glädje.
        </Text>

        {/* CTA Button */}
        <Link href={`/auth/register?invite=${code}`} style={{ width: '100%' }}>
          <Button
            width="100%"
            size="$5"
            backgroundColor="$pink10"
            color="white"
            borderRadius="$4"
            fontWeight="600"
            fontSize="$4"
          >
            Gå med nu
          </Button>
        </Link>

        {/* Additional Info */}
        <YStack gap="$2" alignItems="center">
          <Text fontSize="$3" color="$gray10">
            Du får 50 welcome tokens när du registrerar dig
          </Text>
        </YStack>
      </YStack>
    </YStack>
  )
}
