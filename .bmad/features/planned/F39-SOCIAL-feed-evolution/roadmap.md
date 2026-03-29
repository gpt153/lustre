# Roadmap: F39-SOCIAL-feed-evolution

**Status:** PLANNED
**Created:** 2026-03-29
**Waves:** 5
**Total epics:** 15

---

## Wave 1: Spicy-Level System & Post Types Schema
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-spicy-level-schema (haiku) — Prisma: Add SpicyLevel enum (VANILLA, SULTRY, STEAMY, EXPLICIT), add spicyLevel field to Post model, replace ContentPreference enum with SpicyLevelFilter model (4 boolean fields), add PostType enum (MOMENT, VIBE, PROMPT_RESPONSE), add postType + expiresAt fields to Post, add DailyPrompt model. Migration.
- wave-1b-spicy-level-api (haiku) — tRPC: spicyFilter.get, spicyFilter.update (4 boolean toggles), spicyFilter.quickToggle (single level on/off with min-1 validation). Update post.create to accept postType + spicyLevel. Update post.feed to filter by viewer's active spicy levels instead of old ContentPreference. Vibe auto-expiry logic.
- wave-1c-classification-mapping (sonnet) — Map Sightengine nudity scores to SpicyLevel thresholds. Validate poster's self-tag against ML classification — block if mismatch exceeds tolerance (e.g. EXPLICIT content tagged VANILLA). Update classify-and-tag pipeline.

### Testgate Wave 1:
- [ ] SpicyLevelFilter CRUD works with 4 independent booleans
- [ ] Posts created with postType and spicyLevel
- [ ] Feed respects viewer's active spicy toggles
- [ ] Vibes auto-expire after 24h
- [ ] Classification validates spicy-level tags — mismatched content blocked

---

## Wave 2: Reactions, "Säg hej" & Feed Algorithm
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-reactions-system (haiku) — Prisma: Replace FeedInteractionType (LIKE, SHOW_LESS) with (HOT, CRUSH, WOULD_HANG, SHOW_LESS). tRPC: post.react (upsert reaction type), post.unreact, post.getReactions (author-only: aggregated counts). Reaction counts never exposed publicly.
- wave-2b-say-hi-bridge (sonnet) — tRPC: post.sayHi (creates or finds Conversation with post context attached). If no match exists: routes through Gatekeeper (F07) or creates pending conversation. Post reference stored as metadata in first message. Share-to-DM: post.shareToConversation (sends post link to existing conversation as message).

**Group B (sequential, after A):**
- wave-2c-feed-algorithm-v2 (sonnet) — Upgrade feed scoring: add proximity factor (PostGIS, city-level), interest compatibility (profile tags), trust score integration (F35 Redis lookup), spotlight boost (+30), new-account dampening (14-day ramp), daily-prompt 6h boost. Integrate reaction quality signal (posts with more diverse reactions ranked higher). Keep show-less penalty.

### Testgate Wave 2:
- [ ] Reactions stored per user per post with 3 types
- [ ] Reaction counts visible to author only
- [ ] "Säg hej" creates conversation with post context
- [ ] Share-to-DM sends post reference to existing conversation
- [ ] Feed ranking includes trust score and proximity
- [ ] New accounts have reduced feed reach for 14 days

---

## Wave 3: Feed UI & Profile Gallery (Mobile + Web)
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-feed-ui-mobile (sonnet) — Mobile feed redesign: post card with avatar/name/time, media carousel (horizontal scroll, dot indicators, max 4 per post), reaction buttons (🔥 😍 🤝), "Säg hej" button, "Se hela profilen" CTA. Spicy-level quick-toggle button in feed header with color indicator. Vibe posts show countdown timer. Post creation flow: camera → type picker → spicy level → post.
- wave-3b-feed-ui-web (sonnet) — Web feed redesign: same post card layout (max-width 600px), carousel with arrow buttons, reaction buttons, "Säg hej", spicy toggle in header. Post creation inline (web) with type picker.
- wave-3c-profile-gallery (haiku) — Profile page: add Gallery tab showing all Moments (grid, newest first). Tap opens post detail. Content above viewer's spicy level is blurred with level badge. Vibes excluded from gallery. Mobile + web.

### Testgate Wave 3:
- [ ] Feed shows post cards with carousel, reactions, "Säg hej"
- [ ] Spicy toggle visible in feed header, changes filter instantly
- [ ] Vibes show countdown, moments are permanent
- [ ] Profile gallery displays user's moments in grid
- [ ] Gallery blurs content above viewer's spicy level
- [ ] Post creation flow works with type + spicy level selection

---

## Wave 4: Shorts & Video Support
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-4a-video-upload-pipeline (sonnet) — Video upload to R2 with HLS transcoding. Options: Cloudflare Stream API or FFmpeg-based transcoding. Presigned upload URL for video, webhook on transcode complete, thumbnail extraction from first frame. PostMedia extended with duration, videoUrl (HLS manifest), thumbnailUrl.
- wave-4b-video-recording-ui (sonnet) — In-app camera for recording 15-60s shorts. expo-camera + expo-av integration. Front/back toggle, flash, timer. Preview before posting. Upload progress indicator.

**Group B (parallel with A):**
- wave-4c-video-playback (haiku) — Feed video playback: auto-play muted on scroll-into-view, tap for sound, full-screen on tap-and-hold. One short visible at a time (no stacking). Profile gallery shows video thumbnail with duration badge.

### Testgate Wave 4:
- [ ] Video upload to R2 with HLS transcoding works
- [ ] Thumbnail auto-generated from first frame
- [ ] In-app camera records 15-60s video
- [ ] Videos auto-play muted in feed, tap for sound
- [ ] Shorts appear on profile gallery with duration badge

---

## Wave 5: Filters, Prompts & Content Protection
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-5a-vibe-filters (haiku) — Client-side image/video filters: 5 mood filters (warm glow, golden hour, neon, film grain, noir), location sticker picker (Swedish cities/neighborhoods), intent tag badges, styled text overlays. Applied before upload via expo-image-manipulator or react-native-image-filter-kit. No face-altering filters.
- wave-5b-daily-prompts (haiku) — Seed 100+ prompts in DailyPrompt table (Swedish). Spicy-level tagged per prompt. Daily rotation logic (select prompt by date hash). tRPC: prompt.getToday, prompt.respond (creates Post with type PROMPT_RESPONSE + promptId). Voice note support: audio recording (expo-av) → R2 upload → inline playback in feed.
- wave-5c-content-protection (sonnet) — Screenshot detection: iOS notification to post author (expo-screen-capture listener), Android FLAG_SECURE on Steamy/Explicit posts. VideoSeal watermark on Steamy/Explicit media (reuse F14 integration). Screen recording detection warning.

### Testgate Wave 5:
- [ ] Mood filters apply to photos before upload
- [ ] Location stickers and intent tags render on media
- [ ] Daily prompt rotates, users can respond with text/photo/voice
- [ ] Voice notes play inline in feed
- [ ] Screenshot of Steamy/Explicit content notifies author
- [ ] Watermark embedded in Steamy/Explicit media
