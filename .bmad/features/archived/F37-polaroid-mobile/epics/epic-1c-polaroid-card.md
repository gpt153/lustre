# Epic 1c: PolaroidCard Component

**Model:** sonnet
**Wave:** 1
**Depends on:** 1a (tokens), 1b (font)

## Description
Create the core PolaroidCard React Native component using Reanimated for press animation.

## Acceptance Criteria
1. File `packages/ui/src/PolaroidCard.tsx` exists
2. Props: `cardWidth: number`, `imageSource: ImageSourcePropType`, `caption?: string`, `rotation?: number`, `shadow?: 'sm' | 'md' | 'lg'`, `onPress?: () => void`, `children?: ReactNode`, `style?: ViewStyle`, `accessibilityLabel?: string`
3. Card dimensions computed via `getPolaroidDimensions(cardWidth)` from `@lustre/tokens`
4. Image renders with `resizeMode="cover"` in the image area
5. Caption: one line, centered, `fontFamily: 'Caveat_400Regular'`, `numberOfLines={1}`
6. Rotation via `transform: [{ rotate: '${rotation}deg' }]`
7. Shadow variants use `SHADOWS` from `@lustre/tokens`
8. Spring press animation: scale to 0.97 on press-in, spring back with SPRING.snappy config
9. `children` render as absolute overlay on the image area
10. Card background pure white `#FFFFFF`

## Codebase Context
- Animation constants: `apps/mobile/constants/animations.ts` — `SPRING.snappy = { damping: 25, stiffness: 200, mass: 0.8 }`, `INTERACTION.pressScale = 0.97`
- Shadow tokens: `packages/tokens/shadows.ts` — `SHADOWS.sm/md/lg`
- Polaroid tokens: `packages/tokens/polaroid.ts` — `getPolaroidDimensions()`, `POLAROID`
- Existing component pattern: see `packages/ui/src/LustreButton.tsx` — uses React Native Pressable, not Tamagui styled()
- Font: `Caveat_400Regular` loaded by expo-loader

## File Paths
- `packages/ui/src/PolaroidCard.tsx` (CREATE)
