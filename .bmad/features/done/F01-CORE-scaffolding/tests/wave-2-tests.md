# Test Specification: F01 Wave 2 — Backend & API

## API Tests
- [ ] GET /health returns 200 with { status: "ok", timestamp }
- [ ] tRPC health.check returns valid response via httpBatchLink
- [ ] CORS allows requests from localhost:3000 (web) and localhost:8081 (expo)
- [ ] Invalid tRPC procedure returns 404
- [ ] Prisma client generates without error (prisma generate)

## Integration Tests
- [ ] Mobile app fetches and displays health check from API
- [ ] Web app fetches and displays health check from API
- [ ] tRPC type inference works (TypeScript compiles without type errors)
- [ ] TanStack Query caches response (network tab shows single request)
- [ ] Superjson serializes Date objects correctly
