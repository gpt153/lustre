# Epic: wave-2b-umami-integration
**Wave:** 2
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Deploy Umami self-hosted analytics via Helm chart, add tracking script to web app, and embed the Umami dashboard iframe in the admin analytics page.

## Context
- Umami v2 is a self-hosted, privacy-first web analytics tool (PostgreSQL backend)
- Helm chart pattern: see `infrastructure/helm/web/` — Chart.yaml + values.yaml + templates/
- Web app: `apps/web/app/layout.tsx` — root layout where tracking script goes
- Admin app: `apps/admin/app/analytics/page.tsx` — embed Umami iframe for web traffic stats
- Umami runs as a Node.js service, port 3000, connects to PostgreSQL
- Image: `ghcr.io/umami-software/umami:postgresql-latest`
- Env vars: `DATABASE_URL` (PostgreSQL), `APP_SECRET` (random string)
- Umami will be at `umami.lovelustre.com` — admin only, basic auth via Umami's own auth
- Web tracking: `NEXT_PUBLIC_UMAMI_WEBSITE_ID` env var, `NEXT_PUBLIC_UMAMI_URL` = `https://umami.lovelustre.com`

## Acceptance Criteria
1. `infrastructure/helm/umami/Chart.yaml` created — name `lustre-umami`, description `Umami Analytics`, version 0.1.0
2. `infrastructure/helm/umami/values.yaml` created — image `ghcr.io/umami-software/umami:postgresql-latest`, replicaCount 1, service port 3000, ingress host `umami.lovelustre.com` with TLS (cert-manager), env vars: `DATABASE_URL` from `lustre-secrets` secret key `database-url`, `APP_SECRET` from `lustre-secrets` secret key `umami-app-secret`
3. `infrastructure/helm/umami/templates/deployment.yaml` created — standard k8s Deployment with env from secretKeyRef for DATABASE_URL and APP_SECRET, liveness/readiness probes on `/api/heartbeat`
4. `infrastructure/helm/umami/templates/service.yaml` created — ClusterIP service port 3000
5. `infrastructure/helm/umami/templates/ingress.yaml` created — Traefik ingress for `umami.lovelustre.com` with TLS
6. `apps/web/app/layout.tsx` updated — add `<Script>` tag (next/script strategy="afterInteractive") for Umami tracking: `src={process.env.NEXT_PUBLIC_UMAMI_URL + '/script.js'}` with `data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}`, only rendered when both env vars are set
7. `apps/admin/app/analytics/page.tsx` updated — add Umami stats iframe section: `<iframe src={umamiUrl + '/share/...'}>` with `NEXT_PUBLIC_UMAMI_URL` env var; shows "Configure NEXT_PUBLIC_UMAMI_URL to enable Umami analytics" when env var is not set
8. `infrastructure/helm/web/values.yaml` updated — add `NEXT_PUBLIC_UMAMI_URL` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` env vars (with placeholder values)

## File Paths
- `infrastructure/helm/umami/Chart.yaml` (CREATE)
- `infrastructure/helm/umami/values.yaml` (CREATE)
- `infrastructure/helm/umami/templates/deployment.yaml` (CREATE)
- `infrastructure/helm/umami/templates/service.yaml` (CREATE)
- `infrastructure/helm/umami/templates/ingress.yaml` (CREATE)
- `apps/web/app/layout.tsx` (EDIT — add tracking script)
- `apps/admin/app/analytics/page.tsx` (EDIT — add Umami iframe section)
- `infrastructure/helm/web/values.yaml` (EDIT — add Umami env vars)
