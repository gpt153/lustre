# PRD: Database & Infrastructure Services

## Overview

Set up PostgreSQL 17 with PostGIS and pgvector extensions, Redis 7 for caching/sessions/geo, Meilisearch for full-text search, and NATS JetStream for event bus. All services deployed to k3s with Helm charts and persistent storage.

## Target Audience

Development team (internal)

## Functional Requirements (FR)

### FR-1: PostgreSQL with Extensions
- Priority: Must
- Acceptance criteria:
  - Given k3s deployment, when PostgreSQL starts, then PostGIS and pgvector extensions are available
  - Given Prisma, when running migrations, then they apply successfully against PostgreSQL 17

### FR-2: Redis Cache Layer
- Priority: Must
- Acceptance criteria:
  - Given Redis, when the API starts, then it connects and can set/get cache keys
  - Given session storage, when a user authenticates, then their session is stored in Redis

### FR-3: Meilisearch
- Priority: Should
- Acceptance criteria:
  - Given Meilisearch, when indexing a user profile, then it is searchable within 50ms

### FR-4: NATS JetStream
- Priority: Should
- Acceptance criteria:
  - Given NATS, when a service publishes an event, then subscribers receive it with exactly-once semantics

### FR-5: Monitoring Stack
- Priority: Should
- Acceptance criteria:
  - Given Grafana, when accessing the dashboard, then PostgreSQL, Redis, and API metrics are visible

## Non-Functional Requirements (NFR)

- PostgreSQL: automated daily backups to Cloudflare R2
- Redis: AOF persistence enabled
- All services with resource limits and requests defined

## MVP Scope

FR-1 and FR-2 are MVP. FR-3, FR-4, FR-5 are Phase 2.

## Risks and Dependencies

- Depends on F01 (k3s cluster)
- Persistent volume provisioning on Hetzner
