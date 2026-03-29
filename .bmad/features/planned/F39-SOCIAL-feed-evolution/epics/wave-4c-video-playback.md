# Epic: wave-4c-video-playback

**Model:** haiku
**Wave:** 4
**Group:** B (parallel with A)

## Description

Video playback in feed and profile gallery. Auto-play muted on scroll-into-view, tap for sound. Profile gallery shows video thumbnails with duration badge.

## Acceptance Criteria

1. Feed video playback (mobile):
   - Auto-play muted when post scrolls into viewport (IntersectionObserver / onViewableItemsChanged)
   - Pause when scrolled out of view
   - Tap on video toggles sound on/off (muted icon overlay)
   - Tap-and-hold opens full-screen player
   - Uses `expo-av` Video component with HLS source
2. Feed video playback (web):
   - HTML5 `<video>` with HLS.js for adaptive streaming
   - Same auto-play muted / tap-for-sound behavior
   - IntersectionObserver for play/pause on scroll
3. Profile gallery:
   - Video items show thumbnail with duration badge (bottom-right, "0:45" format)
   - Small play icon overlay on thumbnail center
   - Tap opens post detail with video player
4. One video plays at a time — when a new video scrolls into view, previous one pauses
5. Loading state: show thumbnail until video buffer is ready, then crossfade to playing video
6. Error handling: if HLS stream fails, show thumbnail with "Video kan inte spelas" message

## File Paths

- `packages/app/src/components/VideoPlayer.tsx` (new — shared mobile component)
- `packages/app/src/components/PostMediaCarousel.tsx` (update — handle video items)
- `apps/web/components/feed/VideoPlayer.tsx` (new — web HLS.js player)
- `apps/web/components/feed/MediaCarousel.tsx` (update)
- `packages/app/src/components/ProfileGallery.tsx` (update — video thumbnails)
