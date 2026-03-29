# E01 — Infrastructure & Seed Data

**Wave:** 1
**Model:** sonnet
**Depends on:** None

## Beskrivning

Säkerställ att backend körs med alla tjänster (PostgreSQL, Redis, Meilisearch, NATS), kör migrations, ladda seed data (20 profiler med foton, posts, kink tags), och skapa mock-konversationer/meddelanden som saknas i befintlig seed.

## Acceptance Criteria

1. `docker compose up -d` startar alla tjänster utan fel
2. `npx prisma migrate deploy` kör alla migrationer
3. `npx prisma db seed` laddar 20 dev-profiler med foton, bios, posts
4. Seed-scriptet skapar minst 5 mock-konversationer mellan dev-profiler med 3+ meddelanden var
5. Seed-scriptet skapar minst 10 mock-swipes/matches så discover-stacken har data
6. API health endpoint (`GET /health`) returnerar `status: "ok"`
7. tRPC `post.feed` returnerar minst 10 posts
8. tRPC `match.getDiscoveryStack` returnerar minst 5 profiler

## File Paths

- `services/api/prisma/seed-dev-users.ts` (utöka med konversationer och matches)
- `services/api/prisma/seed.ts` (verifiera att det anropar dev-seed)
- `docker-compose.yml` (verifiera att allt startar)

## Testgate

**BLOCKING: Denna wave får INTE markeras DONE utan verifierade API-svar.**
- [ ] Health endpoint OK
- [ ] 20 profiler queryable via API
- [ ] 10+ posts i feed
- [ ] 5+ konversationer med meddelanden
- [ ] 5+ profiler i discovery stack
