# Epic: wave-2c-platform-middleware

**Model:** haiku
**Wave:** 2
**Group:** B (parallel with Group A)

## Description

Add platform detection to the Lustre API. Mobile and web tRPC clients send an `X-Lustre-Platform` header (`mobile`, `web`, or `admin`). The Fastify backend extracts this header via an `onRequest` hook and makes it available as `request.platform` for downstream route handlers. Content gating rules are applied: ConsentVault playback and SafeDate GPS are mobile-only; spicy NSFW content (nudity MEDIUM/HIGH) on web requires additional gating. The admin app sends `admin` platform header.

## Acceptance Criteria

1. `services/api/src/lib/platform.ts` exports a Fastify plugin that adds `request.platform` (type `'mobile' | 'web' | 'admin' | 'unknown'`) from the `X-Lustre-Platform` header, defaulting to `'unknown'`
2. `services/api/src/server.ts` registers the platform plugin
3. `services/api/src/trpc/context.ts` includes `platform` in the tRPC context object (from `request.platform`)
4. `packages/api/src/trpc-client.ts` (or equivalent tRPC link config) adds `X-Lustre-Platform` header — value set per-app: mobile sends `'mobile'`, web sends `'web'`
5. `services/api/src/trpc/consent-router.ts` `getPlaybackToken` procedure returns FORBIDDEN when `ctx.platform !== 'mobile'`
6. `services/api/src/trpc/safedate-router.ts` `logGPS` and `getLiveLocation` procedures return FORBIDDEN when `ctx.platform !== 'mobile'`
7. `services/api/src/trpc/post-router.ts` `feed` procedure excludes MEDIUM/HIGH nudity posts when `ctx.platform === 'web'` (unless user has explicit web-spicy opt-in, future feature)
8. TypeScript types for `request.platform` are declared via Fastify module augmentation

## File Paths

- `services/api/src/lib/platform.ts`
- `services/api/src/server.ts`
- `services/api/src/trpc/context.ts`
- `packages/api/src/trpc-client.ts`
- `services/api/src/trpc/consent-router.ts`
- `services/api/src/trpc/safedate-router.ts`
- `services/api/src/trpc/post-router.ts`
