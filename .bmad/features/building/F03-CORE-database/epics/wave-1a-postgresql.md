# Epic: PostgreSQL 17 Helm Chart

**Wave:** 1 | **Group:** A (parallel)
**Model:** haiku

## Description

Deploy PostgreSQL 17 with PostGIS and pgvector extensions to k3s via a Helm chart. Includes PVC for persistent storage, PgBouncer sidecar for connection pooling, and a CronJob for daily backups to Cloudflare R2.

## Acceptance Criteria

1. Helm chart at `infrastructure/helm/postgresql/` with Chart.yaml, values.yaml, and templates
2. StatefulSet runs `postgis/postgis:17-3.5` image (includes PostGIS; pgvector added via init)
3. Init container or SQL init script enables `postgis` and `vector` extensions on the `lustre` database
4. PVC with 20Gi storage for PostgreSQL data
5. PgBouncer sidecar container in the StatefulSet pod for connection pooling (port 6432)
6. Kubernetes Service exposes PostgreSQL (5432) and PgBouncer (6432)
7. CronJob that runs `pg_dump` daily and uploads to R2 via `rclone` or `aws s3 cp`
8. Resource requests/limits defined for all containers
9. Secrets template for DB credentials and R2 credentials
10. Liveness and readiness probes configured

## File Paths

- `infrastructure/helm/postgresql/Chart.yaml`
- `infrastructure/helm/postgresql/values.yaml`
- `infrastructure/helm/postgresql/templates/statefulset.yaml`
- `infrastructure/helm/postgresql/templates/service.yaml`
- `infrastructure/helm/postgresql/templates/pvc.yaml`
- `infrastructure/helm/postgresql/templates/backup-cronjob.yaml`
- `infrastructure/helm/postgresql/templates/secrets.yaml`
- `infrastructure/helm/postgresql/templates/configmap.yaml`
