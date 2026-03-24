# ADR-001: Polyglot Microservice Architecture with TypeScript, Elixir, Python

**Status:** Proposed

## Context

Lustre needs to handle three fundamentally different workloads:
1. **CRUD operations** (profiles, events, payments) — request/response
2. **Real-time communication** (chat, presence, typing indicators) — persistent connections
3. **AI/ML processing** (content classification, coaching, recommendations) — compute-intensive

A single-language solution would require compromises. Node.js handles CRUD well but struggles with massive concurrent connections. Elixir excels at real-time but its ecosystem for AI/ML is limited. Python dominates AI/ML but is poor for API servers.

## Decision

Three primary languages, each for their strength:
- **TypeScript (Node.js + Fastify)** — Core API, tRPC, shared types with frontend
- **Elixir (Phoenix Channels)** — Chat, presence, notifications, real-time events
- **Python (FastAPI)** — AI/ML microservices (content classification, recommendations, coaching logic)

Communication between services via NATS JetStream (events) and direct HTTP/gRPC (synchronous calls).

## Consequences

**Positive:**
- Each workload uses the best tool
- Elixir single node handles 100K+ concurrent connections (proven at Discord)
- Python gives access to all ML libraries (Sightengine, embeddings, recommendation engines)
- TypeScript shared with frontend = type safety end-to-end

**Negative:**
- Three language ecosystems to maintain
- Deployment complexity (three different build pipelines)
- Team needs polyglot skills or separate specialists
- Inter-service communication adds latency vs monolith

## Alternatives Considered

1. **All TypeScript** — Possible but Phoenix Channels dramatically outperforms Socket.io for real-time. Python ML ecosystem has no TypeScript equivalent.
2. **All Elixir** — Limited frontend code sharing, smaller hiring pool, weaker ORM ecosystem.
3. **Managed services (Ably, Pusher)** — $2-5K/month at 50K connections vs $50-100 for self-hosted Elixir.
