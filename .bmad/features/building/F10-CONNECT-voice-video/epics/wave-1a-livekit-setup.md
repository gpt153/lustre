# Epic: wave-1a-livekit-setup

**Wave:** 1
**Model:** sonnet
**Status:** NOT_STARTED

## Goal
Deploy a self-hosted LiveKit server on k3s and implement a JWT token service for room access. Includes TURN/STUN configuration for NAT traversal.

## Context

### Infrastructure pattern (follow existing helm charts in infrastructure/helm/)
- Existing charts: `postgresql`, `redis`, `meilisearch`, `nats`, `realtime`, `api`, `web`
- Chart structure: `Chart.yaml`, `values.yaml`, `templates/deployment.yaml`, `templates/service.yaml`, `templates/ingress.yaml`
- Secrets are pulled from the `lustre-secrets` k8s Secret via `secretKeyRef`
- Ingress uses `traefik` with cert-manager for TLS
- Example realtime ingress host: `ws.lovelustre.com` → follow same pattern for LiveKit: `livekit.lovelustre.com`

### LiveKit specifics
- LiveKit server docker image: `livekit/livekit-server:latest`
- LiveKit exposes:
  - Port 7880 (HTTP/WebSocket API + WebRTC signaling)
  - Port 7881 (RTC TCP fallback)
  - Port 50100-50200/UDP (media traffic, use hostNetwork or NodePort range)
- LiveKit config file (YAML) must be mounted via ConfigMap
- Key config options: `keys` (api_key: api_secret pairs), `turn` (enabled, domain, tls_port), `rtc.use_external_ip: true`

### Token service
- LiveKit provides `livekit-server-sdk` npm package
- Token generation: `new AccessToken(apiKey, apiSecret, {identity: userId}).addGrant({roomJoin: true, room: roomName}).toJwt()`
- Token endpoint should be a Fastify REST route (not tRPC) for simplicity: `POST /api/call/token`
- Token payload: `{ roomName, token, wsUrl }` where wsUrl = `wss://livekit.lovelustre.com`

### Fastify server location
- `services/api/src/server.ts` — registers all routes and middleware
- Pattern for adding REST route: see existing `/api/photos/upload`, `/api/posts/upload`
- Auth: extract Bearer token and call `verifyAccessToken(token)` from `services/api/src/auth/jwt.ts`

## Acceptance Criteria

1. `infrastructure/helm/livekit/Chart.yaml` exists with correct chart metadata
2. `infrastructure/helm/livekit/values.yaml` has image, service (ports 7880/7881), ingress (livekit.lovelustre.com), resources, and env configuration
3. `infrastructure/helm/livekit/templates/deployment.yaml` mounts LiveKit config as ConfigMap and exposes correct ports
4. `infrastructure/helm/livekit/templates/configmap.yaml` contains LiveKit YAML config with keys, port, rtc, turn, and logging sections
5. `infrastructure/helm/livekit/templates/service.yaml` exposes ports 7880 (ClusterIP) and 7881 (NodePort TCP fallback)
6. `infrastructure/helm/livekit/templates/ingress.yaml` routes `livekit.lovelustre.com` to port 7880 with TLS
7. `services/api/src/lib/livekit.ts` exports `generateCallToken(userId: string, roomName: string): Promise<string>` using `livekit-server-sdk`
8. `services/api/src/routes/call.ts` registers `POST /api/call/token` on the Fastify instance — verifies JWT, validates `conversationId` body param, creates room name `call-{conversationId}`, returns `{ token, wsUrl, roomName }`
9. `services/api/src/server.ts` imports and registers the call route
10. `services/api/package.json` includes `livekit-server-sdk` dependency

## File Paths
- `infrastructure/helm/livekit/Chart.yaml`
- `infrastructure/helm/livekit/values.yaml`
- `infrastructure/helm/livekit/templates/deployment.yaml`
- `infrastructure/helm/livekit/templates/configmap.yaml`
- `infrastructure/helm/livekit/templates/service.yaml`
- `infrastructure/helm/livekit/templates/ingress.yaml`
- `services/api/src/lib/livekit.ts`
- `services/api/src/routes/call.ts`
