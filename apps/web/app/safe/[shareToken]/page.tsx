'use client'

import { useParams } from 'next/navigation'
import { trpc } from '@lustre/api'
import { YStack, XStack, Text, H2, Spinner, ScrollView, Button } from 'tamagui'

export default function SafeDateViewPage() {
  const params = useParams()
  const shareToken = params.shareToken as string

  const { data, isLoading, error } = trpc.safedate.getLiveLocation.useQuery(
    { shareToken },
    { refetchInterval: 15000 }
  )

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="100vh" padding="$4">
        <Spinner size="large" color="$primary" />
        <Text marginTop="$3">Laddar SafeDate-information...</Text>
      </YStack>
    )
  }

  if (error || !data) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="100vh" padding="$4">
        <H2 color="$red10">Ogiltig länk</H2>
        <Text color="$gray10" marginTop="$2">Denna SafeDate-länk är ogiltig eller har löpt ut.</Text>
      </YStack>
    )
  }

  const statusColor = {
    ACTIVE: '$green10',
    CHECKED_IN: '$blue10',
    ESCALATED: '$red10',
    COMPLETED: '$gray10',
  }[data.status]

  const statusLabel = {
    ACTIVE: '🟢 Aktiv',
    CHECKED_IN: '🔵 Incheckad',
    ESCALATED: '🔴 ESKALERAD — personen har inte checkat in',
    COMPLETED: '⚫ Avslutad',
  }[data.status]

  const lastGPS = data.gpsPoints[0]

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
  }

  const minutesAgo = lastGPS
    ? Math.round((Date.now() - new Date(lastGPS.recordedAt).getTime()) / 60000)
    : null

  return (
    <ScrollView>
      <YStack padding="$4" maxWidth={600} marginHorizontal="auto">
        <H2 marginBottom="$2">SafeDate — Liveläge</H2>

        {/* Status */}
        <YStack backgroundColor="$gray2" borderRadius="$3" padding="$3" marginBottom="$3">
          <Text fontSize="$5" fontWeight="bold" color={statusColor}>{statusLabel}</Text>
          {data.status === 'ESCALATED' && data.escalatedAt && (
            <Text color="$red10" marginTop="$1">
              Eskalerades kl {formatTime(data.escalatedAt)}
            </Text>
          )}
          {data.status !== 'COMPLETED' && (
            <Text color="$gray10" marginTop="$1">
              Timer löper ut: {formatTime(data.expiresAt)}
            </Text>
          )}
        </YStack>

        {/* Last position */}
        {data.status === 'COMPLETED' ? (
          <YStack backgroundColor="$gray2" borderRadius="$3" padding="$3" marginBottom="$3">
            <Text fontWeight="bold">SafeDate avslutad</Text>
            <Text color="$gray10">Inga positionsdata tillgängliga.</Text>
          </YStack>
        ) : lastGPS ? (
          <YStack backgroundColor="$gray2" borderRadius="$3" padding="$3" marginBottom="$3">
            <Text fontWeight="bold" marginBottom="$2">Senaste position</Text>
            <Text color="$gray10" marginBottom="$1">
              {minutesAgo === 0 ? 'Just nu' : `${minutesAgo} minut${minutesAgo === 1 ? '' : 'er'} sedan`}
            </Text>
            <Text marginBottom="$2">
              {lastGPS.lat.toFixed(6)}, {lastGPS.lng.toFixed(6)}
              {lastGPS.accuracy ? ` (±${Math.round(lastGPS.accuracy)} m)` : ''}
            </Text>
            <Button
              size="$3"
              onPress={() => window.open(`https://maps.google.com/?q=${lastGPS.lat},${lastGPS.lng}`, '_blank')}
            >
              Öppna i Google Maps
            </Button>
          </YStack>
        ) : (
          <YStack backgroundColor="$gray2" borderRadius="$3" padding="$3" marginBottom="$3">
            <Text color="$gray10">Ingen position tillgänglig ännu.</Text>
          </YStack>
        )}

        {/* GPS history */}
        {data.gpsPoints.length > 0 && data.status !== 'COMPLETED' && (
          <YStack>
            <Text fontWeight="bold" marginBottom="$2">Positionshistorik (senaste 10)</Text>
            {data.gpsPoints.slice(0, 10).map((point, i) => (
              <XStack key={i} justifyContent="space-between" paddingVertical="$1" borderBottomWidth={1} borderColor="$gray4">
                <Text fontSize="$3" color="$gray11">
                  {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                </Text>
                <Text fontSize="$3" color="$gray9">{formatTime(point.recordedAt)}</Text>
              </XStack>
            ))}
          </YStack>
        )}

        <Text color="$gray8" fontSize="$2" marginTop="$4">
          Sidan uppdateras automatiskt var 15:e sekund.
        </Text>
      </YStack>
    </ScrollView>
  )
}
