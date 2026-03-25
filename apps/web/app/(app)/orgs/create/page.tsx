'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Button, Input, TextArea, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import { useRouter } from 'next/navigation'

type OrgType = 'CLUB' | 'ASSOCIATION' | 'BUSINESS' | 'EVENT_COMPANY'

export default function CreateOrgPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<OrgType>('CLUB')
  const [locationName, setLocationName] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  const createMutation = trpc.org.create.useMutation()

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Please fill in the organization name')
      return
    }

    try {
      const result = await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        locationName: locationName.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
      })
      router.push(`/orgs/${result.id}`)
    } catch (error) {
      console.error('Failed to create organization:', error)
      alert('Failed to create organization')
    }
  }

  const orgTypes: OrgType[] = ['CLUB', 'ASSOCIATION', 'BUSINESS', 'EVENT_COMPANY']

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={600} gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$text">Create Organization</Text>

        <YStack gap="$2">
          <Text fontWeight="600" color="$text" fontSize="$3">Organization Name</Text>
          <Input
            placeholder="Enter organization name..."
            value={name}
            onChangeText={setName}
            fontSize="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$2"
            padding="$3"
            color="$text"
            placeholderTextColor="$textSecondary"
          />
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600" color="$text" fontSize="$3">Description</Text>
          <TextArea
            placeholder="Describe your organization..."
            value={description}
            onChangeText={(val: string) => setDescription(val)}
            maxLength={1000}
            fontSize="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$2"
            padding="$3"
            color="$text"
            minHeight={100}
            placeholderTextColor="$textSecondary"
          />
          <Text fontSize="$1" color="$textSecondary">{description.length}/1000</Text>
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600" color="$text" fontSize="$3">Organization Type</Text>
          <XStack gap="$2" flexWrap="wrap">
            {orgTypes.map((orgType) => (
              <Button
                key={orgType}
                flex={1}
                minWidth="48%"
                backgroundColor={type === orgType ? '$primary' : '$borderColor'}
                borderRadius="$3"
                paddingVertical="$3"
                onPress={() => setType(orgType)}
              >
                <Text color={type === orgType ? 'white' : '$text'} fontWeight="600" fontSize="$2">
                  {orgType.replace(/_/g, ' ')}
                </Text>
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600" color="$text" fontSize="$3">Location Name</Text>
          <Input
            placeholder="e.g., Stockholm, Sweden"
            value={locationName}
            onChangeText={setLocationName}
            fontSize="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$2"
            padding="$3"
            color="$text"
            placeholderTextColor="$textSecondary"
          />
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600" color="$text" fontSize="$3">Contact Email</Text>
          <Input
            placeholder="contact@example.com"
            value={contactEmail}
            onChangeText={setContactEmail}
            fontSize="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$2"
            padding="$3"
            color="$text"
            placeholderTextColor="$textSecondary"
          />
        </YStack>

        <Button
          backgroundColor="$primary"
          borderRadius="$3"
          paddingVertical="$4"
          onPress={handleSubmit}
          disabled={!name.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? (
            <Spinner color="white" size="small" />
          ) : (
            <Text color="white" fontWeight="600" fontSize="$4">Create Organization</Text>
          )}
        </Button>
      </YStack>
    </YStack>
  )
}
