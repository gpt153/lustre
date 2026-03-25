import { useState, useEffect, useCallback, useRef } from 'react'
import { Alert } from 'react-native'
import { YStack, XStack, Text, Button, H2, ScrollView, Input, Label } from 'tamagui'
import * as Location from 'expo-location'
import { useSafeDate } from '../hooks/useSafeDate'

interface SafeDateProp {
  id: string
  status: string
  expiresAt: string | Date
  targetDescription: string
}

interface Props {
  safeDate: SafeDateProp
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function statusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'Aktiv'
    case 'CHECKED_IN': return 'Incheckad'
    case 'EXPIRED': return 'Utgången'
    case 'ENDED': return 'Avslutad'
    default: return status
  }
}

function statusColor(status: string): string {
  switch (status) {
    case 'ACTIVE': return '$green10'
    case 'CHECKED_IN': return '$blue10'
    case 'EXPIRED': return '$orange10'
    default: return '$colorSecondary'
  }
}

export function SafeDateActiveScreen({ safeDate }: Props) {
  const { checkin, extend, end, logGPS, refetch } = useSafeDate()

  const expiresAt = new Date(safeDate.expiresAt)
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
  )

  const [showPinModal, setShowPinModal] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isExtending, setIsExtending] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000)))
    }, 1000)
    return () => clearInterval(timer)
  }, [safeDate.expiresAt])

  // GPS polling
  const startGPS = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return

    const pollGPS = async () => {
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        await logGPS({
          id: safeDate.id,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy ?? undefined,
        })
      } catch {
        // GPS errors are non-fatal — continue polling
      }
    }

    // Initial poll
    pollGPS()
    gpsIntervalRef.current = setInterval(pollGPS, 8000)
  }, [safeDate.id, logGPS])

  useEffect(() => {
    startGPS()
    return () => {
      if (gpsIntervalRef.current !== null) {
        clearInterval(gpsIntervalRef.current)
      }
    }
  }, [startGPS])

  const handleCheckin = async () => {
    setPinError(null)
    if (pinInput.length < 4 || !/^\d+$/.test(pinInput)) {
      setPinError('Ange korrekt PIN-kod.')
      return
    }
    setIsCheckingIn(true)
    try {
      await checkin({ id: safeDate.id, pin: pinInput })
      setShowPinModal(false)
      setPinInput('')
      await refetch()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Fel PIN-kod eller något gick fel.'
      setPinError(message)
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleExtend = async () => {
    setActionError(null)
    setIsExtending(true)
    try {
      await extend({ id: safeDate.id, additionalMinutes: 30 })
      await refetch()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kunde inte förlänga SafeDate.'
      setActionError(message)
    } finally {
      setIsExtending(false)
    }
  }

  const handleEnd = async () => {
    setActionError(null)
    setIsEnding(true)
    try {
      await end({ id: safeDate.id })
      await refetch()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kunde inte avsluta SafeDate.'
      setActionError(message)
    } finally {
      setIsEnding(false)
    }
  }

  const handleSOS = () => {
    Alert.alert(
      'SOS — Nödsamtal',
      'Ring 112 nu om du är i fara. SafeDate avslutas och dina nödkontakter meddelas omedelbart.',
      [
        {
          text: 'Avbryt',
          style: 'cancel',
        },
        {
          text: 'Ring 112 nu',
          style: 'destructive',
          onPress: async () => {
            try {
              await end({ id: safeDate.id })
              await refetch()
            } catch {
              // End is best-effort on SOS
            }
          },
        },
      ]
    )
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$5">
        <XStack justifyContent="space-between" alignItems="center">
          <H2 color="$color">SafeDate aktiv</H2>
          <XStack
            backgroundColor="$backgroundHover"
            borderRadius="$10"
            paddingHorizontal="$3"
            paddingVertical="$1"
          >
            <Text color={statusColor(safeDate.status)} fontWeight="600" fontSize="$3">
              {statusLabel(safeDate.status)}
            </Text>
          </XStack>
        </XStack>

        <YStack
          backgroundColor="$backgroundHover"
          borderRadius="$4"
          padding="$4"
          gap="$2"
          alignItems="center"
        >
          <Text color="$colorSecondary" fontSize="$3">Tid kvar</Text>
          <Text
            color={secondsLeft < 300 ? '$red10' : '$color'}
            fontSize={40}
            fontWeight="700"
            fontFamily="$mono"
          >
            {formatDuration(secondsLeft)}
          </Text>
        </YStack>

        <YStack gap="$1">
          <Text color="$colorSecondary" fontSize="$2">Du träffar</Text>
          <Text color="$color" fontSize="$4">{safeDate.targetDescription}</Text>
        </YStack>

        <Button
          size="$4"
          backgroundColor="$blue10"
          color="white"
          onPress={() => {
            setPinInput('')
            setPinError(null)
            setShowPinModal(true)
          }}
          disabled={isCheckingIn}
        >
          Checka in
        </Button>

        <Button
          size="$4"
          backgroundColor="$backgroundHover"
          color="$color"
          onPress={handleExtend}
          disabled={isExtending}
          opacity={isExtending ? 0.7 : 1}
        >
          {isExtending ? 'Förlänger...' : 'Förläng 30 min'}
        </Button>

        <Button
          size="$4"
          backgroundColor="$backgroundHover"
          color="$color"
          onPress={handleEnd}
          disabled={isEnding}
          opacity={isEnding ? 0.7 : 1}
        >
          {isEnding ? 'Avslutar...' : 'Avsluta SafeDate'}
        </Button>

        {actionError && (
          <Text color="$red10" textAlign="center">
            {actionError}
          </Text>
        )}

        <Button
          size="$5"
          backgroundColor="$red10"
          color="white"
          onPress={handleSOS}
          pressStyle={{ opacity: 0.85 }}
          borderRadius="$4"
        >
          🆘 SOS — Nödläge
        </Button>

        {/* PIN check-in modal */}
        {showPinModal && (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="rgba(0,0,0,0.6)"
            alignItems="center"
            justifyContent="center"
            padding="$6"
            zIndex={100}
          >
            <YStack
              backgroundColor="$background"
              borderRadius="$4"
              padding="$5"
              gap="$4"
              width="100%"
              maxWidth={360}
            >
              <Text color="$color" fontSize="$5" fontWeight="700" textAlign="center">
                Ange PIN-kod
              </Text>
              <Text color="$colorSecondary" textAlign="center">
                Verifiera att du är i säkerhet med din PIN-kod.
              </Text>

              <YStack gap="$2">
                <Label htmlFor="checkin-pin" color="$color">PIN-kod</Label>
                <Input
                  id="checkin-pin"
                  value={pinInput}
                  onChangeText={text => setPinInput(text.replace(/\D/g, '').slice(0, 8))}
                  placeholder="••••"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={8}
                  autoFocus
                />
                {pinError && (
                  <Text color="$red10" fontSize="$2">{pinError}</Text>
                )}
              </YStack>

              <XStack gap="$3">
                <Button
                  flex={1}
                  size="$4"
                  chromeless
                  onPress={() => {
                    setShowPinModal(false)
                    setPinInput('')
                    setPinError(null)
                  }}
                >
                  Avbryt
                </Button>
                <Button
                  flex={1}
                  size="$4"
                  backgroundColor="$blue10"
                  color="white"
                  onPress={handleCheckin}
                  disabled={isCheckingIn}
                  opacity={isCheckingIn ? 0.7 : 1}
                >
                  {isCheckingIn ? 'Checkar in...' : 'Checka in'}
                </Button>
              </XStack>
            </YStack>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}
