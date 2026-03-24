# Master Roadmap: Lustre Platform

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Total features:** 27
**Total epics:** ~148
**Estimated phases:** 9

---

## Phase 1: Foundation
**Features:** F01 (Scaffolding), F02 (Auth), F03 (Database)
**Estimated duration:** 4-6 weeks

### Dependencies:
- F01 has no dependencies (start here)
- F02 depends on F01 (API server) and F03 (database)
- F03 depends on F01 (k3s cluster)

### Build order:
```
F01 Wave 1 (monorepo + app shells)
  |
  +--> F01 Wave 2 (backend API)
  |       |
  |       +--> F03 Wave 1 (PostgreSQL + Redis) -- parallel with F01 Wave 3
  |       |       |
  |       |       +--> F02 Wave 1 (user schema + auth)
  |       |               |
  |       |               +--> F02 Wave 2 (Swish + anonymity)
  |       |                       |
  |       |                       +--> F02 Wave 3 (auth screens)
  |       |
  |       +--> F01 Wave 3 (CI/CD + k3s infra) -- parallel with F03
  |
  +--> F03 Wave 2 (Meilisearch + NATS) -- after Wave 1
```

### Phase 1 Testgate:
- [ ] Monorepo builds, mobile + web apps run
- [ ] API server deployed to k3s
- [ ] BankID registration works end-to-end
- [ ] PostgreSQL, Redis, Meilisearch running

---

## Phase 2: Core Social
**Features:** F04 (Profiles), F25 (Dual Mode), F23 (Token System), F05 (Feed)
**Estimated duration:** 4-6 weeks

### Dependencies:
- F04 depends on F02 (auth)
- F25 depends on F04 (profiles have mode field)
- F23 depends on F02 (auth for user identity)
- F05 depends on F04 (profiles) and F24 (classification, but can use basic version)

### Build order:
```
F04 Wave 1 (profile schema + API)
  |
  +--> F04 Wave 2 (photo upload + search) -- parallel with F25 Wave 1
  |       |                                      |
  |       +--> F04 Wave 3 (profile screens)      +--> F25 Wave 2 (mode UI)
  |               |
  |               +--> F05 Wave 1 (post schema)
  |                       |
  |                       +--> F05 Wave 2 (classification + feed algo)
  |                               |
  |                               +--> F05 Wave 3 (feed screens)
  |
  +--> F23 Wave 1 (token core) -- parallel with F04
          |
          +--> F23 Wave 2 (payment integration)
                  |
                  +--> F23 Wave 3 (payment page + app integration)
```

### Phase 2 Testgate:
- [ ] Profile creation and onboarding work
- [ ] Vanilla/Spicy toggle works
- [ ] Feed shows posts with content filters
- [ ] Token system deducts balance
- [ ] Swish auto-topup works

---

## Phase 3: Connect MVP
**Features:** F08 (Matching), F09 (Chat), F07 (Gatekeeper), F24 (Content Moderation)
**Estimated duration:** 5-7 weeks

### Dependencies:
- F08 depends on F04 (profiles)
- F09 depends on F03 (Phoenix Channels need deploy), F08 (conversations from matches)
- F07 depends on F09 (chat UI), F04 (profile preferences), F23 (tokens)
- F24 depends on F05 (feed content) or can work standalone

### Build order:
```
F24 Wave 1 (Sightengine + moderation) -- parallel with F08
  |                                          |
  +--> F24 Wave 2 (moderation tools)         +--> F08 Wave 1 (matching backend)
                                             |       |
                                             |       +--> F08 Wave 2 (discover screens)
                                             |               |
                                             |               +--> F09 Wave 1 (Phoenix setup)
                                             |                       |
                                             |                       +--> F09 Wave 2 (chat features)
                                             |                               |
                                             |                               +--> F09 Wave 3 (chat screens)
                                             |                                       |
                                             |                                       +--> F07 Wave 1 (gatekeeper backend)
                                             |                                               |
                                             |                                               +--> F07 Wave 2 (AI qualification)
                                             |                                                       |
                                             |                                                       +--> F07 Wave 3 (screens + bypass)
```

### Phase 3 Testgate:
- [ ] Swipe discovery works with matches
- [ ] Real-time chat works between matched users
- [ ] AI Gatekeeper qualifies senders
- [ ] Content moderation classifies uploads
- [ ] Dick-pic filter works

---

## Phase 4: Safety
**Features:** F13 (SafeDate), F06 (Groups)
**Estimated duration:** 3-4 weeks

### Build order:
```
F13 Wave 1 (SafeDate backend) -- parallel with F06 Wave 1 (groups backend)
  |                                     |
  +--> F13 Wave 2 (SafeDate screens)    +--> F06 Wave 2 (group screens)
```

### Phase 4 Testgate:
- [ ] SafeDate GPS tracking works
- [ ] Escalation chain sends SMS to contacts
- [ ] Groups create/join/moderate works

---

## Phase 5: Voice/Video & Events
**Features:** F10 (Voice/Video), F11 (Events)
**Estimated duration:** 3-5 weeks

### Build order:
```
F10 Wave 1 (LiveKit backend) -- parallel with F11 Wave 1 (events backend)
  |                                     |
  +--> F10 Wave 2 (call screens)        +--> F11 Wave 2 (ticketing + discovery)
                                        |       |
                                        |       +--> F11 Wave 3 (event screens)
```

### Phase 5 Testgate:
- [ ] Voice and video calls work
- [ ] Event creation with targeting works
- [ ] Event ticketing via Swish works
- [ ] Map-based event discovery works

---

## Phase 6: Learn Platform
**Features:** F15 (Coach Engine), F16 (Coach Vanilla), F18 (Gamification)
**Estimated duration:** 4-6 weeks

### Build order:
```
F15 Wave 1 (AI agent backend)
  |
  +--> F15 Wave 2 (coach screens)
          |
          +--> F16 Wave 1 (module framework + content) -- parallel with F18 Wave 1
          |       |                                              |
          |       +--> F16 Wave 2 (module screens)               +--> F18 Wave 2 (gamification screens)
```

### Phase 6 Testgate:
- [ ] AI coach responds in voice/text sessions
- [ ] Vanilla modules 1-3 playable
- [ ] Badges awarded on completion
- [ ] Streaks tracked

---

## Phase 7: Advanced Features
**Features:** F12 (Organizations), F14 (ConsentVault), F17 (Coach Spicy), F19 (Sexual Health)
**Estimated duration:** 5-7 weeks

### Build order:
```
F12 Wave 1+2 (organizations) -- parallel with F14 Wave 1+2+3 (ConsentVault)
                                -- parallel with F17 Wave 1+2 (spicy coaching)
                                -- parallel with F19 Wave 1+2 (sexual health)
```

### Phase 7 Testgate:
- [ ] Organization profiles verified and managed
- [ ] ConsentVault DRM recording works
- [ ] Spicy coaching modules playable
- [ ] Education articles and podcasts accessible

---

## Phase 8: Commerce
**Features:** F20 (Marketplace), F21 (Business Shops), F22 (Advertising)
**Estimated duration:** 4-6 weeks

### Build order:
```
F20 Wave 1+2+3 (marketplace) -- sequential (Swish escrow depends on listing system)
F21 Wave 1+2 (business shops) -- after F20 Wave 2 (shares payment infra)
F22 Wave 1+2 (advertising) -- parallel with F20/F21
```

### Phase 8 Testgate:
- [ ] P2P marketplace with Swish escrow works
- [ ] Business webshops via Medusa works
- [ ] Self-serve ads appear in feed

---

## Phase 9: Admin & Growth
**Features:** F26 (Admin Dashboard), F27 (Migration)
**Estimated duration:** 2-3 weeks

### Build order:
```
F26 Wave 1+2 (admin dashboard) -- parallel with F27 Wave 1+2 (migration + landing page)
```

### Phase 9 Testgate:
- [ ] Admin dashboard operational
- [ ] Landing page live for pre-launch
- [ ] BodyContact migration works
- [ ] Referral system tracks invites

---

## Total Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 1: Foundation | 4-6 weeks | 4-6 weeks |
| 2: Core Social | 4-6 weeks | 8-12 weeks |
| 3: Connect MVP | 5-7 weeks | 13-19 weeks |
| 4: Safety | 3-4 weeks | 16-23 weeks |
| 5: Voice/Video/Events | 3-5 weeks | 19-28 weeks |
| 6: Learn Platform | 4-6 weeks | 23-34 weeks |
| 7: Advanced | 5-7 weeks | 28-41 weeks |
| 8: Commerce | 4-6 weeks | 32-47 weeks |
| 9: Admin/Growth | 2-3 weeks | 34-50 weeks |

**MVP (Phases 1-4):** 16-23 weeks (4-6 months)
**Full platform:** 34-50 weeks (8-12 months)

---

## Sonnet-Required Epics (Complexity Justification)

| Epic | Feature | Reason |
|------|---------|--------|
| wave-3b-k3s-infra | F01 | Multi-provider infrastructure (Hetzner + Cloudflare + cert-manager) |
| wave-1c-bankid-service | F02 | BankID integration with security-critical identity handling |
| wave-2a-swish-payment | F02 | Payment API with callback handling and account activation |
| wave-1a-phoenix-service | F09 | Elixir service from scratch with JWT auth and channel architecture |
| wave-1a-livekit-setup | F10 | LiveKit server deployment with TURN/STUN and JWT |
| wave-2a-ai-qualification | F07 | AI prompt engineering with multi-turn conversation management |
| wave-2b-gatekeeper-flow | F07 | Complex orchestration: intercept, AI conversation, pass/fail, delivery |
| wave-2a-sightengine-service | F24 | External API integration with multi-label parsing |
| wave-2a-feed-algorithm | F05 | Scoring algorithm with multiple dimensions |
| wave-2b-feed-algorithm | F05 | SQL query optimization for feed ranking |
| wave-1a-ai-agent-service | F15 | LiveKit AI Agents + STT + LLM + TTS pipeline |
| wave-1b-coach-personas | F15 | AI persona design with distinct behaviors |
| wave-1c-vanilla-content | F16 | Content design for 10 coaching modules |
| wave-1b-spicy-content | F17 | Sensitive content design with consent integration |
| wave-2a-drm-pipeline | F14 | AWS MediaConvert + PallyCon DRM pipeline |
| wave-2b-recording-upload | F14 | Video streaming upload with DRM packaging |
| wave-3a-consent-mobile | F14 | Bluetooth proximity + DRM player + consent UI |
| wave-1b-safedate-api | F13 | Escalation chain with background jobs and SMS |
| wave-1c-gps-streaming | F13 | Background GPS with encrypted storage |
| wave-2a-safedate-screens-mobile | F13 | Background geolocation + SOS button |
| wave-2a-swish-topup | F23 | Swish Recurring API integration |
| wave-2b-segpay-topup | F23 | Segpay API integration |
| wave-2a-escrow-payment | F20 | Swish escrow payment flow |
| wave-2b-seller-payout | F20 | Swish Payout with commission calculation |
| wave-1a-medusa-setup | F21 | Medusa.js deployment with auth bridge |
| wave-2c-ad-delivery | F22 | Ad targeting engine matching against user profiles |
| wave-1b-article-generator | F19 | AI article generation pipeline |
| wave-1c-podcast-generator | F19 | ElevenLabs GenFM integration |
| wave-2a-bodycontact-import | F27 | Web scraping with consent flow |

**Total: 29 sonnet epics out of ~148 total (~20%)**
