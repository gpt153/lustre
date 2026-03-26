# Epic: wave-1a-medusa-setup

**Wave:** 1
**Model:** sonnet
**Status:** NOT_STARTED

## Goal
Deploy Medusa.js v2 as a k3s service with its own PostgreSQL schema, expose admin dashboard at `shop-admin.lovelustre.com`, and configure JWT auth so Lustre API can call Medusa's storefront API.

## Context
- Medusa.js v2 is a headless e-commerce Node.js platform
- It runs as a standalone service with its own Postgres DB (separate schema in existing PG)
- Medusa admin dashboard is served at `/app` by default in v2
- Medusa v2 storefront API is at `/store`
- We'll use Medusa's publishable API key for storefront calls from Lustre tRPC
- Medusa admin API key will be stored in k8s secret for Lustre tRPC bridge
- Existing infra: k3s cluster, Helm charts in `infrastructure/helm/`, namespace `lustre-prod`

## Files to Create/Edit

1. `services/medusa/Dockerfile` — Multi-stage build: install medusa-app deps + build
2. `services/medusa/package.json` — Medusa v2 app dependencies
3. `services/medusa/medusa-config.ts` — DB, Redis, admin config, CORS for lustre domains
4. `infrastructure/helm/medusa/Chart.yaml` — Helm chart metadata
5. `infrastructure/helm/medusa/values.yaml` — Image, service port 9000, ingress shop-admin.lovelustre.com
6. `infrastructure/helm/medusa/templates/deployment.yaml` — Medusa deployment with secrets
7. `infrastructure/helm/medusa/templates/service.yaml` — ClusterIP service port 9000
8. `infrastructure/helm/medusa/templates/ingress.yaml` — Traefik ingress + TLS

## Acceptance Criteria

1. `services/medusa/Dockerfile` uses Node 20 alpine, installs `@medusajs/medusa@^2` deps, runs `medusa build` and serves with `medusa start`
2. `services/medusa/medusa-config.ts` sets `databaseUrl` from env `MEDUSA_DATABASE_URL`, `redisUrl` from env `REDIS_URL`, `adminCors` to `https://shop-admin.lovelustre.com`, `storeCors` to `https://lovelustre.com,https://api.lovelustre.com`
3. `services/medusa/medusa-config.ts` sets `http.jwtSecret` from env `JWT_SECRET` (reuses Lustre JWT secret so tokens are compatible)
4. `infrastructure/helm/medusa/values.yaml` sets ingress host `shop-admin.lovelustre.com`, service port 9000, resources `requests: {cpu: 200m, memory: 512Mi}`, `limits: {cpu: 1000m, memory: 1Gi}`
5. `infrastructure/helm/medusa/templates/deployment.yaml` mounts env vars `MEDUSA_DATABASE_URL`, `REDIS_URL`, `JWT_SECRET` from secret `lustre-secrets`, plus env `NODE_ENV=production`, `PORT=9000`
6. `infrastructure/helm/medusa/templates/deployment.yaml` includes livenessProbe and readinessProbe hitting `GET /health` on port 9000
7. `infrastructure/helm/medusa/templates/ingress.yaml` uses `cert-manager.io/cluster-issuer: letsencrypt-prod` annotation and `ingressClassName: traefik`
8. `infrastructure/helm/medusa/Chart.yaml` specifies `name: medusa`, `version: 0.1.0`, `appVersion: "2.0"`
9. `services/medusa/package.json` includes `@medusajs/medusa: ^2.0.0`, `@medusajs/framework: ^2.0.0` as dependencies and `medusa` as a script command
10. No TODO/FIXME comments anywhere — all files are complete and production-ready
