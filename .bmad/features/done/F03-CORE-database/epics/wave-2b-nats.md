# Epic: NATS JetStream Helm Chart + API Integration

**Wave:** 2 | **Group:** A (parallel)
**Model:** haiku

## Description

Deploy NATS with JetStream to k3s via Helm chart and integrate it into the API service with a TypeScript client module and sample pub/sub flow.

## Acceptance Criteria

1. Helm chart at `infrastructure/helm/nats/` with Chart.yaml, values.yaml, and templates
2. StatefulSet runs `nats:2-alpine` image with JetStream enabled
3. PVC with 5Gi storage for JetStream data
4. Kubernetes Service exposes client (4222) and monitoring (8222) ports
5. Resource requests/limits defined
6. `nats` package added to `services/api/package.json`
7. NATS client module at `services/api/src/lib/nats.ts` with connect/disconnect and JetStream manager
8. Event publisher utility at `services/api/src/lib/events.ts` for publishing typed events
9. Health endpoint updated to include NATS connection status
10. Environment variable `NATS_URL` configured

## File Paths

- `infrastructure/helm/nats/Chart.yaml`
- `infrastructure/helm/nats/values.yaml`
- `infrastructure/helm/nats/templates/statefulset.yaml`
- `infrastructure/helm/nats/templates/service.yaml`
- `infrastructure/helm/nats/templates/pvc.yaml`
- `infrastructure/helm/nats/templates/configmap.yaml`
- `services/api/src/lib/nats.ts`
- `services/api/src/lib/events.ts`
