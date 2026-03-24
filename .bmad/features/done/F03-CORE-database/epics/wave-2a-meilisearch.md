# Epic: Meilisearch Helm Chart + API Integration

**Wave:** 2 | **Group:** A (parallel)
**Model:** haiku

## Description

Deploy Meilisearch to k3s via Helm chart and integrate it into the API service with a client module and index configuration for user profiles.

## Acceptance Criteria

1. Helm chart at `infrastructure/helm/meilisearch/` with Chart.yaml, values.yaml, and templates
2. Deployment runs `getmeili/meilisearch:v1.12` image
3. PVC with 10Gi storage for Meilisearch data
4. Kubernetes Service exposes port 7700
5. Resource requests/limits defined
6. `meilisearch` package added to `services/api/package.json`
7. Meilisearch client module at `services/api/src/lib/meilisearch.ts` with singleton pattern
8. Profile index configuration with searchable attributes (displayName) and filterable attributes (status)
9. Health endpoint updated to include Meilisearch status
10. Environment variable `MEILI_URL` and `MEILI_MASTER_KEY` configured

## File Paths

- `infrastructure/helm/meilisearch/Chart.yaml`
- `infrastructure/helm/meilisearch/values.yaml`
- `infrastructure/helm/meilisearch/templates/deployment.yaml`
- `infrastructure/helm/meilisearch/templates/service.yaml`
- `infrastructure/helm/meilisearch/templates/pvc.yaml`
- `infrastructure/helm/meilisearch/templates/secrets.yaml`
- `services/api/src/lib/meilisearch.ts`
- `services/api/package.json`
