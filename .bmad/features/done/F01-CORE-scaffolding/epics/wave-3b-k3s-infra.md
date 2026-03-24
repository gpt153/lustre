# Epic: k3s Infrastructure on Hetzner | Wave-3b

**Wave:** 3
**Model:** sonnet
**Dependencies:** wave-3a

## Description

Provision a production k3s Kubernetes cluster on Hetzner Cloud Helsinki using hetzner-k3s. Configure Traefik as ingress controller with Cloudflare DNS and Let's Encrypt TLS. Create Helm charts for the API server and web app deployments. Set up Cloudflare DNS records for lovelustre.com subdomains. Configure persistent volume claims for future database needs. This epic requires sonnet due to infrastructure complexity and security considerations across multiple providers.

## File paths
1. infrastructure/hetzner-k3s.yaml
2. infrastructure/helm/api/Chart.yaml
3. infrastructure/helm/api/values.yaml
4. infrastructure/helm/api/templates/deployment.yaml
5. infrastructure/helm/web/Chart.yaml
6. infrastructure/helm/web/values.yaml
7. infrastructure/helm/web/templates/deployment.yaml
8. infrastructure/helm/web/templates/ingress.yaml

## Implementation steps
1. Create infrastructure/hetzner-k3s.yaml: cluster name lustre-prod, location helsinki, 3 CX31 nodes (2vCPU, 8GB), private networking, Traefik as ingress
2. Document manual step: run `hetzner-k3s create --config hetzner-k3s.yaml` with Hetzner API token
3. Create Helm chart for API: Deployment (2 replicas, image from ghcr.io, port 4000, resource limits, readiness/liveness probes on /health), Service (ClusterIP), HPA (min 2, max 10, CPU target 70%)
4. Create Helm chart for web: Deployment (2 replicas, port 3000), Service, Ingress (host: app.lovelustre.com, TLS via cert-manager)
5. Create API Ingress: host api.lovelustre.com, TLS, rate limiting annotations
6. Document Cloudflare DNS setup: A records for api.lovelustre.com and app.lovelustre.com pointing to Hetzner load balancer IP
7. Create namespace manifest: lustre-prod namespace with resource quotas
8. Create sealed-secrets or external-secrets config for managing DATABASE_URL, API keys
9. Add cert-manager ClusterIssuer for Let's Encrypt production
10. Create deploy script that runs `helm upgrade --install` for both charts

## Acceptance Criteria
1. k3s cluster running with 3 nodes in Hetzner Helsinki
2. api.lovelustre.com returns health check over HTTPS
3. app.lovelustre.com serves Next.js app over HTTPS
4. Helm upgrade performs rolling deployment with zero downtime
5. TLS certificates auto-renew via cert-manager
