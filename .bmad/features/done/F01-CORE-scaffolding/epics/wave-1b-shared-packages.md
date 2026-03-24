# Epic: Shared Packages Setup | Wave-1b

**Wave:** 1
**Model:** haiku
**Dependencies:** None (can run parallel to 1a, merged after)

## Description

Create the three shared packages that form the core of code sharing between mobile and web: packages/ui (Tamagui component library), packages/api (tRPC client + Zod schemas), and packages/app (shared screens, hooks, and business logic). Each package has its own package.json, tsconfig.json, and entry point. The UI package exports a base Tamagui config with custom theme tokens (colors, spacing, typography) matching the Lustre brand. The API package exports Zod validation schemas and tRPC router type definitions. The app package exports shared React hooks and utility functions.

## File paths
1. packages/ui/package.json
2. packages/ui/src/index.ts
3. packages/ui/src/tamagui.config.ts
4. packages/api/package.json
5. packages/api/src/index.ts
6. packages/app/package.json
7. packages/app/src/index.ts

## Implementation steps
1. Create packages/ui/package.json with name @lustre/ui, dependencies: tamagui, @tamagui/core, @tamagui/themes
2. Create packages/ui/src/tamagui.config.ts with custom theme: primary color #E91E63 (lustre pink), secondary #7C4DFF, background/surface tokens, typography scale using Inter font
3. Create packages/ui/src/index.ts re-exporting tamagui config and a sample Button component
4. Create packages/api/package.json with name @lustre/api, dependencies: @trpc/client, @trpc/server, zod, superjson
5. Create packages/api/src/index.ts exporting type AppRouter (placeholder) and createTRPCClient helper
6. Create packages/api/src/schemas/user.ts with Zod schema for basic user (id, displayName, email)
7. Create packages/app/package.json with name @lustre/app, dependencies: @lustre/ui, @lustre/api, zustand, @tanstack/react-query
8. Create packages/app/src/index.ts exporting a useHealth hook that calls /health
9. Add tsconfig.json to each package extending root tsconfig
10. Run `pnpm install` from root to link workspaces

## Acceptance Criteria
1. Importing @lustre/ui in any app resolves correctly
2. Tamagui config exports theme tokens with Lustre brand colors
3. @lustre/api exports Zod schemas that validate correctly
4. @lustre/app exports hooks that can be imported by both apps
5. TypeScript compilation succeeds for all three packages
