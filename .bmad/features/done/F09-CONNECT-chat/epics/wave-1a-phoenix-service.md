# Epic: wave-1a-phoenix-service
**Model:** sonnet
**Wave:** 1

## Goal
Create a production-grade Elixir/Phoenix application in `services/realtime/` that provides WebSocket connections via Phoenix Channels, authenticates users with the same HS256 JWT tokens issued by the Fastify API, and routes messages through `user:*` and `conversation:*` channels.

## Context

### Codebase
- Monorepo at `~/lustre` (Turborepo + pnpm)
- `services/api/` — Fastify + TypeScript + Prisma (existing)
- `services/realtime/` — does NOT exist yet; create from scratch
- `infrastructure/helm/api/` — example Helm chart pattern to follow for `realtime`
- Git branch: `main`

### JWT contract (MUST match Fastify)
- Algorithm: HS256
- Payload: `{ sub: <userId UUID>, type: "access" }` (type "refresh" must be rejected)
- Secret: environment variable `PHX_JWT_SECRET` (same value as Fastify's `JWT_SECRET`)
- Library: use `joken` Elixir library

### Existing infrastructure
- PostgreSQL 17 — `DATABASE_URL` env var (same DB as Fastify)
- Redis 7 — `REDIS_URL` env var
- NATS JetStream — `NATS_URL` env var (for publishing message events to Fastify consumers)
- k3s cluster, Helm charts in `infrastructure/helm/`

## Acceptance Criteria

1. `services/realtime/` contains a valid `mix.exs` with `phoenix`, `phoenix_pubsub`, `joken`, `postgrex`, `ecto_sql`, `jason` dependencies
2. `services/realtime/lib/realtime/application.ex` starts the Phoenix endpoint, PubSub, and Ecto repo
3. `services/realtime/lib/realtime_web/endpoint.ex` has WebSocket transport at `/socket` using `UserSocket`
4. `services/realtime_web/channels/user_socket.ex` verifies JWT on connect: rejects invalid/expired tokens, accepts valid `access` tokens, assigns `current_user_id`
5. `services/realtime/lib/realtime_web/channels/conversation_channel.ex` handles `conversation:{id}` channels; joins only if `current_user_id` is a participant (query PostgreSQL); broadcasts `new_message` events to all participants
6. `services/realtime/lib/realtime_web/channels/user_channel.ex` handles `user:{userId}` channel; allows join only if `current_user_id == userId`; used for presence and match notifications
7. `services/realtime/config/config.exs`, `dev.exs`, `prod.exs`, `runtime.exs` — proper Phoenix config with env var reads in runtime.exs
8. `infrastructure/helm/realtime/` — Helm chart (Chart.yaml, values.yaml, templates/deployment.yaml, service.yaml, ingress.yaml) mirroring the api chart pattern; service on port 4001; ingress host `ws.lovelustre.com`
9. `services/realtime/Dockerfile` — multi-stage Elixir build (elixir:1.17-alpine builder, runtime stage)
10. `services/realtime/lib/realtime/repo.ex` — Ecto repo configured to use the same PostgreSQL DATABASE_URL

## Files to Create

- `services/realtime/mix.exs`
- `services/realtime/mix.lock` (generate via `mix deps.get` in agent or write manually)
- `services/realtime/config/config.exs`
- `services/realtime/config/dev.exs`
- `services/realtime/config/prod.exs`
- `services/realtime/config/runtime.exs`
- `services/realtime/lib/realtime/application.ex`
- `services/realtime/lib/realtime/repo.ex`
- `services/realtime_web/endpoint.ex` → `services/realtime/lib/realtime_web/endpoint.ex`
- `services/realtime/lib/realtime_web/channels/user_socket.ex`
- `services/realtime/lib/realtime_web/channels/conversation_channel.ex`
- `services/realtime/lib/realtime_web/channels/user_channel.ex`
- `services/realtime/Dockerfile`
- `infrastructure/helm/realtime/Chart.yaml`
- `infrastructure/helm/realtime/values.yaml`
- `infrastructure/helm/realtime/templates/deployment.yaml`
- `infrastructure/helm/realtime/templates/service.yaml`
- `infrastructure/helm/realtime/templates/ingress.yaml`
