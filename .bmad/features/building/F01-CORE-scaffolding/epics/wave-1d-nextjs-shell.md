# Epic: Next.js Web App Shell | Wave-1d

**Wave:** 1
**Model:** haiku
**Dependencies:** wave-1a, wave-1b

## Description

Create the Next.js 16 web application in apps/web with App Router, Tamagui SSR support from @lustre/ui, and Solito navigation bridge. Set up the layout with header navigation (Home, Discover, Chat, Profile links), configure SSR with correct meta tags for SEO, and ensure Tamagui components compile to optimized CSS on web. The web app should show the same placeholder screens as mobile but with web-appropriate layout.

## File paths
1. apps/web/package.json
2. apps/web/next.config.ts
3. apps/web/app/layout.tsx
4. apps/web/app/page.tsx
5. apps/web/app/providers.tsx
6. apps/web/tamagui.config.ts

## Implementation steps
1. Create apps/web with `npx create-next-app@latest` using TypeScript and App Router
2. Install dependencies: @lustre/ui, @lustre/app, @lustre/api, tamagui, @tamagui/next-plugin, solito, next-themes
3. Configure next.config.ts with tamaguiPlugin for CSS extraction and monorepo transpilation (transpilePackages: ["@lustre/ui", "@lustre/app", "@lustre/api"])
4. Create app/providers.tsx wrapping TamaguiProvider with SSR support and NextThemeProvider
5. Create app/layout.tsx with metadata (title: "Lustre", description), providers wrapper, and header nav component
6. Create app/page.tsx as Home page with Lustre logo and "Coming Soon" using Tamagui YStack, Text, Button
7. Create placeholder pages: app/discover/page.tsx, app/chat/page.tsx, app/profile/page.tsx
8. Verify SSR: view source shows server-rendered HTML with Tamagui classes
9. Configure Solito Link component for shared navigation between mobile and web

## Acceptance Criteria
1. `pnpm dev --filter web` starts Next.js on localhost:3000
2. Pages render server-side (view source shows HTML content)
3. Tamagui components render with correct brand colors
4. Navigation between pages works via header links
5. Shared @lustre/ui components identical on web and mobile
