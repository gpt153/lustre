# Social Network + Dating Platform: Open-Source Research Catalog
**Date:** 2026-03-24 | **Status:** RESEARCH ONLY

---

## 1. DATING APPS & PLATFORMS

### Complete-Dating-App (Flutter + FastAPI)
- **URL:** https://github.com/helloharendra/Complete-Dating-App
- **Stars:** 26 | **Updated:** 2026-03-22 | **License:** MIT
- **Stack:** Flutter (Dart), FastAPI (Python), PostgreSQL, Redis, WebSockets
- **Features:** Swipe matching, AI-powered suggestions, real-time chat with typing indicators, secure auth, admin dashboard. Claims scalable to 10K+ users.
- **Use for us:** Most complete open-source dating app found. Flutter frontend + FastAPI backend is a solid modern stack. The matching algorithm, swipe UI, and real-time chat are all reusable.
- **Limitations:** Low star count (new project), small community. Would need significant hardening for production.

### Humbble (React Native + Expo)
- **URL:** https://github.com/Prakashchandra-007/humbble
- **Stars:** 44 | **Updated:** 2026-03-21 | **License:** MIT
- **Stack:** React Native, Expo, TypeScript
- **Features:** Swipe, match, chat. Designed as Bumble alternative with privacy focus.
- **Use for us:** React Native swipe mechanics and matching flow. Good reference for mobile-first dating UX.
- **Limitations:** Early stage, small community.

### recraft-react-native-dating-app
- **URL:** https://github.com/recraftrelic/recraft-react-native-dating-app
- **Stars:** 91 | **Updated:** 2025-12-09 | **License:** None specified
- **Stack:** React Native, TypeScript
- **Use for us:** UI templates and dating app screen layouts.
- **Limitations:** No license specified (risky for commercial use). Appears to be mostly UI templates without backend.

### Tinder Clone Compose (Android/Kotlin)
- **URL:** https://github.com/alejandro-piguave/TinderCloneCompose
- **Stars:** ~50 | **Updated:** Recent | **License:** Check repo
- **Stack:** Jetpack Compose, Kotlin, Firebase, Clean Architecture, MVVM
- **Features:** Swipe matching, real-time chat, profile customization, Firebase Auth.
- **Use for us:** Clean Architecture patterns for dating apps. Good reference for Android-native implementation.
- **Limitations:** Android only, Firebase-dependent.

### AI-Powered Tinder Clone
- **URL:** https://github.com/mukeshlilawat1/Tinder-App-Clone
- **Stack:** React.js, Spring Boot, MongoDB, OpenAI API
- **Features:** AI-powered match suggestions, AI conversation starters.
- **Use for us:** AI integration patterns for matching and conversation features.
- **Limitations:** Java backend may not align with preferred stack.

---

## 2. SOCIAL NETWORK PLATFORMS

### Mastodon
- **URL:** https://github.com/mastodon/mastodon
- **Stars:** 49,788 | **Updated:** 2026-03-24 | **License:** AGPL-3.0
- **Stack:** Ruby on Rails, React, PostgreSQL, Redis, Sidekiq, Elasticsearch
- **Architecture lessons:**
  - ActivityPub federation protocol (W3C standard)
  - Microservices: web frontend, API, background jobs, streaming (WebSocket)
  - Content moderation tools built-in (reports, filters, domain blocks)
  - OAuth 2.0 authentication
  - Media processing pipeline (images, video, audio)
  - Push notifications via Web Push API
- **Use for us:** Feed architecture, content moderation patterns, notification system, media handling pipeline. The streaming architecture (ActionCable/WebSocket) is a good reference.
- **Limitations:** AGPL-3.0 means any modifications to server code must be open-sourced if deployed. Ruby on Rails may not fit our stack.

### Lemmy
- **URL:** https://github.com/LemmyNet/lemmy
- **Stars:** 14,321 | **Updated:** 2026-03-24 | **License:** AGPL-3.0
- **Stack:** Rust (backend), TypeScript/React (frontend), PostgreSQL, ActivityPub
- **Architecture lessons:**
  - Community/group-based social features
  - Voting and ranking algorithms
  - Moderation hierarchy (site admins, community moderators)
  - Rust backend = high performance
- **Use for us:** Community features, group management, voting/ranking algorithms, moderation system design.
- **Limitations:** AGPL-3.0. Reddit-style forum, not a dating/social feed platform.

### Pixelfed
- **URL:** https://github.com/pixelfed/pixelfed
- **Stars:** 6,926 | **Updated:** 2026-03-24 | **License:** AGPL-3.0
- **Stack:** PHP/Laravel, Vue.js, PostgreSQL/MySQL, ActivityPub
- **Features:** Photo sharing, Stories, Collections, Discover feed, Direct messaging.
- **Loops:** TikTok-style short video feature (alpha as of 2025).
- **Use for us:** Instagram-like photo sharing UX, Stories implementation, Discover/explore feed algorithm, Direct messaging.
- **Limitations:** AGPL-3.0. PHP/Laravel stack.

### Discourse
- **URL:** https://github.com/discourse/discourse
- **Stars:** 46,625 | **Updated:** 2026-03-24 | **License:** GPL-2.0
- **Stack:** Ruby on Rails, Ember.js, PostgreSQL, Redis
- **Features:** Forums, real-time notifications, user trust levels, moderation tools, plugin system, SSO.
- **Use for us:** Community/forum features, trust/reputation system, plugin architecture, moderation workflows, notification system.
- **Limitations:** GPL-2.0 license. Forum-focused, not social feed.

### OSSN (Open Source Social Network)
- **URL:** https://www.opensource-socialnetwork.org/
- **Stack:** PHP, MySQL
- **Features:** User profiles, friends, groups, messaging, newsfeed, photo sharing, marketplace.
- **Use for us:** Full social network feature reference. Has marketplace built in.
- **Limitations:** PHP stack. Older codebase design.

---

## 3. REAL-TIME COMMUNICATION

### LiveKit
- **URL:** https://github.com/livekit/livekit
- **Stars:** 17,770 | **Updated:** 2026-03-24 | **License:** Apache-2.0
- **Stack:** Go (server), SDKs for JS/React, Swift, Kotlin, Flutter, Python, Rust
- **Capabilities:**
  - Sub-100ms latency WebRTC
  - 100K simultaneous users per session
  - Video/audio rooms, screen sharing
  - Speaker detection, simulcast
  - End-to-end encryption
  - SVC codecs (VP9, AV1)
  - Moderation APIs
  - Multi-region distributed deployment
  - AI agent integration (conversational AI, voice agents)
  - Webhooks for server-side events
- **Use for us:** Video dating, live streaming, voice chat rooms, video calls. The AI agent integration could power AI-assisted video features. Flutter SDK means native mobile support.
- **Limitations:** Self-hosting requires infrastructure expertise. Cloud pricing can add up at scale.

### Jitsi Meet
- **URL:** https://github.com/jitsi/jitsi-meet
- **Stars:** 28,876 | **Updated:** 2026-03-24 | **License:** Apache-2.0
- **Stack:** TypeScript/React (frontend), Java (backend), WebRTC
- **Capabilities:**
  - Video conferencing with no account needed
  - Screen sharing, recording
  - Chat, reactions, polls
  - Breakout rooms
  - E2E encryption
  - Lobby/waiting room
  - Virtual backgrounds
- **Use for us:** Group video features (group dates, events). More mature than LiveKit for conferencing-style video. Could complement LiveKit for different use cases.
- **Limitations:** Heavier than LiveKit for 1:1 calls. More suited for meetings than social features.

### Matrix / Synapse
- **URL:** https://github.com/element-hq/synapse
- **Stars:** 3,924 | **Updated:** 2026-03-24 | **License:** AGPL-3.0
- **Stack:** Python/Twisted + Rust, PostgreSQL
- **Capabilities:**
  - Decentralized real-time messaging
  - E2E encryption (Olm/Megolm, based on Signal Protocol)
  - Rooms, spaces, threads
  - Voice/video calls (via LiveKit integration in Element Call)
  - Bridges to other platforms (WhatsApp, Telegram, Discord, etc.)
  - Rich media (files, images, video)
  - Read receipts, typing indicators
  - Push notifications
- **Use for us:** Chat infrastructure. Could be the backbone for all messaging (DMs, group chats, community chat). The bridge capability lets users connect existing accounts.
- **Limitations:** AGPL-3.0. Resource-heavy for self-hosting. Complex to operate at scale. Python performance concerns (Rust migration ongoing).

### Signal Protocol (libsignal)
- **URL:** https://github.com/signalapp/libsignal
- **Stars:** 5,596 | **Updated:** 2026-03-23 | **License:** AGPL-3.0
- **Stack:** Rust (core), with Java, Swift, TypeScript bindings
- **Capabilities:**
  - Double Ratchet Algorithm
  - Extended Triple Diffie-Hellman (X3DH) handshake
  - Curve25519, AES-256, HMAC-SHA256
  - Forward secrecy, future secrecy
  - Used by WhatsApp, Google Messages, Facebook Messenger
- **Use for us:** E2E encryption for private messages. Industry gold standard.
- **Limitations:** AGPL-3.0. Complex to integrate correctly. Requires careful key management infrastructure.

### Signal Server
- **URL:** https://github.com/signalapp/Signal-Server
- **Stars:** 10,454 | **Updated:** 2026-03-23 | **License:** AGPL-3.0
- **Stack:** Java, PostgreSQL, DynamoDB, Redis
- **Use for us:** Reference architecture for a privacy-first messaging server. Push notification handling, group management, attachment storage.
- **Limitations:** AGPL-3.0. Designed specifically for Signal, heavy customization needed.

---

## 4. FEED & CONTENT SYSTEMS

### X (Twitter) Recommendation Algorithm
- **URL:** https://github.com/twitter/the-algorithm (legacy) + https://github.com/xai-org/x-algorithm (current)
- **Stars:** 72,920 (legacy) + 16,129 (xAI) | **License:** AGPL-3.0 / Apache-2.0
- **Stack:** Scala/Java (legacy), Rust (xAI version)
- **How it works:**
  - In-network sources (accounts you follow)
  - Out-of-network sources (ML-based retrieval)
  - Ranking via transformer model (Grok-based in xAI version)
  - Real Graph: predicts engagement likelihood between users
  - TwHIN: user/content embeddings for similarity
  - SimClusters: community detection for content discovery
- **Use for us:** The best publicly available reference for a production social feed algorithm. The Real Graph concept (predicting user-to-user engagement) is directly relevant for matching algorithms.
- **Limitations:** AGPL-3.0 (legacy). Massively complex, designed for Twitter's scale. Would need significant simplification.

### Gorse
- **URL:** https://github.com/gorse-io/gorse
- **Stars:** 9,569 | **Updated:** 2026-03-24 | **License:** Apache-2.0
- **Stack:** Go, REST API
- **Capabilities:**
  - Collaborative filtering, content-based filtering, hybrid
  - LLM rankers support
  - Multimodal content via embeddings
  - Auto-tuning of recommendation models
  - RESTful API (easy to integrate)
  - Dashboard for monitoring
  - Multi-database support (MySQL, PostgreSQL, MongoDB, Redis)
- **Use for us:** Drop-in recommendation engine for feed ranking, content discovery, and potentially user matching. Apache-2.0 license is business-friendly. Go server is performant. Could power "Discover" and "For You" feeds.
- **Limitations:** General-purpose recommender, would need tuning for dating/social context.

### Erin (Self-hosted TikTok feed)
- **URL:** https://github.com/will-moss/erin
- **Stars:** 338 | **Updated:** 2026-03-24 | **License:** MIT
- **Stack:** React, Caddy
- **Use for us:** Reference for building a vertical-swipe short video feed UI. Lightweight and self-contained.
- **Limitations:** Very basic. Just a video feed viewer, not a full platform.

### TakTak (TikTok clone)
- **URL:** https://github.com/syncloudsoftech/taktak
- **Stars:** 12 | **Updated:** 2025-08-30 | **License:** GPL-3.0
- **Stack:** PHP (API), React.js (admin), Android (Java)
- **Features:** REST APIs, admin panel, Android app, short video upload/playback.
- **Use for us:** Reference for short-video platform architecture (upload pipeline, processing, feed).
- **Limitations:** GPL-3.0. Very low adoption. PHP backend. Android only.

---

## 5. MARKETPLACE & E-COMMERCE

### Medusa.js
- **URL:** https://github.com/medusajs/medusa
- **Stars:** 32,437 | **Updated:** 2026-03-24 | **License:** MIT
- **Stack:** Node.js/TypeScript, PostgreSQL, Redis
- **Features:**
  - Headless commerce API
  - Multi-region, multi-currency
  - Product management, inventory, orders
  - Payment integrations (Stripe, PayPal, etc.)
  - Plugin/module architecture
  - Admin dashboard
  - Medusa Cloud (2025) with Git integration
- **Use for us:** If the platform includes a marketplace (selling merchandise, event tickets, premium content), Medusa is the strongest option. MIT license, TypeScript/Node stack, and very active community. Could integrate as a microservice.
- **Limitations:** Not a multi-vendor marketplace out of the box (need Mercur for that). E-commerce focused, not social.

### Mercur (Multi-vendor on Medusa)
- **URL:** https://github.com/mercurjs/mercur
- **Stars:** 1,434 | **Updated:** 2026-03-24 | **License:** MIT
- **Stack:** TypeScript, built on MedusaJS
- **Features:**
  - Multi-vendor marketplace
  - Vendor onboarding and management
  - Stripe integration for split payments
  - Admin panel + vendor dashboard
  - B2C storefront included
- **Use for us:** If we need multi-vendor marketplace (users selling to users), this is the most modern option. Built on Medusa so inherits its entire ecosystem.
- **Limitations:** Young project (1.4K stars). Dependent on Medusa.

### Saleor
- **URL:** https://github.com/saleor/saleor
- **Stars:** 22,731 | **Updated:** 2026-03-24 | **License:** BSD-3-Clause
- **Stack:** Python/Django, GraphQL API, PostgreSQL
- **Features:**
  - Headless commerce with GraphQL
  - Multi-channel sales
  - Warehouse management
  - Webhooks and event-driven architecture
  - Dashboard (React)
- **Use for us:** Alternative to Medusa if Python/Django is preferred. More enterprise-focused. BSD-3-Clause is very permissive.
- **Limitations:** Python stack (vs Node/TypeScript). Slower growth than Medusa. GraphQL-only API.

### Spree Commerce
- **URL:** https://github.com/spree/spree
- **Stars:** 15,288 | **Updated:** 2026-03-24 | **License:** BSD-3-Clause
- **Stack:** Ruby on Rails, REST + GraphQL APIs
- **Features:**
  - Multi-vendor marketplace built-in
  - Stripe Connect integration
  - Vendor onboarding (Shopify/WooCommerce import)
  - Split payments and vendor payouts
  - Multi-region, multi-currency
- **Use for us:** Most mature open-source marketplace with built-in multi-vendor and Stripe Connect. Good if Ruby is acceptable.
- **Limitations:** Ruby on Rails. Large, complex codebase.

### Stripe Connect (not open-source, but essential)
- **Platform:** https://stripe.com/connect
- **Key for us:**
  - Split payments between platform and sellers
  - Delayed payouts (escrow-like, up to 90 days)
  - Vendor onboarding with KYC
  - Available in 47+ countries (including Sweden)
  - Standard/Express/Custom account types
  - 2.9% + $0.30 per transaction + 0.25% payout fee

---

## 6. ADMIN, MODERATION & ANALYTICS

### PostHog
- **URL:** https://github.com/PostHog/posthog
- **Stars:** 32,203 | **Updated:** 2026-03-24 | **License:** Custom (free self-host)
- **Stack:** Python/Django, TypeScript/React, PostgreSQL, ClickHouse, Kafka
- **Features:** Product analytics, web analytics, session replay, feature flags, A/B testing, surveys, error tracking, data warehouse, AI assistant.
- **Use for us:** All-in-one analytics platform. Self-hostable. Session replay is invaluable for understanding user behavior in dating/social flows.
- **Limitations:** Resource-heavy to self-host. Custom license (free for self-host, paid for cloud).

### Umami
- **URL:** https://github.com/umami-software/umami
- **Stars:** 35,807 | **Updated:** 2026-03-24 | **License:** MIT
- **Stack:** TypeScript, Next.js, PostgreSQL/MySQL
- **Features:** Privacy-first web analytics, no cookies, GDPR compliant by design.
- **Use for us:** Lightweight, privacy-first web analytics. MIT license. Perfect for GDPR-compliant tracking.
- **Limitations:** Web analytics only (no product analytics, no session replay).

### Plausible
- **URL:** https://github.com/plausible/analytics
- **Stars:** 24,450 | **Updated:** 2026-03-24 | **License:** AGPL-3.0
- **Stack:** Elixir, PostgreSQL/ClickHouse
- **Features:** Privacy-first, cookie-free, GDPR compliant, lightweight script (<1KB).
- **Use for us:** Extremely lightweight analytics. Good for public-facing pages.
- **Limitations:** AGPL-3.0. Elixir stack (niche). Limited to web analytics.

### Conversation AI Moderator (Google)
- **URL:** https://github.com/conversationai/conversationai-moderator
- **Stars:** 207 | **Updated:** 2026-03-19 | **License:** Apache-2.0
- **Stack:** TypeScript
- **Features:** Machine-assisted human moderation toolkit. Comment scoring, moderation queues, admin hierarchy.
- **Use for us:** Content moderation patterns. ML-assisted toxicity scoring for user-generated content.
- **Limitations:** Low adoption. Focused on text comments, not images/video.

### CookieConsent
- **URL:** https://github.com/orestbida/cookieconsent
- **Stars:** 5,380 | **Updated:** 2026-03-24 | **License:** MIT
- **Stack:** Vanilla JavaScript, <20KB
- **Use for us:** GDPR cookie consent management. Drop-in solution.
- **Limitations:** Only handles cookie consent, not broader GDPR compliance.

---

## 7. SWEDISH-SPECIFIC COMPONENTS

### Swish Payment Libraries

| Library | Stars | Updated | Stack | License |
|---------|-------|---------|-------|---------|
| [carlbarrdahl/swish-payments](https://github.com/carlbarrdahl/swish-payments) | 10 | 2023-10 | TypeScript/Node | MIT |
| [stebunting/swish-merchant](https://github.com/stebunting/swish-merchant) | 8 | 2024-07 | JavaScript/Node | MIT |
| [monkybrain/swish-payment](https://github.com/monkybrain/swish-payment) | — | — | Node.js | — |
| [RickardPettersson/swish-api-csharp](https://github.com/RickardPettersson/swish-api-csharp) | 34 | 2025-12 | C# / .NET 7 | MIT |
| [Kansuler/payment-swish](https://github.com/Kansuler/payment-swish) | — | — | Go | — |

- **Official docs:** https://developer.swish.nu/
- **Assessment:** All libraries are small, low-activity projects. The Node.js options (carlbarrdahl or stebunting) are the most relevant for a TypeScript stack. However, given their size, you may want to build your own thin wrapper around the [Swish API](https://developer.swish.nu/api) directly -- it is a straightforward REST API with certificate-based auth.

### BankID Libraries

| Library | Stars | Updated | Stack | License |
|---------|-------|---------|-------|---------|
| [anyfin/bankid](https://github.com/anyfin/bankid) | 71 | 2026-03-20 | TypeScript/Node | MIT |
| [oddhill/node-bankid](https://github.com/oddhill/node-bankid) | 6 | 2023-06 | JavaScript/Node | MIT |
| [fiso/smooth-bankid](https://github.com/fiso/smooth-bankid) | — | — | Guide/tutorial | — |

- **Assessment:** `anyfin/bankid` is the clear winner -- 71 stars, actively maintained (updated March 2026), TypeScript, MIT license, built by Anyfin (a Swedish fintech company). Covers auth and signing flows.

---

## 8. GDPR & PRIVACY

### awesome-gdpr
- **URL:** https://github.com/erichard/awesome-gdpr
- **Stars:** 534 | **Updated:** 2026-03-14
- **Use for us:** Curated list of GDPR-compliant tools, libraries, and resources. Good starting reference.

### Key GDPR Tools Identified:
- **Klaro** -- Lightweight consent management (<20KB), vanilla JS, MIT license
- **CookieConsent** (orestbida) -- 5.3K stars, MIT, vanilla JS
- **Privado** -- Open-source code scanner for privacy compliance (GDPR, HIPAA)
- **GDPR Analyzer** -- Analyzes webpages for GDPR compliance (17 stars, Python, GPL-3.0)
- **OpenDSR** -- Framework for data subject requests (right to deletion, export, etc.)

### GDPR Implementation Notes:
- Right to be forgotten (data deletion API)
- Data portability (export user data)
- Consent management (granular opt-in/out)
- Data processing agreements
- Privacy by design in architecture
- Data minimization principles
- Cookie-free analytics (Umami, Plausible)

---

## 9. DIGITAL WATERMARKING & DRM

### VideoSeal (Meta/Facebook Research)
- **URL:** https://github.com/facebookresearch/videoseal
- **Stars:** 613 | **Updated:** 2026-03-20 | **License:** MIT
- **Stack:** Python (PyTorch)
- **Features:** Invisible watermarking for both video and images. 256-bit model. Temporal consistency for video. ChunkySeal and PixelSeal variants.
- **Use for us:** Watermark user-uploaded content for copyright protection and content tracking. MIT license is ideal.
- **Limitations:** Python/PyTorch -- would need a microservice or processing pipeline.

### invisible-watermark
- **URL:** https://github.com/ShieldMnt/invisible-watermark
- **Stars:** 1,881 | **Updated:** 2026-03-20 | **License:** MIT
- **Stack:** Python
- **Algorithms:** DWT+DCT, DWT+DCT+SVD, RivaGAN (encoder/decoder with Attention)
- **Use for us:** Simpler alternative to VideoSeal for image watermarking. CLI tool available. Multiple algorithm options.
- **Limitations:** Images only (no video). Python dependency.

### RAWatermark
- **URL:** https://github.com/jeremyxianx/RAWatermark
- **Stack:** Python
- **Features:** Plug-and-play watermark framework for AI-generated images/videos with provable guarantees.
- **Use for us:** If platform includes AI-generated content, this provides provenance tracking.

---

## 10. RECOMMENDED ARCHITECTURE STACK

Based on this research, here is a suggested technology selection:

### Core Platform
| Layer | Technology | License | Why |
|-------|-----------|---------|-----|
| **Mobile** | Flutter or React Native | — | Flutter: Complete-Dating-App reference. RN: Humbble reference. |
| **Web Frontend** | Next.js / React | MIT | Industry standard. Umami/Medusa use it. |
| **API Backend** | Node.js/TypeScript or FastAPI | — | Medusa/Mercur ecosystem (TS) or dating app reference (FastAPI) |
| **Database** | PostgreSQL | — | Used by every major project above |
| **Cache/Queue** | Redis | BSD | Universal choice |
| **Search** | Elasticsearch or Meilisearch | — | Content/user search |

### Communication
| Feature | Technology | License |
|---------|-----------|---------|
| **1:1 Video** | LiveKit | Apache-2.0 |
| **Group Video** | LiveKit or Jitsi | Apache-2.0 |
| **Chat** | Matrix/Synapse or custom | AGPL-3.0 / — |
| **E2E Encryption** | libsignal or Matrix Olm | AGPL-3.0 |
| **Push Notifications** | Firebase/APNs + custom | — |

### Feed & Discovery
| Feature | Technology | License |
|---------|-----------|---------|
| **Recommendation Engine** | Gorse | Apache-2.0 |
| **Feed Algorithm** | Custom (X algorithm as reference) | — |
| **Content Processing** | FFmpeg + custom pipeline | LGPL |

### Payments & Commerce
| Feature | Technology | License |
|---------|-----------|---------|
| **International Payments** | Stripe Connect | Proprietary |
| **Swedish Payments** | Swish (direct API or carlbarrdahl lib) | MIT |
| **Marketplace** | Medusa.js + Mercur | MIT |
| **Subscriptions** | Stripe Billing | Proprietary |

### Swedish-Specific
| Feature | Technology | License |
|---------|-----------|---------|
| **Identity Verification** | BankID via anyfin/bankid | MIT |
| **Payments** | Swish API | — |
| **GDPR Consent** | CookieConsent + custom | MIT |

### Admin & Analytics
| Feature | Technology | License |
|---------|-----------|---------|
| **Analytics** | PostHog (full) or Umami (lightweight) | Custom / MIT |
| **Content Moderation** | Custom + AI (Conversation AI patterns) | — |
| **Watermarking** | VideoSeal or invisible-watermark | MIT |

---

## 11. KEY TAKEAWAYS

1. **No single open-source dating platform is production-ready.** The best ones (Complete-Dating-App, Humbble) are small projects. You will be building custom, using these as references.

2. **Social network infrastructure is mature.** Mastodon (50K stars), Discourse (47K stars), and Pixelfed (7K stars) provide excellent architectural references for feeds, moderation, and media handling.

3. **Real-time communication is solved.** LiveKit (18K stars, Apache-2.0) is the clear winner for video/audio. Matrix/Synapse for chat if you want federation, or build custom for simpler needs.

4. **Recommendation engines exist.** Gorse (10K stars, Apache-2.0) is a production-ready, drop-in recommendation API. X's open-sourced algorithm provides the best reference for social feed ranking.

5. **E-commerce/marketplace is mature.** Medusa.js (32K stars, MIT) + Mercur for multi-vendor. Stripe Connect for payments and escrow.

6. **Swedish integrations are thin but usable.** anyfin/bankid (71 stars, MIT) is the best BankID library. Swish libraries are small -- consider wrapping the API directly.

7. **GDPR tooling is fragmented.** No single solution. Combine CookieConsent + Umami analytics + custom data handling (deletion, export, consent management).

8. **License awareness is critical.** AGPL-3.0 (Mastodon, Synapse, Signal, Plausible) requires open-sourcing modifications. Prefer MIT/Apache-2.0/BSD for commercial use: LiveKit, Medusa, Gorse, Umami, VideoSeal.

---

## Sources

- [GitHub: dating-app topic](https://github.com/topics/dating-app)
- [GitHub: tinder-clone topic](https://github.com/topics/tinder-clone)
- [Complete-Dating-App](https://github.com/helloharendra/Complete-Dating-App)
- [Humbble](https://github.com/Prakashchandra-007/humbble)
- [Mastodon](https://github.com/mastodon/mastodon)
- [Lemmy](https://github.com/LemmyNet/lemmy)
- [Pixelfed](https://github.com/pixelfed/pixelfed)
- [Discourse](https://github.com/discourse/discourse)
- [LiveKit](https://github.com/livekit/livekit)
- [Jitsi Meet](https://github.com/jitsi/jitsi-meet)
- [Matrix/Synapse](https://github.com/element-hq/synapse)
- [Signal libsignal](https://github.com/signalapp/libsignal)
- [Signal Server](https://github.com/signalapp/Signal-Server)
- [X Recommendation Algorithm](https://github.com/twitter/the-algorithm)
- [xAI X Algorithm](https://github.com/xai-org/x-algorithm)
- [Gorse Recommender](https://github.com/gorse-io/gorse)
- [Medusa.js](https://github.com/medusajs/medusa)
- [Mercur Marketplace](https://github.com/mercurjs/mercur)
- [Saleor](https://github.com/saleor/saleor)
- [Spree Commerce](https://github.com/spree/spree)
- [PostHog](https://github.com/PostHog/posthog)
- [Umami](https://github.com/umami-software/umami)
- [Plausible](https://github.com/plausible/analytics)
- [CookieConsent](https://github.com/orestbida/cookieconsent)
- [awesome-gdpr](https://github.com/erichard/awesome-gdpr)
- [VideoSeal](https://github.com/facebookresearch/videoseal)
- [invisible-watermark](https://github.com/ShieldMnt/invisible-watermark)
- [anyfin/bankid](https://github.com/anyfin/bankid)
- [Swish Developer Docs](https://developer.swish.nu/)
- [Stripe Connect](https://stripe.com/connect)
- [Conversation AI Moderator](https://github.com/conversationai/conversationai-moderator)
