# Epic: tRPC Client Integration | Wave-2b

**Wave:** 2
**Model:** haiku
**Dependencies:** wave-2a, wave-1c, wave-1d

## Description

Wire up the tRPC client in packages/api to connect to the Fastify backend. Create a TRPCProvider component that wraps both the mobile and web apps, providing type-safe API calls. Update the Home screen on both platforms to call the health.check procedure and display the result, proving end-to-end type safety from server to client.

## File paths
1. packages/api/src/trpc-client.ts
2. packages/api/src/provider.tsx
3. packages/app/src/hooks/useHealthCheck.ts
4. apps/mobile/app/_layout.tsx
5. apps/web/app/providers.tsx
6. apps/mobile/app/(tabs)/index.tsx

## Implementation steps
1. Create packages/api/src/trpc-client.ts: export createTRPCReact<AppRouter> using httpBatchLink pointing to API_URL env (default http://localhost:4000/trpc), superjson transformer
2. Create packages/api/src/provider.tsx: TRPCProvider component wrapping QueryClientProvider + trpc.Provider, configurable API URL
3. Create packages/app/src/hooks/useHealthCheck.ts: custom hook using trpc.health.check.useQuery()
4. Update apps/mobile/app/_layout.tsx: wrap with TRPCProvider (API_URL from expo-constants)
5. Update apps/web/app/providers.tsx: wrap with TRPCProvider (API_URL from env)
6. Update apps/mobile/app/(tabs)/index.tsx: use useHealthCheck hook, display server status and timestamp
7. Test: start API server + mobile app, verify health check response displays

## Acceptance Criteria
1. Mobile app displays server health status from API
2. Web app displays server health status from API
3. TypeScript autocomplete works for tRPC procedures in IDE
4. Zod validation errors from server propagate to client correctly
5. TanStack Query caching works (subsequent calls use cache)
