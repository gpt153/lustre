# Lustre — Tech Stack Research & Recommendation
**Date:** 2026-03-24
**Sources:** 5 parallella forskningsagenter, 100+ webbkällor

---

## Executive Summary

Lustre byggs som en **polyglot microservice-arkitektur** med tre huvudspråk: TypeScript (API + frontend), Elixir (realtid), och Python (AI/ML). Hosting primärt på Hetzner (4-6x billigare än AWS) med Cloudflare för CDN och AWS enbart för DRM-video.

**Estimerad infrastrukturkostnad vid 500K användare: $4,000-12,000/mån**
(varav ~hälften är AI/ML-tjänster)

---

## 1. Frontend & Mobile

### Mobile: Expo (React Native) med New Architecture

**Varför:**
- Tinder, Hinge och Discord kör React Native i produktion
- Ingen stor dejtingapp kör Flutter
- Flutter Web renderar canvas (ej DOM) — ingen SSR, ingen SEO, dealbreaker för webapp
- Expo SDK 54+ är nu default-sättet att bygga RN (inte ett tillägg)
- New Architecture (Fabric, TurboModules, JSI): ~40% snabbare start, 20-30% mindre minne
- 70-85% delad kod med webappen

**Nyckelbibliotek:**
| Feature | Bibliotek | Status |
|---------|-----------|--------|
| Swipe-kort | rn-swiper-list (Reanimated + Gesture Handler) | 60 FPS, produktionsklart |
| Video/Reels | react-native-video v7 | DRM-stöd (Widevine/FairPlay) |
| Voice/Video-samtal | LiveKit React Native SDK | Produktionsklart |
| Push-notiser | expo-notifications | Produktionsklart |
| Kamera | expo-camera | Produktionsklart |
| Screenshot-blockering | expo-screen-capture (FLAG_SECURE Android, overlay iOS) | Android: starkt. iOS: detektion |
| Bluetooth/NFC | react-native-ble-manager + react-native-nfc-manager | Kräver dev-client |
| Bakgrunds-GPS | react-native-background-geolocation v5 | Batterioptimerat |
| Offline | TanStack Query offline + MMKV | Produktionsklart |

### Web: Next.js 16

**Varför:**
- Enda ramverket med meningsfull koddelning mot React Native
- SSR/SSG för SEO (publika profiler, content-sidor)
- React Server Components + Server Actions
- Störst hiring pool av alla webbramverk

### Delad arkitektur: Turborepo Monorepo

```
lustre/
  apps/
    mobile/          # Expo (iOS + Android)
    web/             # Next.js
  packages/
    app/             # Delade screens, hooks, logik
    ui/              # Delade UI-komponenter (Tamagui)
    api/             # Delad API-klient, typer, validering (tRPC + Zod)
```

**Nyckelverktyg:**
- **Expo Router** — filbaserad routing som fungerar på iOS, Android OCH web
- **Solito 5** — bryggar Next.js och React Native navigation
- **Tamagui** — cross-platform styling, kompilerar till native views (mobil) och optimerad CSS (web)
- **tRPC + Zod** — typsäkert API-lager delat mellan alla plattformar

### State Management

- **Zustand** — ~1KB, hook-baserat, konsensusval 2026 (ersätter Redux)
- **TanStack Query** — server state (caching, bakgrundsuppdatering, optimistiska uppdateringar, offline)

---

## 2. Backend

### Primärt API: Node.js + Fastify + TypeScript + Prisma

**Varför Fastify:**
- 3-5x snabbare än Express (45-80K RPS vs 10-30K)
- Inbyggd schema-validering, TypeScript-stöd, strukturerad logging
- Konsensusval 2026 för nya Node.js-projekt
- Delat TypeScript-ekosystem med frontend

**Prisma** som ORM — typsäkra queries, migreringar, introspection.

### Realtid: Elixir + Phoenix Channels

**Varför Elixir:**
- Discord hanterar 11M concurrent users på Elixir
- Phoenix Channels klarar hundratusentals WebSocket-anslutningar per nod
- Inbyggd distributed presence tracking
- Vid Lustres skala (10-50K concurrent) räcker 2-3 Elixir-noder

**Hanterar:** Chat, presence (online/offline), typing-indikatorer, läskvitton, realtidsnotiser, ephemeral messages

**Varför inte Socket.io:** 10-15% bandwidth overhead, saknar distributed presence.
**Varför inte managed (Ably/Pusher):** $2-5K/mån vid 50K connections. Self-hosted Elixir: $50-100/mån.

### Voice/Video: LiveKit (self-hosted)

- Open source, Apache 2.0
- WebRTC SFU med AI agent framework (perfekt för AI Coach)
- Skrivet i Go — excellent performance
- Self-hosted: gratis, 4 cores + 8GB RAM per server (10-25 concurrent sessions)
- React Native SDK produktionsklart

### AI/ML: Python + FastAPI (microservices)

Isolerade microservices för:
- NSFW-klassificering
- Feed-rekommendationer
- Embedding-generering
- AI Coach-logik

---

## 3. Databas & Lagring

### Primär databas: PostgreSQL 17 + PostGIS + pgvector

**Varför:**
- Samma som Tinder, Discord, de flesta dejtingappar
- PostGIS med S2 cell indexing (Tinders approach) för proximity-sökning
- pgvector för embedding-baserad matchning och rekommendationer
- Row-level security för GDPR multi-tenancy

### Cache: Redis 7

Från dag ett för:
- Sessions, rate limiting
- Geospatial caching (Redis GEO)
- "Seen"-listor (redan visade profiler)
- Realtidspresence
- Feed-caching

### Sökning: Meilisearch

- Single binary, <50ms söktid
- Hanterar profiler, content, events vid 1M användare
- Migrera till Elasticsearch om >10M användare

### Message Queue: NATS JetStream + Redis Streams

- NATS JetStream: service-to-service events, exactly-once delivery
- Redis Streams: lightweight pub/sub (feed-uppdateringar, notis-fanout)
- Kafka behövs först vid >1M användare

### Object Storage: Cloudflare R2 (primär) + AWS S3 (DRM)

- **R2:** $0.015/GB/mån, **$0 egress** — 98% billigare än S3 för bildtung plattform
- **S3:** Bara för DRM-videokällor (MediaConvert kräver S3)

---

## 4. AI & ML

### AI Gatekeeper

**Arkitektur: Tvåstegsmodell**

| Steg | Modell | Kostnad | Användning |
|------|--------|---------|-----------|
| Tier 1 (80-90%) | GPT-4o mini eller Gemini 2.5 Flash | $0.075-0.15/MTok | Snabb klassificering, spam, enkla pass/fail |
| Tier 2 (10-20%) | Claude Sonnet 4.6 | $3/MTok input | Komplex kvalificering, personlighetsmatching |

**Kostnad vid 10K konversationer/dag:** $540-4,500/mån beroende på Tier 2-andel.

**Optimeringar:**
- Prompt caching (Claudes cache reads: 0.1x baspris)
- Pre-computed preference embeddings per mottagare
- Target: first token <800ms, full response <2s

**Roadmap:** Starta med prompt engineering → samla data 3-6 mån → fine-tuna Llama 3 70B → 40-60% kostnadsminskning.

### AI Dating Coach

**Stack: LiveKit (self-hosted) + Tavus CVI + ElevenLabs**

| Komponent | Funktion | Kostnad |
|-----------|----------|--------|
| LiveKit Agents | WebRTC-infrastruktur, rum, audio/video-routing | Gratis (self-hosted) |
| Tavus CVI | Realtids-AI-avatar med video synkad till tal | $0.32-0.59/min |
| ElevenLabs | Röstsyntese (kvinnlig övningspartner) | $0.12-0.30/1000 tecken |
| Claude/GPT | Konversationsmotor | $0.10-0.50/session |

**Kostnad per 10-min coaching-session:** $3.60-8.00
**Vid 1000 sessioner/mån:** $4,000-8,000/mån

**Alternativ:** HeyGen för förinspelat coaching-content (billigare per video), D-ID för agent-use case.

### Content-klassificering

**Primär: Sightengine**
- 29 nudity-klasser (inte bara SFW/NSFW)
- Kropp, aktivitet, kontext — exakt vad Lustre behöver
- Bilder OCH video
- $99-399/mån beroende på volym

**Backup: NudeNet v2** (open source, self-hosted, gratis vid skala)

**Feed-specifika filter:**
- Sightengine klassificerar → multi-label taggar lagras per content
- Användarens filter matchas mot taggar vid feed-rendering
- "No dick pics"-filter: AI detekterar penis i fokus → blur + opt-in visning

### Dynamiskt utbildningscontent

| Format | Teknik | Kostnad |
|--------|--------|--------|
| AI-podcast | ElevenLabs GenFM (två AI-röster) | $1.80-4.50/episod (10 min) |
| AI-telefonsamtal | ElevenLabs voice + Claude/GPT | $1-2/min |
| AI-videosamtal | Tavus CVI + ElevenLabs + LLM | $3.60-8/session |
| Artiklar/guider | Claude Sonnet 4.6 | $0.05-0.10/artikel |

### Rekommendationsmotor

**Qdrant** (vector DB, open source, Rust-baserad):
- 22ms p95 latency (vs Pinecone 45ms)
- $45/mån managed (vs Pinecone $70/mån)
- Self-hostable

**Algoritm:**
1. Fas 1 (launch): Regelbaserad scoring i PostgreSQL
2. Fas 2: Embedding-baserad similarity via pgvector
3. Fas 3: Hybrid collaborative + content-based + semantic via Qdrant + Python/FastAPI

**Referens:** Gorse (9.6K stars, Apache-2.0) — drop-in recommendation engine.

---

## 5. Säkerhet & DRM

### Screenshot-blockering

| Platform | Metod | Styrka |
|----------|-------|--------|
| Android | FLAG_SECURE | Starkt — content svart vid screenshot/recording |
| iOS | UITextField secure layer trick | Starkt men odokumenterat, används av banker |
| iOS | Screenshot notification | Detektion, ej prevention |
| Video (båda) | Widevine L1 / FairPlay DRM | Content svart vid capture |

**Expo-integration:** `expo-screen-capture` (preventScreenCaptureAsync)

### ConsentVault DRM

**Stack:**
1. **AWS MediaConvert** (Professional tier) — transkodning med CMAF packaging
2. **PallyCon** eller **BuyDRM** — multi-DRM licensserver (Widevine + FairPlay + PlayReady)
3. **AWS CloudFront** — DRM-video delivery med signed URLs
4. **Forensisk vattenmärkning** — Steg.AI eller VideoSeal (Meta, MIT-licens)
   - Osynliga marks som överlever cropping, resizing, screen recording
   - Bäddar in viewer-ID, session-ID, timestamp
   - Kan spåra exakt vem som läckte

**Kostnad:** Multi-DRM: $500-2,000/mån + per-stream. Vattenmärkning: $500-2,000/mån.

### SafeDate GPS & Nödlarm

**Sverige:**
- Ingen publik API för SOS Alarm/112
- Lösning: `tel:112` via system-dialer + simultan GPS + ljudström till Lustres backend
- Bakgrunds-GPS: var 5-10s under aktiv SafeDate
- Mikrofon-streaming: WebSocket till backend, krypterat

**International expansion:**
- Noonlight Dispatch API (integrerat i Tinder/Bumble, US-fokus)

**Tekniskt:**
- iOS: AVAudioSession `.playAndRecord`, background task APIs
- Android: Foreground service med microphone access
- Stream via WebSocket → krypterad lagring med chain-of-custody metadata
- Sverige: enpartsamtycke (lagligt att spela in samtal du deltar i)

---

## 6. Betalning & Verifiering

### Åldersverifiering: BankID (Sverige) + Veriff (internationellt)

**BankID** är golden standard i Sverige:
- 8.5M+ aktiva användare (i princip alla 18+)
- Personnummer → ålder direkt (YYYYMMDD-XXXX)
- Kostnad: 0.50-2.00 SEK/autentisering
- Integration: Criipto eller Signicat (BankID-as-a-service)
- TypeScript-bibliotek: `anyfin/bankid` (MIT, aktivt underhållet)

**Swish ensamt räcker INTE** — barn 16+ kan ha Swish. BankID behövs.

**Internationellt:** Veriff ($0.80-1.39/verifiering, 190+ länder)

### Betalningsprocessering

**KRITISKT: Stripe förbjuder ALL online dating + adult content.**

**Alternativ:**
| Processor | Avgift | Stöder adult | Region |
|-----------|--------|-------------|--------|
| Segpay | 4-15% | Ja, EU-licensierad | EU + global |
| CCBill | 10.8-14.5% | Ja | Global |
| Verotel | Liknande | Ja | EU-fokus |

**Swish Handel:**
- Commerce API (betalningar in)
- Payout API (utbetalningar till individer)
- Recurring Payments API (auto-topup!)
- Node.js SDK finns
- Returnerar telefonnummer men INTE namn

**Token-system implementation:**
1. Auto-topup via Swish Recurring → pengar in till Segpay/vår bank
2. Tokens internt i PostgreSQL (saldo per user)
3. Token-debitering per AI-anrop, videosamtal, etc. med 5 decimalers precision
4. Dynamisk spread lagras som config (justerbar per segment/marknad)
5. Separat betalningssida (pay.lovelustre.com) för historik/hantering

### Marknadsplats-escrow

1. Köpare swishar till Lustres Swish-nummer
2. Medel hålls på Lustres bankkonto (inte en wallet — inga PSD2-problem)
3. Vid bekräftad leverans: Swish Payout till säljare
4. Provision dras innan utbetalning
5. Ingen part ser den andras namn

---

## 7. Hosting & Infrastruktur

### Hybrid: Hetzner + Cloudflare + AWS (bara DRM)

| Komponent | Provider | Varför |
|-----------|----------|-------|
| Application cluster | Hetzner Cloud (Helsinki) | 4-6x billigare än AWS, EU-datacenter |
| CDN, WAF, DNS | Cloudflare | Global edge, DDoS-skydd |
| Object storage | Cloudflare R2 | $0 egress (!), 98% billigare än S3 |
| DRM video encoding | AWS MediaConvert (eu-north-1 Stockholm) | Ingen Hetzner-alternativ |
| DRM video delivery | AWS CloudFront | Signed URLs med DRM |
| DRM license server | PallyCon/BuyDRM | Specialiserad DRM-tjänst |

### Kubernetes: k3s på Hetzner

- Lightweight Kubernetes
- Alternativ: Hetzner HKE (managed, gratis control plane) eller Syself
- Helm charts för alla services

### Monitoring: Grafana + Prometheus + Loki

Self-hosted på Hetzner. Full observability.

### Estimerad månadskostnad vid 500K användare

| Komponent | Kostnad |
|-----------|--------|
| Hetzner compute (6-8 noder) | $200-400 |
| PostgreSQL (dedicated) | $60-80 |
| Redis (dedicated) | $30-40 |
| Cloudflare R2 (5TB) | $75 |
| CDN & WAF | $20-200 |
| DRM video (MediaConvert + CloudFront) | $500-2,000 |
| DRM licenser (PallyCon) | $500-2,000 |
| AI Gatekeeper | $2,000-4,500 |
| AI Coach (Tavus + ElevenLabs) | $4,000-8,000 |
| NSFW-moderation | $100-500 |
| LiveKit (self-hosted) | $40-80 |
| Sökning (Meilisearch) | $20-40 |
| NATS cluster | $30-60 |
| Vattenmärkning | $500-2,000 |
| **TOTAL INFRA** | **$1,775-6,400** |
| **TOTAL AI/ML** | **$6,600-15,000** |
| **TOTAL** | **$8,375-21,400** |

---

## 8. Open Source-byggklossar

### Kan använda direkt (MIT/Apache-2.0)

| Projekt | Stars | Licens | Användning |
|---------|-------|--------|-----------|
| **LiveKit** | 17.8K | Apache-2.0 | Video/röst + AI Coach-infrastruktur |
| **Medusa.js** | 32.4K | MIT | Headless commerce för marketplace + business shops |
| **Gorse** | 9.6K | Apache-2.0 | Rekommendationsmotor (drop-in REST API) |
| **VideoSeal** (Meta) | 613 | MIT | Forensisk vattenmärkning (ConsentVault) |
| **invisible-watermark** | 1.9K | MIT | Bild-vattenmärkning |
| **anyfin/bankid** | 71 | MIT | BankID TypeScript-integration |
| **CookieConsent** | 5.4K | MIT | GDPR cookie-consent |
| **Umami** | 35.8K | MIT | Privacy-first analytics |
| **NudeNet** | — | MIT | NSFW-detection (self-hosted backup) |
| **rn-swiper-list** | — | MIT | Tinder-swipe i React Native |

### Använd som referens (AGPL — EJ direkt kodåteranvändning)

| Projekt | Stars | Lärdom |
|---------|-------|--------|
| Mastodon | 49.8K | Feed-arkitektur, moderation, media pipeline |
| Discourse | 46.6K | Community/forum, moderation |
| Matrix/Synapse | 3.9K | Chat-protokoll (men för tungt att använda direkt) |
| Signal libsignal | 5.6K | E2E-krypteringsprotokoll |
| X:s algoritm | 73K | Feed-ranking arkitektur |

---

## 9. Regulatoriskt

### Bolagsform
- **AB** (Aktiebolag): 25,000 SEK aktiekapital, ~10 dagar Bolagsverket

### GDPR
- Sexuell läggning = "special category data" (Art. 9) → explicit consent
- **DPO krävs** (obligatoriskt vid storskalig behandling av special category data)
- **DPIA krävs före launch** (Data Protection Impact Assessment)
- Anmälan till **IMY** (Integritetsskyddsmyndigheten)
- Right-to-deletion: deletion orchestrator pattern across alla services
- Kryptering: AES-256 at rest, TLS 1.3 in transit

### App Stores
- Apple/Google förbjuder explicit content i publika ytor
- **Strategi:** Default vanilla mode = SFW. Explicit content bara i privata meddelanden/opt-in
- FetLife: web-only (ingen app store). Grindr: explicita privata meddelanden = OK
- **PWA som backup-distribution**

### Varumärke
- PRV: 5,400 SEK för 4 klasser, 3-6 månader
- EUIPO: €1,200 för 4 klasser, 4-6 månader
- **Strategi:** PRV först, sedan EUIPO inom 6 mån med prioritet
- Kolla EU SME Fund för 75% återbetalning

### Ny lag juli 2025
- Köp av live/custom sexuellt content online = olagligt
- Betalningsförmedlare kan hållas ansvariga
- **Lustre-gränsdragning:** Vår videochat = kommunikation, ej sexuell tjänst. Marknadsplats = varor. Inget betalt sexuellt content.

---

## 10. Arkitekturöversikt

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTS                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ iOS App  │  │ Android  │  │ Web App  │              │
│  │ (Expo)   │  │ (Expo)   │  │(Next.js) │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       └──────────────┼─────────────┘                     │
│                      │                                   │
└──────────────────────┼───────────────────────────────────┘
                       │ HTTPS/WSS
┌──────────────────────┼───────────────────────────────────┐
│              CLOUDFLARE EDGE                              │
│  CDN · WAF · DDoS · DNS · R2 Storage · Workers          │
└──────────────────────┼───────────────────────────────────┘
                       │
┌──────────────────────┼───────────────────────────────────┐
│              HETZNER CLOUD (Helsinki)                     │
│                      │                                   │
│  ┌───────────────────┼───────────────────────┐           │
│  │           API GATEWAY (Traefik)           │           │
│  └───────┬───────────┼───────────┬───────────┘           │
│          │           │           │                        │
│  ┌───────▼───┐ ┌─────▼─────┐ ┌──▼──────────┐           │
│  │ Fastify   │ │  Phoenix  │ │  LiveKit    │           │
│  │ API       │ │  Channels │ │  (WebRTC)   │           │
│  │ (REST +   │ │  (Chat,   │ │  (Voice,    │           │
│  │  tRPC)    │ │  Presence,│ │   Video,    │           │
│  │           │ │  Notis)   │ │   AI Coach) │           │
│  └───────┬───┘ └─────┬─────┘ └──┬──────────┘           │
│          │           │           │                        │
│  ┌───────▼───────────▼───────────▼───────────┐           │
│  │              DATA LAYER                    │           │
│  │  PostgreSQL 17 + PostGIS + pgvector       │           │
│  │  Redis 7 (cache, geo, sessions, streams)  │           │
│  │  Meilisearch (search)                     │           │
│  │  NATS JetStream (event bus)               │           │
│  └───────────────────────────────────────────┘           │
│                                                          │
│  ┌───────────────────────────────────────────┐           │
│  │           AI/ML SERVICES                   │           │
│  │  Python/FastAPI microservices:             │           │
│  │  • NSFW Classification (Sightengine)      │           │
│  │  • Feed Recommendations (Qdrant/Gorse)    │           │
│  │  • Embedding Generation                    │           │
│  └───────────────────────────────────────────┘           │
│                                                          │
│  ┌───────────────────────────────────────────┐           │
│  │           EXTERNAL AI APIs                 │           │
│  │  • Claude/GPT (Gatekeeper, Coach)         │           │
│  │  • ElevenLabs (Voice synthesis)           │           │
│  │  • Tavus CVI (AI Avatar video)            │           │
│  └───────────────────────────────────────────┘           │
│                                                          │
│  ┌───────────────────────────────────────────┐           │
│  │           MONITORING                       │           │
│  │  Grafana + Prometheus + Loki              │           │
│  └───────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              AWS eu-north-1 (Stockholm)                   │
│  ┌───────────────────────────────────────────┐           │
│  │           DRM VIDEO PIPELINE               │           │
│  │  S3 (source) → MediaConvert → CloudFront  │           │
│  │  + PallyCon (DRM licenses)                │           │
│  │  + Steg.AI / VideoSeal (watermarking)     │           │
│  └───────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              PAYMENT & VERIFICATION                       │
│  Segpay/CCBill (card processing)                         │
│  Swish Handel API (Swedish payments)                     │
│  BankID via Criipto (Swedish age verification)           │
│  Veriff (international verification)                     │
│  Roaring.io (SPAR register lookup)                       │
└──────────────────────────────────────────────────────────┘
```

---

## 11. Stack Summary — En rad per komponent

```
MOBILE APP:        Expo (React Native) + New Architecture + Expo Router
WEB APP:           Next.js 16 + React Server Components
SHARED CODE:       Turborepo monorepo + Solito 5 + Tamagui + tRPC + Zod
STATE:             Zustand (client) + TanStack Query (server)
CORE API:          Node.js + Fastify + TypeScript + Prisma
REAL-TIME:         Elixir + Phoenix Channels
VIDEO/VOICE:       LiveKit (self-hosted, Go)
DATABASE:          PostgreSQL 17 + PostGIS + pgvector
CACHE:             Redis 7
SEARCH:            Meilisearch
EVENT BUS:         NATS JetStream + Redis Streams
AI GATEKEEPER:     GPT-4o mini (Tier 1) + Claude Sonnet (Tier 2)
AI COACH:          LiveKit Agents + Tavus CVI + ElevenLabs + Claude/GPT
NSFW:              Sightengine (29 klasser) + NudeNet (backup)
FEED ALGO:         PostgreSQL → pgvector → Qdrant + Gorse
DRM VIDEO:         AWS MediaConvert + CloudFront + PallyCon
WATERMARK:         VideoSeal (Meta, MIT) + Steg.AI
OBJECT STORAGE:    Cloudflare R2 (media) + AWS S3 (DRM source)
CDN/EDGE:          Cloudflare
COMPUTE:           Hetzner Cloud (Helsinki) + k3s
MONITORING:        Grafana + Prometheus + Loki
AUTH/VERIFY:       BankID (Criipto) + Veriff (international)
PAYMENTS:          Segpay/CCBill + Swish Handel API
MARKETPLACE:       Medusa.js (headless commerce)
RECOMMENDATIONS:   Gorse (Apache-2.0, drop-in)
ANALYTICS:         Umami (privacy-first, MIT)
GDPR:              CookieConsent + custom deletion orchestrator
```

---

*Baserat på research från 5 parallella agenter, 100+ webbkällor, arkitekturanalyser av Tinder, Discord, Grindr, Bumble, och open source-landskapet mars 2026.*
