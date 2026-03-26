# ADR: UI/UX Design System Redesign

## ADR-1: Font Choice — Sohne vs General Sans

### Context
The design calls for a premium geometric sans-serif for headings to match Feeld's editorial quality. Sohne (Klim Type Foundry) is the ideal choice — used by Feeld, OpenAI, and Stripe. General Sans (Fontshare, free) is a close alternative.

### Decision
**Use General Sans as default, upgrade to Sohne when budget permits.** General Sans is free for commercial use, has similar geometric proportions, and includes variable font support. The Tamagui config will use a `$heading` font token so swapping the underlying font file requires only one change.

### Consequences
- No licensing cost at launch
- Font token abstraction means zero code changes when upgrading to Sohne
- General Sans lacks Sohne's refined optical sizing at small sizes, but this is imperceptible at heading scale (18px+)

---

## ADR-2: React Native Reanimated 3 vs Legacy Animated API

### Context
The current Discover screen uses `Animated.ValueXY` (legacy React Native Animated API) which runs on the JS thread and drops frames during complex gestures. Reanimated 3 runs animations on the UI thread via worklets, ensuring 60fps.

### Decision
**Migrate all gesture-driven animations to React Native Reanimated 3.** Static animations (e.g., fade-in on mount) may remain on the legacy API if they don't cause performance issues, but all new animations must use Reanimated.

### Consequences
- Requires `react-native-reanimated` babel plugin in Expo's `babel.config.js`
- Worklet functions have restrictions (no closures over non-shared values, no external module calls)
- Gesture handler integration via `react-native-gesture-handler` (already in Expo default template)
- ~150KB bundle increase (acceptable)
- Existing `DiscoverScreen.tsx` must be rewritten, not incrementally updated

---

## ADR-3: Glassmorphism Performance Strategy

### Context
Glassmorphism (backdrop-filter: blur + transparency) is GPU-intensive. Overuse causes jank, especially on mid-range Android devices. Apple's WWDC 2025 "Liquid Glass" made it mainstream but with native GPU support that web/RN don't have.

### Decision
**Limit glassmorphism to maximum 3-5 elements per screen.** Apply it to:
1. Web header (always visible, single element)
2. Modal overlays (temporary, one at a time)
3. Bottom sheet overlays (mobile, temporary)

Do NOT apply to: cards, list items, tab bars, or any repeating elements.

### Fallback for unsupported browsers/devices:
- Detect `backdrop-filter` support via CSS `@supports`
- Fallback: solid `rgba(44,36,33,0.95)` background (slightly more opaque, no blur)

### Consequences
- Premium feel on capable devices
- Graceful degradation on older Android WebViews
- Performance budget maintained

---

## ADR-4: Navigation Restructure — 12 Tabs to 5 Tabs

### Context
12 mobile tabs violate every mobile UX guideline (Apple HIG recommends 3-5, Material Design recommends 3-5). Users cannot discover or remember 12 tabs. Competing apps all use 5 tabs.

### Decision
**Restructure to 5 tabs with nested navigation:**

| Tab | Nested Screens |
|-----|---------------|
| Discover | Feed, Swipe, Search |
| Connect | Chat, Matches, Gatekeeper |
| Explore | Events, Groups, Orgs, Shop |
| Learn | Coach, Modules, Health |
| Profile | Profile, Settings, SafeDate, Vault |

Implementation via Expo Router nested layouts:
- `apps/mobile/app/(tabs)/discover/_layout.tsx` — Stack navigator within tab
- Each tab gets its own `_layout.tsx` with a stack of screens

### Consequences
- All existing deep links must be updated (push notifications, email links, share links)
- Expo Router file structure requires moving files from `(tabs)/groups.tsx` to `(tabs)/explore/groups.tsx` etc.
- Screen-level analytics events must be re-mapped
- Users familiar with current layout will need to relearn (acceptable — current layout is confusing)

---

## ADR-5: Tamagui Theme Architecture

### Context
Current Tamagui config uses default themes with overridden primary color (#E91E63). The redesign requires custom light/dark themes with 12+ brand tokens, mode-specific accent colors (vanilla/spicy), and component-level theme variants.

### Decision
**Create custom Tamagui themes from scratch using createTheme():**

```
themes = {
  light: { background: warmWhite, color: charcoal, ... },
  dark: { background: '#1A1614', color: warmCream, ... },
  light_vanilla: { accent: sage, ... },
  light_spicy: { accent: ember, ... },
  dark_vanilla: { accent: sage, ... },
  dark_spicy: { accent: ember, ... },
}
```

Use Tamagui's sub-theme nesting: `<Theme name="vanilla">` within `<Theme name="light">` produces `light_vanilla`.

### Consequences
- Clean separation of concerns: base theme (light/dark) x mode theme (vanilla/spicy)
- Existing `$primary` references throughout the app will break — must be replaced with `$copper` or `$gold` depending on usage
- All components using `$borderColor` for visual borders must be updated to use shadows instead
- One-time migration cost, but future theming changes become trivial

---

## ADR-6: Profile Prompt System

### Context
Free-text bios produce low-quality content. Hinge's research shows prompt-based bios lead to 47% more dates. The redesign replaces free-text bio with structured prompts.

### Decision
**Add a prompt system to profiles.** Users select 3 prompts from a curated list and write responses. Prompts are stored as a new `ProfilePrompt` model. The existing `bio` field on Profile remains but is deprecated (hidden from new UI, still returned in API for backwards compatibility).

Prompt examples (Swedish):
- "Jag soker..."
- "Min perfekta dejt..."
- "Vad folk inte vet om mig..."
- "Mitt basta radgivning..."
- "Jag garanterar att..."

### Consequences
- New Prisma model: `ProfilePrompt` (id, profileId, promptKey, response, order)
- Requires seeding prompt options
- Profile view/edit screens must be rebuilt
- API backwards compatible — `bio` field preserved
