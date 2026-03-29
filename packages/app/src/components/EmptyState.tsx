import { YStack, Text } from 'tamagui'
import { LinearGradient } from '@tamagui/linear-gradient'
import { TouchableOpacity } from 'react-native'

interface Action {
  label: string
  onPress: () => void
}

interface EmptyStateProps {
  title: string
  description: string
  action?: Action
}

const COPPER = '#894d0d'
const COPPER_LIGHT = '#a76526'
const CHARCOAL = '#2C2421'
const SURFACE_CONTAINER_LOW = '#f7f3ef'

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal={32}
      paddingVertical={48}
      backgroundColor={SURFACE_CONTAINER_LOW}
      borderRadius={20}
      marginTop={24}
      gap={16}
    >
      {/* Copper icon circle */}
      <YStack
        width={72}
        height={72}
        borderRadius={9999}
        backgroundColor="rgba(137, 77, 13, 0.08)"
        alignItems="center"
        justifyContent="center"
        marginBottom={4}
      >
        <Text fontSize={28} color={COPPER}>
          ✦
        </Text>
      </YStack>

      {/* Title — Noto Serif */}
      <Text
        fontFamily="$heading"
        fontSize={22}
        fontWeight="700"
        color={CHARCOAL}
        textAlign="center"
        letterSpacing={-0.3}
      >
        {title}
      </Text>

      {/* Description — Manrope */}
      <Text
        fontSize={15}
        color={CHARCOAL}
        opacity={0.6}
        textAlign="center"
        lineHeight={22}
        maxWidth={280}
      >
        {description}
      </Text>

      {/* CTA — copper gradient pill */}
      {action ? (
        <TouchableOpacity
          onPress={action.onPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={{ marginTop: 8 }}
        >
          <LinearGradient
            colors={[COPPER, COPPER_LIGHT]}
            start={[0, 0]}
            end={[1, 1]}
            borderRadius={9999}
            paddingHorizontal={28}
            paddingVertical={14}
            alignItems="center"
            justifyContent="center"
            minHeight={48}
          >
            <Text
              fontWeight="600"
              fontSize={15}
              color="#FDF8F3"
              letterSpacing={0.2}
            >
              {action.label}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : null}
    </YStack>
  )
}
