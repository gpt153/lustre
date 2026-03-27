# Epic: Wave 1d — Empty States (react-native-svg)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 1 (Design Foundation)
**Model:** haiku
**Estimate:** 3 days
**Dependencies:** Wave 1a (uses spacing tokens)

---

## Summary

Design and implement empty state components for every list, feed, and collection view in the mobile app. Each empty state includes a copper-accented react-native-svg illustration, heading, description, and optional CTA button with Reanimated entrance animation.

## Acceptance Criteria

1. EmptyState component in `apps/mobile/components/EmptyState.tsx` with props: illustration (enum key), title (string), description (string), optional action ({label, onPress})
2. 8 illustration components as react-native-svg (~2KB each): no-matches, no-messages, no-events, no-badges, empty-feed, no-results, offline, error — all with copper (#B87333) accent strokes
3. EmptyState layout: centered vertically with flexbox, illustration 120x120, title in General Sans SemiBold 18px charcoal, description in Inter Regular 14px at 60% opacity, SPACING.md (16px) gap between elements
4. CTA button renders as existing button component with copper styling when action prop provided, 44px minimum touch target
5. All mobile list screens show appropriate EmptyState when data array is empty: Discover (no more profiles), Matches, Chat, Feed, Events, Badges, Search results
6. Offline empty state shown when network unavailable (integrate with NetInfo or existing detection)
7. Error empty state shown when TanStack Query fetch fails (integrate with query error states)
8. Entrance animation via Reanimated: fade in (opacity 0 to 1) + translateY (20px to 0), `withSpring({ damping: 20, stiffness: 100, mass: 1 })`, triggered on mount
9. Illustrations have `accessible={false}` and `importantForAccessibility="no"`, text is readable by VoiceOver/TalkBack
10. Illustrations adapt to current theme: copper stroke stays copper, fill areas use theme background color token

## File Paths

1. `apps/mobile/components/EmptyState.tsx`
2. `apps/mobile/components/illustrations/index.ts`
3. `apps/mobile/components/illustrations/NoMatches.tsx`
4. `apps/mobile/components/illustrations/NoMessages.tsx`
5. `apps/mobile/app/(tabs)/discover.tsx`
6. `apps/mobile/app/(tabs)/chat/index.tsx`
7. `apps/mobile/app/(tabs)/profile/index.tsx`

## Implementation Notes

- Illustrations as React components using react-native-svg (not image files):
  ```typescript
  import Svg, { Path, Circle } from 'react-native-svg'
  export function NoMatches({ size = 120 }: { size?: number }) {
    return (
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx={60} cy={60} r={40} stroke="#2C2421" strokeWidth={1.5} fill="none" />
        <Path d="M45 55 L60 70 L75 55" stroke="#B87333" strokeWidth={2} strokeLinecap="round" fill="none" />
      </Svg>
    )
  }
  ```
- SVG style: single-weight stroke (1.5px), rounded line caps, copper accent on key elements (heart, star, envelope), charcoal for structure
- Copy examples (Swedish):
  - no-matches: "Inga matchningar an" / "Fortsatt swipa -- din Copper Pick vantar"
  - no-messages: "Inkorgen ar tom" / "Skicka ett meddelande for att starta en konversation"
  - empty-feed: "Inget har annu" / "Folj folk eller ga med i event for att fylla ditt flode"
  - no-results: "Inga resultat" / "Prova andra sokord"
  - offline: "Du ar offline" / "Kontrollera din anslutning och forsok igen"
- Entrance animation:
  ```typescript
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(20)
  useEffect(() => {
    opacity.value = withSpring(1, SPRING.gentle)
    translateY.value = withSpring(0, SPRING.gentle)
  }, [])
  ```
- Dark mode: illustrations use `COLORS.warmWhite` stroke instead of charcoal (invert), copper stays copper
