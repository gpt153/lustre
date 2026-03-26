# Epic: wave-1a-tamagui-tokens

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — must complete before 1b)

## Description

Replace the current Tamagui config with a logo-derived design token system. Define 12 brand color tokens, create custom light and dark themes, add vanilla/spicy sub-themes, and configure shadow utilities with copper-tinted shadows. Remove all references to the old #E91E63 primary color.

## Acceptance Criteria

1. `tamagui.config.ts` defines color tokens: copper (#B87333), copperLight (#D4A574), copperMuted (#C4956A), gold (#D4A843), goldBright (#E8B84B), goldDeep (#C9973E), warmWhite (#FDF8F3), warmCream (#F5EDE4), charcoal (#2C2421), warmGray (#8B7E74), ember (#E05A33), sage (#7A9E7E).
2. Light theme maps: background = warmWhite, surface = warmCream, color (text) = charcoal, primary = copper, accent = gold, secondary = copperLight, borderColor = copperMuted (for non-card uses), placeholderColor = warmGray.
3. Dark theme maps: background = #1A1614, surface = #2C2421, surfaceUp = #3D332E, color = warmCream (#F5EDE4), primary = copperLight (#D4A574), accent = goldBright (#E8B84B), borderColor = #3D332E.
4. Sub-themes `light_vanilla`, `dark_vanilla` set modeAccent = sage (#7A9E7E). Sub-themes `light_spicy`, `dark_spicy` set modeAccent = ember (#E05A33).
5. Shadow token `cardShadow` is defined: offset {0,4}, shadowRadius 12, shadowColor copperMuted with 0.15 opacity (light) or 0.25 opacity (dark).
6. No references to #E91E63 remain in `tamagui.config.ts`.
7. Old `$primary`, `$secondary` tokens are aliased to new tokens (`$primary` = `$copper`, `$secondary` = `$copperLight`) for backwards compatibility during migration.

## File Paths

- `packages/ui/src/tamagui.config.ts`
- `packages/ui/src/themes.ts` (new — theme definitions extracted for clarity)
- `packages/ui/src/tokens.ts` (new — token definitions extracted)
