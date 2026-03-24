# Epic: Redis 7 Helm Chart

**Wave:** 1 | **Group:** A (parallel)
**Model:** haiku

## Description

Deploy Redis 7 with AOF persistence to k3s via a Helm chart. Includes PVC for data persistence and Sentinel sidecar for high availability.

## Acceptance Criteria

1. Helm chart at `infrastructure/helm/redis/` with Chart.yaml, values.yaml, and templates
2. StatefulSet runs `redis:7-alpine` image
3. AOF persistence enabled via redis.conf ConfigMap (`appendonly yes`, `appendfsync everysec`)
4. PVC with 5Gi storage for Redis data
5. Redis Sentinel sidecar for HA (monitors the Redis primary)
6. Kubernetes Service exposes Redis (6379) and Sentinel (26379)
7. Resource requests/limits defined
8. Liveness probe using `redis-cli ping`
9. Readiness probe using `redis-cli ping`
10. Secrets template for Redis password

## File Paths

- `infrastructure/helm/redis/Chart.yaml`
- `infrastructure/helm/redis/values.yaml`
- `infrastructure/helm/redis/templates/statefulset.yaml`
- `infrastructure/helm/redis/templates/service.yaml`
- `infrastructure/helm/redis/templates/pvc.yaml`
- `infrastructure/helm/redis/templates/configmap.yaml`
- `infrastructure/helm/redis/templates/secrets.yaml`
