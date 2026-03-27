# Epic: Wave 1b — Skeleton Loaders (Reanimated Shimmer)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 1 (Design Foundation)
**Model:** haiku
**Estimate:** 3 days
**Dependencies:** Wave 1a (uses spacing tokens)

---

## Summary

Replace all `<ActivityIndicator>` spinners with content-shaped skeleton loaders using Reanimated 3 for copper-tinted shimmer animation running entirely on the UI thread. No CSS @keyframes. No web fallbacks.

## Acceptance Criteria

1. Skeleton component system created with sub-components: Skeleton.Box (configurable width/height/borderRadius), Skeleton.Text (configurable lines 1-5, line widths), Skeleton.Circle (configurable diameter for avatars)
2. Shimmer animation runs 100% on UI thread via Reanimated: `useSharedValue` drives translateX of expo-linear-gradient overlay, 1.5s cycle, `withRepeat(withTiming(...), -1)` — no JS thread involvement
3. Shimmer gradient colors: warmWhite (#FDF8F3) to copper-10% (rgba(184,115,51,0.1)) to warmWhite, rendered via expo-linear-gradient inside MaskedView
4. All screens using TanStack Query loading states show skeleton placeholders matching the shape of incoming content (not generic rectangles)
5. useSkeletonTransition hook provides Reanimated opacity crossfade (200ms, `withTiming`) from skeleton to real content with zero layout shift
6. Skeleton components set accessibilityState={{ busy: true }} and accessibilityLabel="Loading" for VoiceOver/TalkBack
7. Reduced motion (AccessibilityInfo.isReduceMotionEnabled): shimmer stops, static warm gray fill (#E8DDD3) shown instead
8. Zero ActivityIndicator/spinner usage remains in the mobile codebase
9. Skeleton dimensions match real content within 2px tolerance to prevent layout jump on load
10. Performance: skeleton render + shimmer maintains 60fps on Pixel 6 (verified via Maestro timing)

## File Paths

1. `apps/mobile/components/Skeleton.tsx`
2. `apps/mobile/hooks/useSkeletonTransition.ts`
3. `apps/mobile/app/(tabs)/index.tsx`
4. `apps/mobile/app/(tabs)/discover.tsx`
5. `apps/mobile/app/(tabs)/chat/index.tsx`
6. `apps/mobile/app/(tabs)/profile/index.tsx`
7. `apps/mobile/components/ProfileCard.tsx`
8. `apps/mobile/components/PostCard.tsx`

## Implementation Notes

- Shimmer implementation (Reanimated + expo-linear-gradient + MaskedView):
  ```typescript
  import { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated'
  import { LinearGradient } from 'expo-linear-gradient'
  import MaskedView from '@react-native-masked-view/masked-view'

  const translateX = useSharedValue(-width)
  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(width, { duration: 1500, easing: Easing.linear }),
      -1, false
    )
  }, [])

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  // MaskedView masks the shimmer gradient to skeleton shapes
  // Skeleton shapes are the mask element (opaque = show shimmer)
  ```

- Per-screen skeleton configs: co-locate with screen files as `DiscoverSkeleton`, `ChatListSkeleton`, etc.
- Key screens needing skeletons:
  - Discover: card stack placeholder (image rect + text lines + button row)
  - Feed: post card placeholders (avatar circle + image rect + text lines)
  - Chat: conversation rows (avatar circle + name line + message line)
  - Profile: photo grid (3 rect placeholders) + bio text lines
  - Events: event card placeholders
  - Matches: avatar grid placeholders
- useSkeletonTransition:
  ```typescript
  const opacity = useSharedValue(1)
  const onDataLoaded = () => {
    opacity.value = withTiming(0, { duration: 200 })
  }
  // Skeleton has animated opacity, real content renders underneath
  ```
