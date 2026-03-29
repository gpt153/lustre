# PRD: Feed Evolution — Spicy Levels, Post Types, Shorts, Reactions & Discovery

## Overview

Evolves the basic F05 feed into an Instagram-inspired social layer where users express themselves through multiple content types (Moments, Vibes, Shorts, Prompt responses), discover people via a proximity/interest-based algorithm, and connect through reactions and "Säg hej" DM bridge. Content visibility is controlled by 4 independent spicy-level toggles (Vanilla, Sultry, Steamy, Explicit) replacing the current preset system. Posts live both on the user's profile gallery and in the discovery feed. Video support with vibe filters (mood, location, intent) enables rich self-expression without face-altering effects.

Builds on F05 (feed CRUD + classification + algorithm), F24 (content moderation), F25 (dual mode), F28 (kudos), F35 (trust score / earned visibility).

## Target Audience

All Lustre users. Content creators, people seeking dates/connections, and those who want to express their sexuality on a spectrum from vanilla to explicit.

## Functional Requirements (FR)

### FR-1: Spicy-Level Toggles
- Priority: Must
- Acceptance criteria:
  1. Four independent boolean toggles: Vanilla, Sultry, Steamy, Explicit — replacing the current ContentPreference enum (SOFT, OPEN, EXPLICIT, NO_DICK_PICS)
  2. At least one toggle must be active at all times
  3. Toggles accessible via quick-access button in feed header (always visible, not buried in settings)
  4. Toggle icon color reflects active levels (blue=vanilla only, orange=sultry, red=steamy, purple=explicit)
  5. Posters tag their content with a spicy level at upload time
  6. ML classification (Sightengine) validates the tag — mismatched content blocked (e.g. explicit tagged as vanilla)
  7. Feed filters posts to only show content matching the viewer's active toggles
  8. Per-context quick switch: one tap changes active levels without leaving the feed

### FR-2: Post Types — Moments, Vibes, Prompt Responses
- Priority: Must
- Acceptance criteria:
  1. **Moment**: Photo/video + optional text (max 2000 chars). Permanent on profile gallery + appears in feed. Up to 4 media items per post (existing behavior, extended with spicy level)
  2. **Vibe**: Photo/video + optional short text (max 280 chars). Ephemeral — auto-deleted after 24h. Appears in feed only (not on profile gallery). Visible indicator showing time remaining
  3. **Prompt Response**: Answer to a platform-curated daily question. Text + optional photo/voice note. Appears in feed and on profile. New prompt rotated daily, previous prompts remain answerable
  4. Post creation flow: Camera → choose type (Moment/Vibe/Prompt) → add filter/text → tag spicy level → post
  5. All post types support the same spicy-level tagging

### FR-3: Shorts (Video Posts)
- Priority: Must
- Acceptance criteria:
  1. 15-60 second video recording directly in app
  2. Swipe-up from camera, record, post — max 2 taps to start recording
  3. Shorts appear in feed as auto-playing (muted) video, tap for sound
  4. Shorts appear on profile gallery alongside Moments
  5. Support for front/back camera toggle, flash
  6. Video uploaded to R2, transcoded to HLS for streaming (no raw download)
  7. Thumbnail auto-generated from first frame

### FR-4: Vibe Filters
- Priority: Should
- Acceptance criteria:
  1. **Mood filters**: Warm glow, golden hour, neon, film grain, noir — color/tone adjustments only, no face alteration
  2. **Location stickers**: City/neighborhood text overlays (Stockholm, Söder, Malmö, etc.) — user selects from list, no GPS auto-detect in sticker
  3. **Intent tags**: "Date night", "Just vibes", "New in town", "Looking for trouble" — visual badges overlaid on media
  4. **Text overlays**: Styled typography options for captions on media
  5. Filters applied client-side before upload (no server-side processing needed)
  6. No face-altering filters (beauty, face swap, AR masks) — these undermine trust on a dating platform

### FR-5: Feed Carousel & Profile Gallery
- Priority: Must
- Acceptance criteria:
  1. Each post in the feed shows a horizontal carousel of its own media (up to 4 images/videos per post) with dot indicators
  2. Posts from different users scroll vertically — carousel is within a single post only
  3. Tapping avatar/username navigates to full profile
  4. "Se hela profilen" CTA button visible on each post card
  5. Profile page shows a gallery tab with all Moments and Shorts (grid layout, newest first)
  6. Profile gallery respects viewer's spicy-level toggles — content above viewer's level is blurred with level indicator
  7. Vibes do NOT appear on profile gallery (ephemeral only)

### FR-6: Reactions & "Säg hej"
- Priority: Must
- Acceptance criteria:
  1. Replace single LIKE with multiple reactions: 🔥 (hot), 😍 (crush), 🤝 (would hang) — stored per user per post
  2. Reaction counts visible to post author only (not public) — "12 reactions" not "12 🔥"
  3. **"Säg hej" button** on every post — opens DM with the post attached as context. If no existing conversation: creates one (requires match or gatekeeper, depending on settings)
  4. **Share to DM**: Send someone else's post to an existing conversation (private, no public sharing/repost)
  5. No repost/reshare mechanic — content cannot be amplified beyond its original audience
  6. No public comment section — reactions + DM are the only interaction paths

### FR-7: Discovery Feed Algorithm
- Priority: Must
- Acceptance criteria:
  1. Feed ranked by: proximity (city-level, not street), interest compatibility, spicy-level match, recency (24h half-life), trust score (F35), and engagement quality
  2. Trust score integration: users with higher trust scores get more feed impressions (earned visibility)
  3. Spotlight boost (F35): active spotlight adds +30 to feed ranking during 30-min window
  4. New accounts get limited feed reach for first 14 days (slow onboarding — prevents spam before norms are absorbed)
  5. "Show less" remains functional — penalizes similar content
  6. Feed shows one post at a time for Shorts (not multiple visible simultaneously) to prevent zombie-scrolling
  7. Daily prompt posts get a temporary boost in feed ranking for first 6 hours

### FR-8: Content Protection
- Priority: Should
- Acceptance criteria:
  1. Screenshot detection in feed: notify post author when someone screenshots their content (iOS notification, Android FLAG_SECURE blocks screenshots)
  2. Steamy/Explicit content has invisible watermark (viewer ID embedded) — reuses VideoSeal integration from F14
  3. Screen recording detection triggers in-app warning

### FR-9: Daily Prompts System
- Priority: Should
- Acceptance criteria:
  1. Platform curates a pool of 100+ prompts (seeded), rotated daily
  2. Prompts range from vanilla ("Beskriv din perfekta söndagsmorgon") to spicy ("Vad gör dig kåt som inte borde göra dig kåt?")
  3. Spicy prompts only shown to users with Steamy/Explicit toggles active
  4. Users can answer with text, photo, or voice note (30-60s)
  5. Voice note answers stored as audio files in R2, played inline in feed

## Non-Functional Requirements (NFR)

- Feed load: < 1 second for first 10 posts (maintained from F05)
- Video upload: < 10 seconds for 60s clip on 4G
- Vibe auto-deletion: cron job runs every hour, deletes expired vibes and their R2 media
- Spicy-level toggle: < 200ms to apply filter change (client-side filtering, no server round-trip for toggle state change — server sync in background)
- Content classification: < 3 seconds per image (maintained), < 10 seconds per video (new)
- Feed must not show content above user's active spicy levels under any circumstance (security-critical)

## MVP Scope

**MVP (Wave 1-3):** FR-1 (spicy toggles), FR-2 (post types), FR-5 (carousel + gallery), FR-6 (reactions + säg hej), FR-7 (algorithm update)

**Phase 2 (Wave 4-5):** FR-3 (shorts/video), FR-4 (vibe filters), FR-8 (content protection), FR-9 (daily prompts)

## Risks and Dependencies

- **Depends on:** F05 (existing feed), F24 (content moderation/classification), F25 (dual mode), F28 (kudos), F35 (trust score + earned visibility), F09 (chat — for "Säg hej" DM bridge)
- **Sightengine:** Must validate spicy-level tags against classification — may need tuning of nudity thresholds to distinguish Sultry vs Steamy vs Explicit
- **Video transcoding:** R2 + HLS transcoding for shorts — may use Cloudflare Stream or self-hosted FFmpeg
- **App Store compliance:** Explicit content behind age-gate + toggle-off-by-default. Default feed state is Vanilla+Sultry only
- **Storage costs:** Video content significantly increases R2 storage. Budget for ~2 SEK/GB/month
- **Vibe cleanup:** Cron job must reliably delete expired vibes to avoid storage bloat
