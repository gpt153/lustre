import type { IconProps } from 'phosphor-react-native'
import { COLORS } from '@/constants/tokens'

const SIZES = { sm: 16, md: 20, lg: 24, xl: 32 } as const

interface LustreIconProps {
  icon: React.ComponentType<IconProps>
  size?: keyof typeof SIZES
  weight?: 'regular' | 'fill'
  color?: string
}

export function LustreIcon({
  icon: Icon,
  size = 'md',
  weight = 'regular',
  color = COLORS.charcoal,
}: LustreIconProps) {
  return <Icon size={SIZES[size]} weight={weight} color={color} />
}
