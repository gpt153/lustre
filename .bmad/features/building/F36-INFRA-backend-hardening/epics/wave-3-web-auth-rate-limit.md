# Epic: wave-3-web-auth-rate-limit

**Model:** sonnet
**Wave:** 3

## Description

Migrate web client authentication from `localStorage.getItem('lustre-auth')` to HttpOnly Secure SameSite=Lax cookies. The API sets a `Set-Cookie` header on login/refresh for web clients (detected via User-Agent or `X-Lustre-Platform: web`). The tRPC context reads auth from cookie first, falling back to Authorization header for mobile. A migration endpoint allows existing web sessions to transition. Additionally, add `@fastify/rate-limit` with Redis backing on all REST upload and callback endpoints.

## Acceptance Criteria

1. Given a web client login via `auth.loginWithEmail` or `auth.loginWithOAuth`, when successful, then the response includes a `Set-Cookie` header with: `lustre-auth={jwt}; HttpOnly; Secure; SameSite=Lax; Domain=.lovelustre.com; Path=/; Max-Age=2592000`
2. Given the tRPC context in `services/api/src/trpc/context.ts`, when creating context, then it checks for auth in this order: (1) `lustre-auth` cookie, (2) `Authorization: Bearer` header — first valid JWT wins
3. Given `@fastify/cookie` plugin, when registered on the Fastify instance, then cookie parsing is available on all routes
4. Given a web client with an existing localStorage JWT, when it calls `POST /api/auth/migrate-session`, then the API validates the Bearer token, sets the HttpOnly cookie, and returns `{ migrated: true }`
5. Given a mobile client (Expo), when sending requests with `Authorization: Bearer` header, then auth continues to work exactly as before (no regression)
6. Given `@fastify/rate-limit` plugin, when registered, then upload endpoints (`/api/photos/upload`, `/api/posts/upload`, `/api/chat/upload`) are limited to 10 requests per minute per authenticated user
7. Given payment callback endpoints (`/swish/callback`, `/api/payments/*`, `/api/events/ticket-callback`, `/api/marketplace/swish-callback`), when rate limiting is applied, then they are limited to 30 requests per minute per IP address
8. Given rate limit exceeded, when a request is rejected, then the response is 429 Too Many Requests with `Retry-After` header
9. Given `apps/web/lib/trpc.tsx`, when the web tRPC client is updated, then it sends `credentials: 'include'` on fetch requests (for cookie) and removes `localStorage.getItem('lustre-auth')` from the Authorization header setup
10. Given the Fastify CORS config, when `credentials: true` is set, then cookie-based auth works cross-origin between `app.lovelustre.com` and `api.lovelustre.com`

## File Paths

- `services/api/src/trpc/context.ts`
- `services/api/src/server.ts`
- `services/api/src/auth/swish.ts`
- `apps/web/lib/trpc.tsx`
- `services/api/package.json`
- `services/api/src/lib/redis.ts`
