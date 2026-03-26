'use client'

import { YStack, XStack, Text } from 'tamagui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useModeStore } from '@lustre/app'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const mode = useModeStore((state) => state.mode)
  const modeEmoji = mode === 'spicy' ? '🌶️' : '🌿'

  const settingsLinks = [
    { href: '/settings/gatekeeper', label: 'Gatekeeper' },
    { href: '/settings/spicy', label: `${modeEmoji} Läge` },
  ]

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={1000} gap="$4">
        <XStack gap="$4" alignItems="flex-start">
          <YStack
            width={200}
            gap="$2"
            backgroundColor="$background"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$borderColor"
            padding="$4"
          >
            <Text fontSize="$4" fontWeight="700" color="$text" marginBottom="$2">
              Settings
            </Text>
            {settingsLinks.map((link) => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <Text
                  fontSize="$3"
                  color={pathname === link.href ? '$primary' : '$text'}
                  fontWeight={pathname === link.href ? '700' : '500'}
                  padding="$2"
                  borderRadius="$2"
                  backgroundColor={pathname === link.href ? '$primaryLight' : 'transparent'}
                  hoverStyle={{
                    backgroundColor: '$backgroundHover',
                  }}
                >
                  {link.label}
                </Text>
              </Link>
            ))}
          </YStack>

          <YStack flex={1}>{children}</YStack>
        </XStack>
      </YStack>
    </YStack>
  )
}
