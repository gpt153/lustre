# Epic: Wave 1f — Icon System (phosphor-react-native)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 1 (Design Foundation)
**Model:** haiku
**Estimate:** 2 days
**Dependencies:** Wave 1a (spacing tokens)

---

## Summary

Replace the inconsistent mix of @expo/vector-icons, custom SVGs, and inline paths with phosphor-react-native throughout the entire mobile app. Create a LustreIcon convenience wrapper for consistent sizing and theming. No web icon package needed — this is native-only.

## Acceptance Criteria

1. `phosphor-react-native` installed as dependency in `apps/mobile/package.json` — tree-shakeable via direct named imports
2. LustreIcon wrapper component with props: name (icon component reference), size ('sm'=16 | 'md'=20 | 'lg'=24 | 'xl'=32), weight ('regular' | 'fill'), color (defaults to current theme foreground)
3. Tab bar icons updated in `apps/mobile/app/(tabs)/_layout.tsx`: Discover (Compass), Connect (ChatCircle), Explore (MagnifyingGlass), Learn (BookOpen), Profile (User) — regular weight inactive, fill weight active, copper (#B87333) active color
4. All icon usage across mobile screens migrated from @expo/vector-icons and custom SVGs to phosphor-react-native direct imports (minimum 40 instances)
5. Icon-text inline alignment: flexDirection 'row', alignItems 'center', gap SPACING.xs (4px) — consistent across all icon+text pairs
6. Dark mode: icons use theme foreground color (warmCream in dark, charcoal in light) via color token — no hardcoded colors
7. Zero remaining imports of `@expo/vector-icons` in `apps/mobile/` after migration
8. Bundle size verified: tree-shaken phosphor-react-native adds <30KB to Hermes bytecode

## File Paths

1. `apps/mobile/components/LustreIcon.tsx`
2. `apps/mobile/app/(tabs)/_layout.tsx`
3. `apps/mobile/components/PostCard.tsx`
4. `apps/mobile/components/ProfileCard.tsx`
5. `apps/mobile/app/(tabs)/profile/settings.tsx`
6. `apps/mobile/app/(tabs)/chat/[conversationId].tsx`

## Implementation Notes

- LustreIcon wrapper (convenience, not mandatory — direct imports preferred for tree-shaking):
  ```typescript
  import type { IconProps } from 'phosphor-react-native'
  import { COLORS } from '@/constants/tokens'

  const SIZES = { sm: 16, md: 20, lg: 24, xl: 32 } as const

  interface LustreIconProps {
    icon: React.ComponentType<IconProps>
    size?: keyof typeof SIZES
    weight?: 'regular' | 'fill'
    color?: string
  }

  export function LustreIcon({ icon: Icon, size = 'md', weight = 'regular', color }: LustreIconProps) {
    // Use theme context for default color
    const resolvedColor = color ?? COLORS.charcoal  // or theme-aware
    return <Icon size={SIZES[size]} weight={weight} color={resolvedColor} />
  }
  ```

- Preferred pattern (better tree-shaking, use this in most cases):
  ```typescript
  import { Heart, Star, ChatCircle } from 'phosphor-react-native'
  <Heart size={24} weight="fill" color={COLORS.copper} />
  ```

- Tab bar icon config:
  ```typescript
  // apps/mobile/app/(tabs)/_layout.tsx
  import { Compass, ChatCircle, MagnifyingGlass, BookOpen, User } from 'phosphor-react-native'

  <Tabs.Screen
    name="discover"
    options={{
      tabBarIcon: ({ focused }) => (
        <Compass size={24} weight={focused ? 'fill' : 'regular'} color={focused ? COLORS.copper : COLORS.warmGray} />
      ),
    }}
  />
  ```

- Common icon mapping from existing to Phosphor:
  - heart -> Heart, settings -> Gear, back -> ArrowLeft, close -> X, send -> PaperPlaneRight
  - camera -> Camera, edit -> PencilSimple, delete -> Trash, share -> ShareNetwork
  - location -> MapPin, calendar -> Calendar, filter -> Funnel, search -> MagnifyingGlass
  - notification -> Bell, lock -> Lock, shield -> Shield, star -> Star
  - check -> Check, warning -> Warning, info -> Info, error -> WarningCircle
