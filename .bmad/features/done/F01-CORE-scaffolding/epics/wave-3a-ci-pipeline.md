# Epic: CI/CD Pipeline | Wave-3a

**Wave:** 3
**Model:** haiku
**Dependencies:** wave-2b

## Description

Set up GitHub Actions CI/CD pipeline that runs on every push to main and on pull requests. The pipeline lints all packages, runs TypeScript type checking, runs unit tests, and builds Docker images for the API server and web app. On merge to main, images are pushed to GitHub Container Registry (ghcr.io). Include caching for pnpm store and Turborepo remote cache.

## File paths
1. .github/workflows/ci.yml
2. .github/workflows/deploy.yml
3. services/api/Dockerfile
4. apps/web/Dockerfile
5. docker-compose.yml

## Implementation steps
1. Create .github/workflows/ci.yml: trigger on push/PR to main, pnpm setup, pnpm install with cache, turbo lint, turbo typecheck, turbo test
2. Configure Turborepo remote cache in ci.yml (TURBO_TOKEN, TURBO_TEAM env vars)
3. Create .github/workflows/deploy.yml: trigger on push to main (after CI passes), build Docker images, push to ghcr.io/lovelustre/api and ghcr.io/lovelustre/web
4. Update services/api/Dockerfile: multi-stage build (deps, build, runtime), node:22-alpine, expose 4000
5. Create apps/web/Dockerfile: multi-stage build, Next.js standalone output, node:22-alpine, expose 3000
6. Create docker-compose.yml for local development: api, web, postgres, redis, meilisearch services
7. Add GITHUB_TOKEN permissions for ghcr.io push in deploy workflow

## Acceptance Criteria
1. CI runs lint + typecheck + test on PR creation
2. CI completes in under 10 minutes
3. Docker images build successfully for api and web
4. Images pushed to ghcr.io on merge to main
5. docker-compose up starts all services locally
