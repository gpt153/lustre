# Research: Tech Stack Validation & Integration Feasibility

**Date:** 2026-03-24
**Queries:**
- "Turborepo Expo React Native Next.js monorepo setup Tamagui Solito 2025 2026"
- "Criipto BankID integration React Native Expo 2025 2026"
- "Swish Handel API developer documentation Node.js 2025 2026"
- "Segpay API integration documentation developer 2025 2026"
- "PallyCon multi-DRM integration React Native video 2025 2026"
- "Sightengine NSFW API content moderation integration 2025 2026"
- "Elixir Phoenix Channels chat application production setup 2025 2026"
- "LiveKit self-hosted AI agent voice video React Native SDK 2025 2026"
- "k3s Hetzner Cloud production Kubernetes setup Helm 2025 2026"
- "Medusa.js v2 headless commerce React Native integration marketplace 2025 2026"

## Summary

All tech stack components are validated as production-ready with existing SDKs, documentation, and community support. No blockers found.

## Sources

- https://github.com/tamagui/starter-free — Tamagui + Solito + Next + Expo monorepo starter
- https://github.com/criipto/criipto-verify-expo — BankID Expo SDK (now Idura)
- https://developers.swish.app/ — Swish API v2 (v1 deprecated 2026-02-03)
- https://gethelp.segpay.com/docs/Content/DeveloperDocs/Home-DevDocs.htm — Segpay developer docs
- https://github.com/inka-pallycon/pallycon-react-native-sdk — PallyCon DRM React Native SDK
- https://sightengine.com/docs/reference — Sightengine API reference
- https://hexdocs.pm/phoenix/channels.html — Phoenix Channels docs
- https://docs.livekit.io/transport/sdk-platforms/expo/ — LiveKit Expo quickstart
- https://hetzner-k3s.com/ — hetzner-k3s production tool
- https://medusajs.com/blog/commerce-app-react-native-expo/ — Medusa + RN + Expo

## Key Findings

### Monorepo (Turborepo + Expo + Next.js + Tamagui + Solito)
- Expo SDK 52+ auto-detects monorepo, eliminating Metro config complexity
- Tamagui starter-free repo provides production-ready template
- Solito 5 bridges Next.js and React Navigation seamlessly
- 70-85% code sharing achievable between web and mobile
- **Decision: Use tamagui/starter-free as starting point**

### BankID via Criipto/Idura
- @criipto/verify-expo package supports app switching for Swedish BankID
- Criipto rebranded to Idura but code packages unchanged
- Supports MitID (DK), Norwegian BankID for Nordic expansion
- **Decision: Use @criipto/verify-expo for BankID integration**

### Swish Handel API
- v2 API current (v1 decommissioned 2026-02-03)
- @swishapp/api-client is the modern Node.js package
- Supports Payment Requests, Refunds, Recurring Payments
- **Decision: Use @swishapp/api-client for Swish integration**

### Segpay Payment Processing
- Full REST API with Processing API, Gateway Integration, SRS reporting
- Supports recurring billing, one-time payments
- EU-licensed for adult content
- **Decision: Segpay as primary card processor, Swish as Swedish alternative**

### PallyCon Multi-DRM
- React Native SDK available (pallycon-react-native-sdk)
- Supports Widevine (Android) + FairPlay (iOS)
- Based on react-native-video, streaming + download scenarios
- **Decision: PallyCon for ConsentVault DRM**

### Sightengine Content Moderation
- 110+ detection categories, 29 nudity classes
- 99.2% F1 accuracy on explicit content
- Real-time API for images and video
- **Decision: Sightengine for content classification**

### Elixir Phoenix Channels
- Single node handles hundreds of thousands of connections
- Redis adapter available for distributed deployments
- Production-proven at Discord scale
- **Decision: Phoenix Channels for chat/presence/notifications**

### LiveKit
- Official Expo quickstart documentation exists
- AI Agents framework for voice AI (perfect for AI Coach)
- Self-hosted is free, Apache 2.0
- React Native SDK production-ready
- **Decision: LiveKit for voice/video calls + AI Coach infrastructure**

### k3s on Hetzner
- hetzner-k3s tool creates HA cluster in 2-3 minutes
- Includes Cloud Controller Manager, CSI driver, autoscaler
- 40% lower operational costs vs alternatives
- **Decision: hetzner-k3s for Kubernetes deployment**

### Medusa.js v2
- Headless commerce with full API
- React Native + Expo integration documented
- Marketplace multi-vendor support in v2
- **Decision: Medusa.js for business webshops and marketplace backend**

## Impact on Design

All components validated. The monorepo structure should be:
```
lustre/
  apps/
    mobile/          # Expo (iOS + Android)
    web/             # Next.js 16
  packages/
    app/             # Shared screens, hooks, logic
    ui/              # Shared UI components (Tamagui)
    api/             # Shared API client, types, validation (tRPC + Zod)
  services/
    api/             # Fastify + Prisma backend
    realtime/        # Elixir Phoenix Channels
    ai/              # Python FastAPI microservices
    livekit/         # LiveKit config + AI agents
    commerce/        # Medusa.js instance
  infrastructure/
    k8s/             # Helm charts
    terraform/       # Hetzner provisioning
    docker/          # Dockerfiles
```
