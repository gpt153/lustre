# Lustre — Development Guide

## Project
Lustre is a sex-positive social network & dating platform for the Swedish market with US expansion potential.

## Stack
- **Mobile:** Expo (React Native) + Expo Router
- **Web:** Next.js 16
- **Monorepo:** Turborepo + Solito 5 + Tamagui + tRPC + Zod
- **API:** Node.js + Fastify + TypeScript + Prisma
- **Real-time:** Elixir + Phoenix Channels
- **Video/Voice:** LiveKit (self-hosted)
- **DB:** PostgreSQL 17 + PostGIS + pgvector
- **Cache:** Redis 7
- **Search:** Meilisearch
- **Events:** NATS JetStream
- **Hosting:** Hetzner (Helsinki) + Cloudflare + AWS (DRM only)
- **K8s:** k3s

## Branch Strategy
- `main` is the primary branch (NOT master)
- Feature branches: `feature/<feature-name>`
- All PRs target main

## Build & Run
```bash
pnpm install          # Install all deps
pnpm dev              # Run all apps in dev mode
pnpm build            # Build everything
pnpm test             # Run tests
```

## Key Directories
```
lustre/
  apps/
    mobile/          # Expo (iOS + Android)
    web/             # Next.js
  packages/
    app/             # Shared screens, hooks, logic
    ui/              # Shared UI components (Tamagui)
    api/             # Shared API client, types (tRPC + Zod)
  services/
    api/             # Fastify backend
    realtime/        # Elixir/Phoenix
    livekit/         # LiveKit config
  infra/
    k8s/             # Kubernetes manifests
    docker/          # Dockerfiles
```

## BMAD Planning
All feature planning in: `~/bodycontact-recon/.bmad/features/planned/`
Master roadmap: `~/bodycontact-recon/.bmad/MASTER-ROADMAP.md`

## Rules
- All users verified via BankID (Sweden) or Veriff (international)
- Real names NEVER shown in app — stored encrypted, released only via court order
- Pay-as-you-go token model — no subscriptions, no visible prices in app
- Safety features (SafeDate, Gatekeeper for recipients) are always FREE
- Stripe cannot be used (bans adult) — use Segpay/CCBill + Swish
