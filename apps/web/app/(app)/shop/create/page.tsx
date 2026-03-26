'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Button, Input } from 'tamagui'
import { trpc } from '@lustre/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CATEGORY_OPTIONS = [
  { key: 'UNDERWEAR', label: 'Underkläder' },
  { key: 'TOYS', label: 'Leksaker' },
  { key: 'FETISH_ITEMS', label: 'Fetisch' },
  { key: 'HANDMADE_GOODS', label: 'Handgjort' },
  { key: 'ACCESSORIES', label: 'Tillbehör' },
  { key: 'CLOTHING', label: 'Kläder' },
  { key: 'OTHER', label: 'Övrigt' },
]

const SHIPPING_OPTIONS = [
  { key: 'STANDARD_POST', label: 'Standardpost' },
  { key: 'EXPRESS_POST', label: 'Expresspost' },
  { key: 'PICKUP', label: 'Upphämtning' },
]

export default function CreateListingPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceSeK, setPriceSEK] = useState('')
  const [category, setCategory] = useState('OTHER')
  const [selectedShipping, setSelectedShipping] = useState<Set<string>>(new Set())
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createListingMutation = trpc.listing.create.useMutation()

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = 'Title is required'
    if (!description.trim()) newErrors.description = 'Description is required'
    if (!priceSeK.trim()) newErrors.price = 'Price is required'
    const priceNum = parseFloat(priceSeK)
    if (isNaN(priceNum) || priceNum <= 0) newErrors.price = 'Price must be a positive number'
    if (selectedShipping.size === 0) newErrors.shipping = 'Select at least one shipping option'

    const validUrls = imageUrls.filter((url) => url.trim())
    if (validUrls.length === 0) newErrors.images = 'Add at least one image URL'
    if (validUrls.length > 8) newErrors.images = 'Maximum 8 images allowed'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      const priceOre = Math.round(parseFloat(priceSeK) * 100)
      const validUrls = imageUrls.filter((url) => url.trim())

      await createListingMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        price: priceOre,
        category: category as unknown as string,
        shippingOptions: Array.from(selectedShipping) as unknown as string[],
        images: validUrls.map((url, idx) => ({
          url: url.trim(),
          order: idx,
        })),
      })

      router.push('/shop')
    } catch {
      alert('Failed to create listing. Please try again.')
    }
  }

  const toggleShipping = (option: string) => {
    const newSet = new Set(selectedShipping)
    if (newSet.has(option)) {
      newSet.delete(option)
    } else {
      newSet.add(option)
    }
    setSelectedShipping(newSet)
  }

  const addImageUrl = () => {
    if (imageUrls.length < 8) {
      setImageUrls([...imageUrls, ''])
    }
  }

  const removeImageUrl = (idx: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== idx))
  }

  const updateImageUrl = (idx: number, value: string) => {
    const newUrls = [...imageUrls]
    newUrls[idx] = value
    setImageUrls(newUrls)
  }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={600} gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="700" color="$text">Create Listing</Text>
          <Link href="/shop" style={{ textDecoration: 'none' }}>
            <Button size="$2" backgroundColor="$background" borderColor="$borderColor" borderWidth={1} borderRadius="$2">
              <Text color="$text">Cancel</Text>
            </Button>
          </Link>
        </XStack>

        <YStack gap="$3" backgroundColor="$background" borderRadius="$3" padding="$4" borderWidth={1} borderColor="$borderColor">
          <YStack gap="$2">
            <Text fontWeight="600" color="$text">Title</Text>
            <Input
              placeholder="Item title"
              value={title}
              onChangeText={setTitle}
              borderWidth={1}
              borderColor={errors.title ? '#DC2626' : '$borderColor'}
              borderRadius="$2"
              padding="$3"
              placeholderTextColor="$textSecondary"
            />
            {errors.title && <Text fontSize="$1" color="#DC2626">{errors.title}</Text>}
          </YStack>

          <YStack gap="$2">
            <Text fontWeight="600" color="$text">Description</Text>
            <textarea
              placeholder="Item description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                borderWidth: 1,
                borderColor: errors.description ? '#DC2626' : '#E5E5E5',
                borderRadius: '8px',
                padding: '12px',
                fontFamily: 'inherit',
                fontSize: '16px',
                minHeight: '120px',
                resize: 'vertical',
              }}
            />
            {errors.description && <Text fontSize="$1" color="#DC2626">{errors.description}</Text>}
          </YStack>

          <YStack gap="$2">
            <Text fontWeight="600" color="$text">Price (SEK)</Text>
            <Input
              placeholder="0.00"
              value={priceSeK}
              onChangeText={setPriceSEK}
              keyboardType="decimal"
              borderWidth={1}
              borderColor={errors.price ? '#DC2626' : '$borderColor'}
              borderRadius="$2"
              padding="$3"
              placeholderTextColor="$textSecondary"
            />
            {errors.price && <Text fontSize="$1" color="#DC2626">{errors.price}</Text>}
          </YStack>

          <YStack gap="$2">
            <Text fontWeight="600" color="$text">Category</Text>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                borderWidth: 1,
                borderColor: '#E5E5E5',
                borderRadius: '8px',
                padding: '12px',
                fontFamily: 'inherit',
                fontSize: '16px',
                backgroundColor: '#FAFAFA',
              }}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </YStack>

          <YStack gap="$2">
            <Text fontWeight="600" color="$text">Shipping Options</Text>
            <YStack gap="$2">
              {SHIPPING_OPTIONS.map((opt) => (
                <XStack key={opt.key} alignItems="center" gap="$3" padding="$2">
                  <input
                    type="checkbox"
                    checked={selectedShipping.has(opt.key)}
                    onChange={() => toggleShipping(opt.key)}
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                  />
                  <Text color="$text">{opt.label}</Text>
                </XStack>
              ))}
            </YStack>
            {errors.shipping && <Text fontSize="$1" color="#DC2626">{errors.shipping}</Text>}
          </YStack>

          <YStack gap="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontWeight="600" color="$text">Images (URLs)</Text>
              <Text fontSize="$1" color="$textSecondary">
                {imageUrls.filter((u) => u.trim()).length} / 8
              </Text>
            </XStack>
            <YStack gap="$2">
              {imageUrls.map((url, idx) => (
                <XStack key={idx} gap="$2">
                  <Input
                    flex={1}
                    placeholder={`Image URL ${idx + 1}`}
                    value={url}
                    onChangeText={(val) => updateImageUrl(idx, val)}
                    borderWidth={1}
                    borderColor="$borderColor"
                    borderRadius="$2"
                    padding="$3"
                    placeholderTextColor="$textSecondary"
                  />
                  {imageUrls.length > 1 && (
                    <Button
                      size="$2"
                      backgroundColor="#FEE2E2"
                      onPress={() => removeImageUrl(idx)}
                    >
                      <Text color="#DC2626" fontWeight="600">Remove</Text>
                    </Button>
                  )}
                </XStack>
              ))}
            </YStack>
            {errors.images && <Text fontSize="$1" color="#DC2626">{errors.images}</Text>}

            {imageUrls.filter((u) => u.trim()).length < 8 && (
              <Button
                onPress={addImageUrl}
                backgroundColor="$background"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$2"
                paddingVertical="$2"
              >
                <Text color="$text" fontWeight="600">+ Add Another Image</Text>
              </Button>
            )}
          </YStack>

          <Button
            onPress={handleSubmit}
            disabled={createListingMutation.isPending}
            backgroundColor="$primary"
            borderRadius="$3"
            paddingVertical="$3"
          >
            <Text color="white" fontWeight="700" fontSize="$4">
              {createListingMutation.isPending ? 'Creating...' : 'Create Listing'}
            </Text>
          </Button>
        </YStack>
      </YStack>
    </YStack>
  )
}
