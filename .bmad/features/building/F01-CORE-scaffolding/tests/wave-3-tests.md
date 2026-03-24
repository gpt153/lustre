# Test Specification: F01 Wave 3 — Infrastructure & CI/CD

## CI Tests
- [ ] GitHub Actions CI triggers on PR to main
- [ ] CI completes lint + typecheck + test in under 10 minutes
- [ ] Docker build for API produces valid image
- [ ] Docker build for web produces valid image
- [ ] Images pushed to ghcr.io on merge to main

## Infrastructure Tests
- [ ] k3s cluster has 3 healthy nodes (`kubectl get nodes` shows Ready)
- [ ] api.lovelustre.com responds with 200 over HTTPS
- [ ] app.lovelustre.com serves Next.js app over HTTPS
- [ ] TLS certificate valid and auto-provisioned by cert-manager
- [ ] Helm rollback works (`helm rollback lustre-api 1` succeeds)

## Local Development Tests
- [ ] `docker-compose up` starts all services (api, web, postgres, redis)
- [ ] API connects to local PostgreSQL
- [ ] Web app connects to local API
