import { useState } from 'react'
import { ScrollView, YStack, Text, Input, TextArea, Button, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'

interface CreateOrgScreenProps {
  onSuccess: (orgId: string) => void
}

const ORG_TYPES = ['CLUB', 'ASSOCIATION', 'BUSINESS', 'EVENT_COMPANY']

export function CreateOrgScreen({ onSuccess }: CreateOrgScreenProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<string>('')
  const [locationName, setLocationName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const createMutation = trpc.org.create.useMutation()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!type) newErrors.type = 'Type is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      const org = await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        type: type as any,
        locationName: locationName.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
      })
      onSuccess(org.id)
    } catch (error) {
      console.error('Error creating org:', error)
    }
  }

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack padding="$md" gap="$md">
        <Text fontSize="$6" fontWeight="600" color="$text">
          Create Organization
        </Text>

        <YStack gap="$xs">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Name
          </Text>
          <Input
            placeholder="Organization name"
            value={name}
            onChangeText={setName}
            size="$3"
            borderWidth={1}
            borderColor={errors.name ? '$red400' : '$borderColor'}
            borderRadius="$3"
            paddingHorizontal="$sm"
          />
          {errors.name && (
            <Text color="$red400" fontSize="$2">
              {errors.name}
            </Text>
          )}
        </YStack>

        <YStack gap="$xs">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Description (Optional)
          </Text>
          <TextArea
            placeholder="Describe your organization"
            value={description}
            onChangeText={setDescription}
            size="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$3"
            paddingHorizontal="$sm"
            minHeight={100}
          />
        </YStack>

        <YStack gap="$xs">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Type
          </Text>
          <YStack gap="$xs">
            {ORG_TYPES.map((orgType) => (
              <Button
                key={orgType}
                size="$3"
                backgroundColor={type === orgType ? '$primary' : '$gray300'}
                color={type === orgType ? 'white' : '$text'}
                onPress={() => setType(orgType)}
              >
                {orgType}
              </Button>
            ))}
          </YStack>
          {errors.type && (
            <Text color="$red400" fontSize="$2">
              {errors.type}
            </Text>
          )}
        </YStack>

        <YStack gap="$xs">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Location (Optional)
          </Text>
          <Input
            placeholder="e.g., Stockholm, Sweden"
            value={locationName}
            onChangeText={setLocationName}
            size="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$3"
            paddingHorizontal="$sm"
          />
        </YStack>

        <YStack gap="$xs">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Contact Email (Optional)
          </Text>
          <Input
            placeholder="contact@organization.com"
            value={contactEmail}
            onChangeText={setContactEmail}
            size="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$3"
            paddingHorizontal="$sm"
          />
        </YStack>

        <Button
          size="$4"
          backgroundColor="$primary"
          color="white"
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? <Spinner color="white" size="small" /> : 'Create Organization'}
        </Button>
      </YStack>
    </ScrollView>
  )
}
