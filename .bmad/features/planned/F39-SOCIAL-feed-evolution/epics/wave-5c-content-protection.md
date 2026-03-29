# Epic: wave-5c-content-protection

**Model:** sonnet
**Wave:** 5
**Group:** A (parallel with 5a, 5b)

## Description

Content protection for Steamy/Explicit feed content: screenshot detection with author notification, forensic watermarking, and screen recording detection. Reuses VideoSeal integration from F14 ConsentVault.

## Acceptance Criteria

1. **Screenshot detection (mobile)**:
   - iOS: `expo-screen-capture` addScreenshotListener — on detection, send NATS event `lustre.post.screenshot` with `{ postId, viewerId }`
   - Android: `FLAG_SECURE` applied to feed screen when any Steamy/Explicit content is visible — prevents screenshots entirely
   - On screenshot event: author receives push notification "[username] tog en screenshot av ditt inlägg"
   - Screenshot events logged in new `ScreenshotLog` model (postId, viewerId, timestamp)
2. **Forensic watermarking (Steamy/Explicit only)**:
   - Reuse `services/api/src/lib/watermark.ts` from F14
   - When serving Steamy/Explicit media: embed invisible watermark with viewer's userId + sessionId
   - Watermark applied at CDN/streaming level, not at upload time (each viewer gets unique watermark)
   - For images: apply watermark via server-side image processing before serving
   - For video: reuse VideoSeal pipeline from F14
   - Fallback: if watermarking service unavailable, serve unwatermarked (non-blocking, same as F14)
3. **Screen recording detection**:
   - iOS: detect screen recording state change via `expo-screen-capture` isRecordingAsync
   - When detected: show in-app warning overlay "Skärminspelning upptäckt — detta bryter mot våra regler"
   - Log event but do not block playback (soft deterrent)
   - Repeated offenses (3+): flag user for review in moderation queue (increment counter on User model)
4. **Vanilla/Sultry content**: no watermarking or screenshot blocking (treat as public-grade content)
5. Schema: `ScreenshotLog` model with id, postId, viewerId, createdAt

## File Paths

- `services/api/prisma/schema.prisma` (add ScreenshotLog model)
- `services/api/prisma/migrations/[timestamp]_f39_screenshot_log/migration.sql`
- `services/api/src/trpc/post-router.ts` (add screenshot event handler)
- `services/api/src/lib/feed-watermark.ts` (new — adapts F14 watermark for feed context)
- `packages/app/src/hooks/useScreenshotProtection.ts` (new)
- `packages/app/src/screens/FeedScreen.tsx` (update — integrate protection hook)
