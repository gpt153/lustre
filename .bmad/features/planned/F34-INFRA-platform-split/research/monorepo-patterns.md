# Research: Monorepo Patterns for Platform-Split Apps

## Overview

How large-scale organizations handle shared code between native mobile (React Native/Swift/Kotlin) and web (React/Next.js) apps in a monorepo. Focus on what to share vs. what to own per platform.

## Industry Patterns

### Airbnb (pre-RN era → post-RN)

Airbnb famously abandoned React Native in 2018 after using it at scale. Key lessons:

- **What they shared:** Business logic, API clients, type definitions, design tokens
- **What they did NOT share:** UI components, navigation, animations
- **Architecture after RN:** Three fully native apps (iOS Swift, Android Kotlin, web React) with a shared "service layer" (network, auth, analytics, feature flags) and shared design tokens
- **Token format:** JSON tokens processed by Style Dictionary into platform-native formats (Swift enums, Kotlin objects, CSS custom properties)
- **Lesson:** Cross-platform UI was the source of most friction. Sharing behavior (not appearance) reduced bugs and improved velocity.

### Discord

Discord runs React Native for mobile and React for web/desktop in a single monorepo.

- **What they share:** `@discord/common` package with hooks, stores, API types, and business logic. NO UI components.
- **Platform-specific:** Each app owns its component library. Mobile uses RN StyleSheet. Web uses CSS-in-JS (Emotion).
- **Token approach:** Shared design tokens as TypeScript constants. Each platform transforms tokens into its native format at build time.
- **Store pattern:** Zustand stores shared via `@discord/common`. Platform-specific stores (e.g., notification permissions on mobile) live in app-level code.
- **Key insight:** They explicitly chose to duplicate UI components rather than abstract them. "The cost of abstraction exceeds the cost of duplication for UI code."

### Shopify

Shopify manages multiple apps (Shop, POS, Inbox) with shared backend logic.

- **Monorepo tool:** Nx (previously Lerna)
- **Shared packages:** `@shopify/react-hooks` (business logic hooks), `@shopify/react-i18n`, `@shopify/react-form` (validation logic, not form UI)
- **Design system:** Polaris for web, a separate RN component library for mobile. Shared design tokens via Style Dictionary.
- **API layer:** Shared GraphQL client with platform-specific network transports
- **Key pattern:** "Shared intention, separate implementation" — a shared `useProduct` hook returns the same data shape, but the component that renders it is completely different per platform.

### Wix

Wix maintains a large React Native + web monorepo.

- **What they share:** `wix-react-native-ui-lib` — but only the "headless" parts (hooks, controllers). Visual components are platform-forked.
- **Navigation:** Platform-specific. `react-navigation` on mobile, their own router on web.
- **Lesson learned:** They initially tried to share navigation and it was their biggest regret. Navigation is inherently platform-specific.

## Patterns Summary

### Share These (Behavior Layer)
| Category | Examples | Format |
|----------|----------|--------|
| Design tokens | Colors, spacing, typography scales, shadows | TS `as const` objects |
| API clients | tRPC/GraphQL client, Zod schemas, type definitions | TypeScript |
| Business hooks | Data fetching (TanStack Query), state (Zustand), validation | React hooks |
| Utilities | Date formatting, currency, string helpers, validators | Pure functions |
| Constants | Feature flags, route names, error codes | TS enums/objects |

### Own Per Platform (UI Layer)
| Category | Mobile approach | Web approach |
|----------|----------------|--------------|
| Components | React Native StyleSheet, platform components | CSS Modules, HTML elements |
| Navigation | Expo Router / react-navigation | Next.js App Router |
| Animations | react-native-reanimated, Lottie | CSS transitions, Framer Motion |
| Gestures | react-native-gesture-handler | Mouse/keyboard events |
| Layout | Flexbox (RN default) | CSS Grid + Flexbox |
| Haptics | expo-haptics | N/A |
| Platform APIs | Camera, GPS, push notifications | Service Workers, Web APIs |

### Anti-Patterns to Avoid
1. **Platform.OS branching in shared code** — if a hook needs `Platform.OS`, it belongs in app-level code
2. **Conditional imports** — `import { View } from 'react-native'` in shared code, even behind conditions
3. **Shared navigation** — Solito attempted this; it adds complexity for minimal gain when apps diverge
4. **Shared layout components** — `<Container>`, `<Row>`, `<Column>` wrappers that abstract away platform layout
5. **"Universal" component libraries** — Tamagui, NativeBase, React Native Web all add a translation layer that prevents platform-native optimization

## Token Architecture Deep Dive

### Recommended: Direct TS Constants (our approach)

```typescript
// packages/tokens/colors.ts
export const COLORS = {
  copper: '#B87333',
  gold: '#D4A843',
  // ...
} as const

// apps/mobile/components/Button.tsx
import { COLORS } from '@lustre/tokens'
const styles = StyleSheet.create({
  button: { backgroundColor: COLORS.copper }
})

// apps/web/components/Button.module.css
/* Generated from tokens or used via CSS variables */
.button { background-color: var(--color-copper); }
```

**Pros:** Zero build step, full type safety, tree-shakeable, works everywhere
**Cons:** CSS must be generated or duplicated (minor for our scale)

### Alternative: Style Dictionary Pipeline

Used by Airbnb, Salesforce, Adobe. A build step transforms JSON tokens into platform formats.

**Pros:** Single source generates Swift, Kotlin, CSS, TS
**Cons:** Build step complexity, harder to debug, overkill for a two-platform TS monorepo

### Our Decision

Direct TS constants. We only have two TypeScript consumers (RN and Next.js). Both can import TypeScript directly. A Style Dictionary pipeline adds complexity without proportional benefit at our scale.

## Hook Architecture Deep Dive

### The "Headless Hook" Pattern

Inspired by headless UI libraries (Headless UI, Radix, TanStack Table). The hook provides behavior; the component provides rendering.

```typescript
// packages/hooks/useProfile.ts — shared
export function useProfile(userId: string) {
  const query = trpc.profile.get.useQuery({ userId })
  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

// apps/mobile/screens/ProfileScreen.tsx — mobile owns rendering
function ProfileScreen({ userId }) {
  const { profile, isLoading } = useProfile(userId)
  return <ScrollView>...</ScrollView>  // RN components
}

// apps/web/app/profile/[userId]/page.tsx — web owns rendering
function ProfilePage({ params }) {
  const { profile, isLoading } = useProfile(params.userId)
  return <div>...</div>  // HTML elements
}
```

### Store Migration Pattern

Zustand stores are inherently cross-platform (they're just JavaScript state). The only concern is persistence:

- **Mobile:** `zustand/middleware` persist with `AsyncStorage`
- **Web:** `zustand/middleware` persist with `localStorage`

Solution: The store definition lives in `packages/hooks/` WITHOUT persistence. Each app wraps it with platform-specific persistence in its own setup:

```typescript
// packages/hooks/stores/modeStore.ts — NO persistence config
export const createModeStore = (storage?: StateStorage) =>
  create<ModeState>()(
    persist(
      (set) => ({ mode: 'vanilla', setMode: (mode) => set({ mode }) }),
      { name: 'lustre-mode', storage: storage ? createJSONStorage(() => storage) : undefined }
    )
  )
```

## Monorepo Tooling

### Turborepo Configuration for Platform Split

Key patterns from Vercel's own monorepo docs:
- Use `dependsOn: ["^build"]` for packages consumed by apps
- Use `inputs` to limit rebuild triggers (tokens changes don't rebuild coach service)
- Use `outputs` to cache build artifacts
- Use workspace `package.json` `dependencies` to declare the dependency graph

### Package Boundaries Enforcement

Tools to prevent cross-platform imports:
- **TypeScript `paths`:** Don't add `react-native` to `packages/hooks/tsconfig.json`
- **ESLint `no-restricted-imports`:** Ban `react-native` imports in `packages/hooks/`
- **Turborepo `inputs`:** Only rebuild affected packages when shared code changes

## Recommendations for Lustre

1. **Extend `packages/tokens/`** with typography, radii, animation, breakpoints, themes (D2 from ADR)
2. **Create `packages/hooks/`** with all platform-agnostic hooks and stores (D3 from ADR)
3. **Use headless hook pattern** — hooks return data, apps own rendering
4. **Keep store persistence platform-specific** — store logic shared, storage adapter per-app
5. **Do NOT share:** navigation, animations, gestures, layout components, or any component with visual output
6. **Enforce boundaries** via TypeScript config (no DOM/RN types in shared packages)
7. **Migrate incrementally** — both old and new packages coexist during transition
