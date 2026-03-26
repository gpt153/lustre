import { useState } from 'react'
import { ScrollView, TouchableOpacity, Alert } from 'react-native'
import { YStack, XStack, Text, Input, Button, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import * as ImagePicker from 'expo-image-picker'

type Category = 'UNDERWEAR' | 'TOYS' | 'FETISH_ITEMS' | 'HANDMADE_GOODS' | 'ACCESSORIES' | 'CLOTHING' | 'OTHER'
type ShippingOption = 'STANDARD_POST' | 'EXPRESS_POST' | 'PICKUP'

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'Underkläder', value: 'UNDERWEAR' },
  { label: 'Leksaker', value: 'TOYS' },
  { label: 'Fetisch', value: 'FETISH_ITEMS' },
  { label: 'Handgjort', value: 'HANDMADE_GOODS' },
  { label: 'Tillbehör', value: 'ACCESSORIES' },
  { label: 'Kläder', value: 'CLOTHING' },
  { label: 'Övrigt', value: 'OTHER' },
]

const SHIPPING_OPTIONS: { label: string; value: ShippingOption }[] = [
  { label: 'Standardpost', value: 'STANDARD_POST' },
  { label: 'Expresspost', value: 'EXPRESS_POST' },
  { label: 'Upphämtning', value: 'PICKUP' },
]

interface CreateListingScreenProps {
  onSuccess: () => void
}

export function CreateListingScreen({ onSuccess }: CreateListingScreenProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceInSEK, setPriceInSEK] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('UNDERWEAR')
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption[]>([])
  const [imageUris, setImageUris] = useState<string[]>([])

  const createMutation = trpc.listing.create.useMutation()

  const handlePickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      })

      if (!result.canceled) {
        const newUris = result.assets.map((asset) => asset.uri).slice(0, 8 - imageUris.length)
        setImageUris([...imageUris, ...newUris])
      }
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte välja bilder')
    }
  }

  const handleRemoveImage = (index: number) => {
    setImageUris(imageUris.filter((_, i) => i !== index))
  }

  const toggleShippingOption = (option: ShippingOption) => {
    setSelectedShipping((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    )
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Fel', 'Titel är obligatorisk')
      return
    }

    if (!priceInSEK.trim()) {
      Alert.alert('Fel', 'Pris är obligatoriskt')
      return
    }

    if (selectedShipping.length === 0) {
      Alert.alert('Fel', 'Välj minst ett leveransalternativ')
      return
    }

    const priceInÖre = Math.round(parseFloat(priceInSEK) * 100)

    createMutation.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        price: priceInÖre,
        category: selectedCategory,
        shippingOptions: selectedShipping,
        imageUris,
      },
      {
        onSuccess: () => {
          onSuccess()
        },
        onError: (error) => {
          Alert.alert('Fel', error.message || 'Kunde inte skapa annonsen')
        },
      }
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView flex={1}>
        <YStack padding="$4" gap="$4">
          <YStack gap="$2">
            <Text fontSize={16} fontWeight="600" color="$color">
              Titel
            </Text>
            <Input
              placeholder="Vad säljer du?"
              value={title}
              onChangeText={setTitle}
              fontSize={14}
              padding="$3"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$3"
            />
          </YStack>

          <YStack gap="$2">
            <Text fontSize={16} fontWeight="600" color="$color">
              Beskrivning
            </Text>
            <Input
              placeholder="Beskriv varan..."
              value={description}
              onChangeText={setDescription}
              fontSize={14}
              padding="$3"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$3"
              minHeight={100}
              multiline
              textAlignVertical="top"
            />
          </YStack>

          <YStack gap="$2">
            <Text fontSize={16} fontWeight="600" color="$color">
              Pris (SEK)
            </Text>
            <Input
              placeholder="0"
              value={priceInSEK}
              onChangeText={setPriceInSEK}
              fontSize={14}
              padding="$3"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$3"
              keyboardType="decimal-pad"
            />
          </YStack>

          <YStack gap="$2">
            <Text fontSize={16} fontWeight="600" color="$color">
              Kategori
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  onPress={() => setSelectedCategory(cat.value)}
                >
                  <XStack
                    backgroundColor={selectedCategory === cat.value ? '$pink8' : '$gray4'}
                    borderRadius="$2"
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                  >
                    <Text
                      fontSize={12}
                      fontWeight={selectedCategory === cat.value ? '600' : '500'}
                      color={selectedCategory === cat.value ? 'white' : '$color'}
                    >
                      {cat.label}
                    </Text>
                  </XStack>
                </TouchableOpacity>
              ))}
            </XStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize={16} fontWeight="600" color="$color">
              Leveransalternativ
            </Text>
            <YStack gap="$2">
              {SHIPPING_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => toggleShippingOption(option.value)}
                >
                  <XStack
                    backgroundColor={selectedShipping.includes(option.value) ? '$pink2' : '$gray4'}
                    borderRadius="$2"
                    padding="$3"
                    borderWidth={1}
                    borderColor={selectedShipping.includes(option.value) ? '$pink8' : '$gray6'}
                  >
                    <Text
                      fontSize={13}
                      color={selectedShipping.includes(option.value) ? '$pink8' : '$color'}
                      fontWeight={selectedShipping.includes(option.value) ? '600' : '500'}
                    >
                      {selectedShipping.includes(option.value) ? '✓ ' : ''} {option.label}
                    </Text>
                  </XStack>
                </TouchableOpacity>
              ))}
            </YStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize={16} fontWeight="600" color="$color">
              Bilder (max 8)
            </Text>
            <TouchableOpacity onPress={handlePickImages} disabled={imageUris.length >= 8}>
              <XStack
                backgroundColor={imageUris.length >= 8 ? '$gray6' : '$pink2'}
                borderRadius="$3"
                padding="$4"
                alignItems="center"
                justifyContent="center"
                opacity={imageUris.length >= 8 ? 0.5 : 1}
              >
                <Text
                  fontSize={14}
                  fontWeight="600"
                  color={imageUris.length >= 8 ? '$gray10' : '$pink8'}
                >
                  + Lägg till bild ({imageUris.length}/8)
                </Text>
              </XStack>
            </TouchableOpacity>

            {imageUris.length > 0 && (
              <XStack gap="$2" flexWrap="wrap">
                {imageUris.map((uri, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <YStack
                      width={80}
                      height={80}
                      backgroundColor="$gray6"
                      borderRadius="$2"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize={24}>✕</Text>
                    </YStack>
                  </TouchableOpacity>
                ))}
              </XStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>

      <YStack padding="$4" borderTopWidth={1} borderTopColor="$borderColor" gap="$2">
        <Button
          onPress={handleSubmit}
          disabled={createMutation.isPending}
          backgroundColor="$pink8"
          color="white"
          size="$5"
        >
          {createMutation.isPending ? 'Publicerar...' : 'Publicera annons'}
        </Button>
      </YStack>
    </YStack>
  )
}
