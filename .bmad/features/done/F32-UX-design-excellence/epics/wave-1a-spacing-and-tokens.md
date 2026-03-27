# Epic: Wave 1a — Spacing & Design Token Constants

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 1 (Design Foundation)
**Model:** haiku
**Estimate:** 3 days
**Dependencies:** None (first epic)

---

## Summary

Replace arbitrary spacing values with a semantic spacing scale as plain TypeScript constants (not Tamagui config). Create design token files for colors, shadows, and animation configs. Migrate all mobile screens to use these constants via StyleSheet.create.

## Acceptance Criteria

1. `packages/tokens/spacing.ts` exports semantic spacing constants: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48) as plain TS object
2. `packages/tokens/colors.ts` exports all brand colors (copper #B87333, gold #D4A843, warmWhite #FDF8F3, charcoal #2C2421, ember #C85A3A, sage #7A9E7E, warmGray #8B7E75) and mode-specific color sets (vanilla/spicy light/dark)
3. `packages/tokens/shadows.ts` exports warm-tinted shadow objects compatible with React Native StyleSheet (shadowColor '#2C2421', sm/md/lg/xl with appropriate offset/opacity/radius/elevation)
4. `apps/mobile/constants/tokens.ts` re-exports all token packages for convenient mobile imports
5. `apps/mobile/constants/animations.ts` exports SPRING configs (default, snappy, gentle, bouncy, stiff, rubber), TIMING values, INTERACTION constants, and REDUCED_MOTION fallbacks
6. All mobile screens in `apps/mobile/app/` use semantic spacing constants in StyleSheet.create (zero arbitrary pixel values for margins/paddings)
7. Card padding standardized to SPACING.md (16) on all card components
8. Section gaps standardized to SPACING.lg (24) between major sections, SPACING.md (16) between items
9. Tab bar uses SPACING.sm (8) vertical padding, SPACING.md (16) horizontal padding
10. No visual regression: Maestro screenshots match intended proportions

## File Paths

1. `packages/tokens/spacing.ts`
2. `packages/tokens/colors.ts`
3. `packages/tokens/shadows.ts`
4. `apps/mobile/constants/tokens.ts`
5. `apps/mobile/constants/animations.ts`
6. `apps/mobile/app/(tabs)/_layout.tsx`
7. `apps/mobile/components/CardBase.tsx`
8. `apps/mobile/app/_layout.tsx`

## Implementation Notes

- Token files are pure TS constants — no runtime, no provider, inlined by Hermes bytecode compiler
- Spacing migration approach: batch by tab screens first (5 screens), then high-traffic screens (Discover, Profile, Chat), then remaining
- Shadow tokens for cross-platform:
  ```typescript
  // iOS uses shadowColor/shadowOffset/shadowOpacity/shadowRadius
  // Android uses elevation (no color control)
  // Include both in each shadow token object
  sm: {
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  }
  ```
- Animation constants with specific spring configs:
  ```typescript
  export const SPRING = {
    default: { damping: 20, stiffness: 90, mass: 1 },
    snappy: { damping: 25, stiffness: 200, mass: 0.8 },
    gentle: { damping: 15, stiffness: 60, mass: 1.2 },
    bouncy: { damping: 12, stiffness: 150, mass: 0.9 },
    stiff: { damping: 30, stiffness: 300, mass: 0.7 },
    rubber: { damping: 40, stiffness: 400, mass: 1 },
  } as const
  ```
- StyleSheet.create pattern for consuming tokens:
  ```typescript
  import { SPACING, COLORS, SHADOWS } from '@/constants/tokens'
  const styles = StyleSheet.create({
    container: { padding: SPACING.md, backgroundColor: COLORS.warmWhite },
    card: { ...SHADOWS.sm, borderRadius: 12 },
  })
  ```

## Testing

- Maestro: screenshot each tab before and after migration on odin9 (emulator-5570)
- TypeScript: verify no build errors after token changes (`pnpm build`)
- Spot-check 5 high-traffic screens for correct spacing
