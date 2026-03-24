# PRD: Scaffolding — Monorepo, CI/CD, Hetzner, k3s

## Overview

Set up the Lustre monorepo with Turborepo, Expo, Next.js, Fastify backend, and deployment infrastructure on Hetzner Cloud with k3s. This is the foundation everything else builds on.

## Target Audience

Development team (internal)

## Functional Requirements (FR)

### FR-1: Monorepo Structure
- Priority: Must
- Acceptance criteria:
  - Given a fresh clone, when running `pnpm install`, then all dependencies resolve without errors
  - Given the monorepo, when running `pnpm build`, then all packages and apps compile successfully
  - Given the structure, then apps/mobile (Expo), apps/web (Next.js), packages/app, packages/ui, packages/api exist

### FR-2: Mobile App Shell (Expo)
- Priority: Must
- Acceptance criteria:
  - Given the mobile app, when built with EAS, then it produces iOS and Android builds
  - Given the app, when launched, then it shows a splash screen and navigates to a placeholder home screen
  - Given Expo Router, then file-based routing is configured and working

### FR-3: Web App Shell (Next.js)
- Priority: Must
- Acceptance criteria:
  - Given the web app, when running `pnpm dev`, then it starts on localhost:3000
  - Given SSR, when visiting any page, then it renders server-side with correct meta tags

### FR-4: Backend API Shell (Fastify)
- Priority: Must
- Acceptance criteria:
  - Given the API, when calling GET /health, then it returns 200 with status ok
  - Given tRPC, then a sample procedure is callable from both web and mobile clients

### FR-5: CI/CD Pipeline
- Priority: Must
- Acceptance criteria:
  - Given a push to main, when CI runs, then it lints, type-checks, and runs tests for all packages
  - Given a successful CI run, then Docker images are built and pushed to registry

### FR-6: Hetzner k3s Cluster
- Priority: Must
- Acceptance criteria:
  - Given hetzner-k3s config, when deployed, then a 3-node k3s cluster is running in Helsinki
  - Given Traefik ingress, then HTTPS termination works for api.lovelustre.com and app.lovelustre.com

### FR-7: Helm Charts
- Priority: Must
- Acceptance criteria:
  - Given Helm charts, when deployed to k3s, then the API, web app, and required services are running
  - Given rolling deployments, when updating a chart, then zero-downtime deployment occurs

## Non-Functional Requirements (NFR)

- Build time for full monorepo: < 5 minutes (with Turborepo cache)
- CI pipeline: < 10 minutes
- k3s cluster provisioning: < 5 minutes
- All secrets managed via Kubernetes secrets or external secret operator

## Affected Systems

New project — no existing systems affected.

## MVP Scope

FR-1 through FR-6 are MVP. FR-7 (Helm charts) can be simplified initially.

## Risks and Dependencies

- Hetzner account and payment method required
- Domain lovelustre.com DNS must be configured in Cloudflare
- Apple Developer + Google Play accounts for EAS builds
- GitHub Actions or similar CI service
