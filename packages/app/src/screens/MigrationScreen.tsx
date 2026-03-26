import { useState } from 'react'
import { YStack, XStack, Text, H2, Button, Input, ScrollView, Spinner, Image } from 'tamagui'
import { useMigration } from '../hooks/useMigration'

export function MigrationScreen() {
  const { triggerPreview, previewQuery, importMutation } = useMigration()
  const [localUsername, setLocalUsername] = useState('')
  const [consent, setConsent] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)

  const handlePreview = () => {
    if (!localUsername.trim()) return
    triggerPreview(localUsername)
  }

  const handleImport = () => {
    if (!previewQuery.data || !consent) return
    importMutation.mutate(
      {
        username: previewQuery.data.username,
        bio: previewQuery.data.bio || undefined,
        photoUrls: previewQuery.data.photoUrls,
        consent: true,
      },
      {
        onSuccess: () => {
          setImportSuccess(true)
        },
      }
    )
  }

  if (importSuccess) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
        <Text fontSize="$8">
        </Text>
        <H2 color="$text" textAlign="center">
          Klar!
        </H2>
        <Text fontSize="$4" color="$textSecondary" textAlign="center">
          Din profil har uppdaterats.
        </Text>
        <Button
          onPress={() => {
            setImportSuccess(false)
            setLocalUsername('')
            setConsent(false)
          }}
          backgroundColor="$backgroundHover"
          color="$text"
          marginTop="$4"
        >
          Importera igen
        </Button>
      </YStack>
    )
  }

  const hasContent =
    previewQuery.data &&
    (previewQuery.data.bio || previewQuery.data.photoUrls.length > 0)

  return (
    <ScrollView>
      <YStack padding="$4" gap="$5">
        <YStack gap="$2">
          <H2 color="$text">Importera från BodyContact</H2>
          <Text fontSize="$3" color="$textSecondary">
            Hämta din publika profilbeskrivning och foton från BodyContact och importera dem till din
            Lustre-profil.
          </Text>
        </YStack>

        <YStack gap="$3">
          <YStack gap="$1">
            <Text fontSize="$2" color="$textSecondary" fontWeight="600">
              BodyContact-användarnamn
            </Text>
            <XStack gap="$2">
              <Input
                flex={1}
                value={localUsername}
                onChangeText={setLocalUsername}
                placeholder="t.ex. mittnamn"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handlePreview}
              />
              <Button
                onPress={handlePreview}
                disabled={previewQuery.isFetching || !localUsername.trim()}
                backgroundColor="$primary"
                color="white"
                minWidth={130}
              >
                {previewQuery.isFetching ? (
                  <Spinner color="white" size="small" />
                ) : (
                  'Hämta profil'
                )}
              </Button>
            </XStack>
          </YStack>

          {previewQuery.error && (
            <YStack
              backgroundColor="#FEF2F2"
              borderRadius="$3"
              padding="$3"
              borderWidth={1}
              borderColor="#FECACA"
            >
              <Text fontSize="$2" color="#DC2626">
                {(previewQuery.error as any)?.message ||
                  'Ett fel uppstod vid hämtning av profilen.'}
              </Text>
            </YStack>
          )}
        </YStack>

        {previewQuery.data && (
          <YStack gap="$4">
            <YStack
              backgroundColor="$background"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$borderColor"
              padding="$4"
              gap="$3"
            >
              <Text fontSize="$4" fontWeight="700" color="$text">
                Förhandsgranskning
              </Text>

              {previewQuery.data.bio ? (
                <YStack gap="$1">
                  <Text fontSize="$2" color="$textSecondary" fontWeight="600">
                    Profilbeskrivning
                  </Text>
                  <Text fontSize="$3" color="$text" lineHeight={20}>
                    {previewQuery.data.bio}
                  </Text>
                </YStack>
              ) : (
                <Text fontSize="$3" color="$textSecondary" fontStyle="italic">
                  Ingen profilbeskrivning hittades.
                </Text>
              )}

              {previewQuery.data.photoUrls.length > 0 ? (
                <YStack gap="$2">
                  <Text fontSize="$2" color="$textSecondary" fontWeight="600">
                    Foton ({previewQuery.data.photoUrls.length} hittade)
                  </Text>
                  <XStack flexWrap="wrap" gap="$2">
                    {previewQuery.data.photoUrls.map((url, i) => (
                      <Image
                        key={i}
                        source={{ uri: url }}
                        width={90}
                        height={90}
                        borderRadius={8}
                        backgroundColor="$backgroundHover"
                      />
                    ))}
                  </XStack>
                </YStack>
              ) : (
                <Text fontSize="$3" color="$textSecondary" fontStyle="italic">
                  Inga foton hittades.
                </Text>
              )}
            </YStack>

            <YStack
              backgroundColor="#F0FDF4"
              borderRadius="$3"
              padding="$3"
              borderWidth={1}
              borderColor="#BBF7D0"
              gap="$2"
            >
              <Text fontSize="$3" fontWeight="700" color="#166534">
                Vad importeras
              </Text>
              <YStack gap="$1">
                {previewQuery.data.bio ? (
                  <Text fontSize="$2" color="#15803D">
                    Profilbeskrivning ({previewQuery.data.bio.length} tecken)
                  </Text>
                ) : null}
                {previewQuery.data.photoUrls.length > 0 ? (
                  <Text fontSize="$2" color="#15803D">
                    {previewQuery.data.photoUrls.length} profilfoto
                    {previewQuery.data.photoUrls.length !== 1 ? 'n' : ''}
                  </Text>
                ) : null}
                {!previewQuery.data.bio && previewQuery.data.photoUrls.length === 0 ? (
                  <Text fontSize="$2" color="#6B7280">
                    Inget innehåll att importera hittades.
                  </Text>
                ) : null}
              </YStack>
            </YStack>

            <YStack
              backgroundColor="$backgroundHover"
              borderRadius="$3"
              padding="$3"
              borderWidth={1}
              borderColor={consent ? '$primary' : '$borderColor'}
            >
              <XStack gap="$3" alignItems="flex-start">
                <Button
                  size="$2"
                  onPress={() => setConsent(!consent)}
                  backgroundColor={consent ? '$primary' : '$background'}
                  borderWidth={2}
                  borderColor={consent ? '$primary' : '$borderColor'}
                  width={24}
                  height={24}
                  padding={0}
                  minWidth={24}
                >
                  {consent ? (
                    <Text fontSize="$2" color="white" fontWeight="700">
                      ✓
                    </Text>
                  ) : null}
                </Button>
                <Text fontSize="$2" color="$text" flex={1} lineHeight={18}>
                  Jag ger mitt samtycke till att importera denna publika profildata till Lustre
                </Text>
              </XStack>
            </YStack>

            {importMutation.error && (
              <YStack
                backgroundColor="#FEF2F2"
                borderRadius="$3"
                padding="$3"
                borderWidth={1}
                borderColor="#FECACA"
              >
                <Text fontSize="$2" color="#DC2626">
                  {(importMutation.error as any)?.message ||
                    'Importen misslyckades. Försök igen.'}
                </Text>
              </YStack>
            )}

            <Button
              onPress={handleImport}
              disabled={!consent || importMutation.isPending || !hasContent}
              backgroundColor={consent && hasContent ? '$primary' : '$backgroundHover'}
              color={consent && hasContent ? 'white' : '$textSecondary'}
              size="$4"
            >
              {importMutation.isPending ? (
                <XStack gap="$2" alignItems="center">
                  <Spinner color="white" size="small" />
                  <Text color="white">Importerar...</Text>
                </XStack>
              ) : (
                'Importera'
              )}
            </Button>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}
