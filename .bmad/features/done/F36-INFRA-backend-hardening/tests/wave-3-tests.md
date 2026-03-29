# Test Spec: Wave 3 — Web Auth + Rate Limiting

## Scope

Verify that web auth migrates from localStorage JWT to HttpOnly cookies, that mobile auth is unaffected, and that rate limiting works on REST endpoints.

---

## T3.1: HttpOnly Cookie Auth

**Tool:** Vitest + Fastify inject
**File:** `services/api/src/__tests__/cookie-auth.test.ts`

### Unit Tests

1. **Login sets cookie for web** — Given a login request with `X-Lustre-Platform: web`, when successful, then the response includes `Set-Cookie: lustre-auth={jwt}; HttpOnly; Secure; SameSite=Lax; Domain=.lovelustre.com; Path=/; Max-Age=2592000`
2. **Login does NOT set cookie for mobile** — Given a login request with `X-Lustre-Platform: mobile`, when successful, then the response does NOT include a `Set-Cookie` header (JWT returned in body only)
3. **Context reads cookie** — Given a request with `Cookie: lustre-auth={validJwt}` and no Authorization header, when tRPC context is created, then `ctx.userId` is correctly extracted from the cookie JWT
4. **Context prefers cookie over header** — Given a request with both a cookie and Authorization header (both valid, different users), when tRPC context is created, then the cookie takes precedence
5. **Context falls back to header** — Given a request with Authorization header but no cookie, when tRPC context is created, then `ctx.userId` is extracted from the Bearer token

### Integration Tests

6. **Full web login flow** — POST login with web platform header. Assert Set-Cookie header. Make a subsequent tRPC call with only the cookie (no Authorization header). Assert the call succeeds with the correct user
7. **Migration endpoint** — POST `/api/auth/migrate-session` with a valid Bearer token. Assert Set-Cookie header is set. Assert response body `{ migrated: true }`
8. **Mobile flow unaffected** — POST login with mobile platform header. Assert no Set-Cookie. Make subsequent tRPC call with Authorization header. Assert success
9. **Expired cookie → 401** — Send a request with an expired JWT in the cookie. Assert 401 response

### Manual Verification

- [ ] Open `app.lovelustre.com` in browser, login, verify cookie appears in DevTools (Application → Cookies) as HttpOnly
- [ ] Verify that `document.cookie` does NOT expose the `lustre-auth` cookie (HttpOnly check)
- [ ] Open mobile app, verify login still works via Bearer token
- [ ] Verify CORS `Access-Control-Allow-Credentials: true` is returned for `app.lovelustre.com` origin
- [ ] Test cross-subdomain: login at `app.lovelustre.com`, navigate to `pay.lovelustre.com`, verify cookie works (Domain=.lovelustre.com)

---

## T3.2: Rate Limiting

**Tool:** Vitest + Fastify inject
**File:** `services/api/src/__tests__/rate-limiting.test.ts`

### Unit Tests

1. **Upload rate limit config** — Given the rate limit plugin config, when inspected, then `/api/photos/upload`, `/api/posts/upload`, `/api/chat/upload` have `max: 10, timeWindow: '1 minute'` per user
2. **Callback rate limit config** — Given the rate limit plugin config, when inspected, then `/swish/callback` and `/api/payments/*` have `max: 30, timeWindow: '1 minute'` per IP

### Integration Tests

3. **Upload limit enforced** — Send 11 POST requests to `/api/photos/upload` within 1 minute as the same user. Assert request 11 returns 429 with `Retry-After` header
4. **Rate limit resets** — Send 10 requests (at limit), wait for time window to pass, send another. Assert it succeeds
5. **Different users have separate limits** — Send 10 requests as user A, then 1 request as user B. Assert user B's request succeeds
6. **Callback IP limit** — Send 31 POSTs to `/swish/callback` from the same IP within 1 minute. Assert request 31 returns 429
7. **Redis backing store** — Given rate limit configured with Redis store, when Redis is queried, then rate limit counters are stored in Redis (not memory)

### Manual Verification

- [ ] Use curl to hit upload endpoint repeatedly — verify 429 response after threshold
- [ ] Verify `Retry-After` header value is reasonable (seconds until window resets)
- [ ] Check Redis for rate limit keys (pattern: `ratelimit:*`)
- [ ] Verify tRPC endpoints are NOT rate-limited by the REST rate limiter (they have their own mechanism if needed)
