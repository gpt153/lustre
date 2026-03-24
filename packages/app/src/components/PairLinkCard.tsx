import { XStack, YStack, Text, Image } from 'tamagui'

interface PairMember {
  userId: string
  displayName: string
  thumbnailUrl: string | null
}

interface PairLinkCardProps {
  members: PairMember[]
  onMemberPress?: (userId: string) => void
}

export function PairLinkCard({ members, onMemberPress }: PairLinkCardProps) {
  return (
    <XStack gap="$2" flexWrap="wrap">
      {members.map(member => (
        <XStack
          key={member.userId}
          backgroundColor="$backgroundHover"
          borderRadius={12}
          padding="$2"
          gap="$2"
          alignItems="center"
          pressStyle={{ opacity: 0.8 }}
          onPress={() => onMemberPress?.(member.userId)}
          cursor={onMemberPress ? 'pointer' : 'default'}
        >
          {member.thumbnailUrl ? (
            <Image source={{ uri: member.thumbnailUrl }} width={32} height={32} borderRadius={16} />
          ) : (
            <YStack width={32} height={32} borderRadius={16} backgroundColor="$primary" alignItems="center" justifyContent="center">
              <Text color="white" fontSize="$1" fontWeight="600">{member.displayName[0]?.toUpperCase()}</Text>
            </YStack>
          )}
          <Text fontSize="$2" color="$text">{member.displayName}</Text>
        </XStack>
      ))}
    </XStack>
  )
}
