import { useState } from 'react'
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  Label,
  H2,
  ScrollView,
} from 'tamagui'
import { useSafeDate } from '../hooks/useSafeDate'

interface SafetyContact {
  name: string
  phone: string
}

interface Props {
  onActivated?: () => void
}

const DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 tim' },
  { value: 90, label: '1,5 tim' },
  { value: 120, label: '2 tim' },
  { value: 240, label: '4 tim' },
  { value: 480, label: '8 tim' },
]

export function SafeDateActivateScreen({ onActivated }: Props) {
  const { activate } = useSafeDate()

  const [targetDescription, setTargetDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number>(60)
  const [pin, setPin] = useState('')
  const [contacts, setContacts] = useState<SafetyContact[]>([])
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addContact = () => {
    const name = newContactName.trim()
    const phone = newContactPhone.trim()
    if (!name || !phone) return
    setContacts(prev => [...prev, { name, phone }])
    setNewContactName('')
    setNewContactPhone('')
  }

  const removeContact = (index: number) => {
    setContacts(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setError(null)

    if (!targetDescription.trim()) {
      setError('Ange vem du träffar.')
      return
    }
    if (pin.length < 4 || pin.length > 8 || !/^\d+$/.test(pin)) {
      setError('PIN-koden måste vara 4–8 siffror.')
      return
    }

    setIsSubmitting(true)
    try {
      await activate({
        targetDescription: targetDescription.trim(),
        durationMinutes,
        safetyContacts: contacts,
        pin,
      })
      onActivated?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Något gick fel. Försök igen.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ScrollView>
      <YStack padding="$md" gap="$md">
        <H2 color="$color">SafeDate</H2>
        <Text color="$colorSecondary">
          SafeDate håller koll på dig under din dejt och meddelar dina kontakter om du inte checkar in i tid.
        </Text>

        <YStack gap="$xs">
          <Label htmlFor="target-description" color="$color">
            Vem träffar du?
          </Label>
          <Input
            id="target-description"
            value={targetDescription}
            onChangeText={setTargetDescription}
            placeholder="Beskrivning..."
            maxLength={200}
            autoCapitalize="sentences"
          />
        </YStack>

        <YStack gap="$xs">
          <Label color="$color">Varaktighet</Label>
          <XStack flexWrap="wrap" gap="$xs">
            {DURATION_OPTIONS.map(option => (
              <Button
                key={option.value}
                size="$3"
                backgroundColor={durationMinutes === option.value ? '$pink10' : '$backgroundHover'}
                color={durationMinutes === option.value ? 'white' : '$color'}
                onPress={() => setDurationMinutes(option.value)}
                minWidth={80}
              >
                {option.label}
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$xs">
          <Label htmlFor="pin-input" color="$color">
            PIN-kod (4–8 siffror)
          </Label>
          <Input
            id="pin-input"
            value={pin}
            onChangeText={text => setPin(text.replace(/\D/g, '').slice(0, 8))}
            placeholder="••••"
            keyboardType="numeric"
            secureTextEntry
            maxLength={8}
          />
          <Text color="$colorSecondary" fontSize="$2">
            Används för att checka in och verifiera att du är i säkerhet.
          </Text>
        </YStack>

        <YStack gap="$sm">
          <Label color="$color">Säkerhetskontakter ({contacts.length})</Label>
          <Text color="$colorSecondary" fontSize="$2">
            Dessa kontakter meddelas via SMS om du inte checkar in i tid.
          </Text>

          {contacts.map((contact, index) => (
            <XStack
              key={index}
              alignItems="center"
              justifyContent="space-between"
              backgroundColor="$backgroundHover"
              borderRadius="$3"
              padding="$sm"
              gap="$xs"
            >
              <YStack flex={1}>
                <Text color="$color" fontWeight="600">{contact.name}</Text>
                <Text color="$colorSecondary" fontSize="$2">{contact.phone}</Text>
              </YStack>
              <Button
                size="$2"
                chromeless
                onPress={() => removeContact(index)}
              >
                <Text color="$red10">Ta bort</Text>
              </Button>
            </XStack>
          ))}

          <YStack gap="$xs" borderWidth={1} borderColor="$borderColor" borderRadius="$3" padding="$sm">
            <Label color="$color" fontSize="$2">Lägg till kontakt</Label>
            <Input
              value={newContactName}
              onChangeText={setNewContactName}
              placeholder="Namn"
              autoCapitalize="words"
            />
            <Input
              value={newContactPhone}
              onChangeText={setNewContactPhone}
              placeholder="Telefonnummer"
              keyboardType="phone-pad"
            />
            <Button
              size="$3"
              onPress={addContact}
              disabled={!newContactName.trim() || !newContactPhone.trim()}
              backgroundColor="$backgroundHover"
            >
              + Lägg till kontakt
            </Button>
          </YStack>
        </YStack>

        {error && (
          <Text color="$red10" textAlign="center">
            {error}
          </Text>
        )}

        <Button
          size="$4"
          backgroundColor="$pink10"
          color="white"
          onPress={handleSubmit}
          disabled={isSubmitting}
          opacity={isSubmitting ? 0.7 : 1}
        >
          {isSubmitting ? 'Startar...' : 'Starta SafeDate'}
        </Button>
      </YStack>
    </ScrollView>
  )
}
