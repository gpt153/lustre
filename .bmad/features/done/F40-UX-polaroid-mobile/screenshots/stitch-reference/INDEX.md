# F40 Stitch Reference — Polaroid Design System for Mobile

Stitch Project v1: 1086044651106222720
Stitch Project v2: 3228541579636523619
Downloaded: 2026-03-29
Copied from: F37-polaroid-mobile (F40 is a complete replacement)

## Screen Mapping

| # | Screen Name | HTML File | Image File | Target Component/Screen |
|---|---|---|---|---|
| 1 | Community Feed — Polaroid Gallery | html/mobile-feed.html | mobile-feed.png | `apps/mobile/app/(tabs)/index.tsx` — FeedScreen |
| 2 | Samuel's Profile — Polaroid Stack | html/mobile-profile.html | mobile-profile.png | `packages/app/src/screens/ProfileViewScreen.tsx` |
| 3 | Revised Discovery — Vertical Stack | html/mobile-discovery.html | mobile-discovery.png | `apps/mobile/app/(tabs)/discover.tsx` |
| 4 | Revised Feed — Warm Cream & Copper | html/mobile-feed-revised.html | mobile-feed-revised.png | `apps/mobile/app/(tabs)/index.tsx` (final design) |
| 5 | Discovery — Polaroid Stack | html/mobile-discovery-stack.html | mobile-discovery-stack.png | `apps/mobile/app/(tabs)/discover.tsx` (stack variant) |
| 6 | Profile — Enhanced Polaroid Stack | html/mobile-profile-enhanced.html | mobile-profile-enhanced.png | `packages/app/src/screens/ProfileViewScreen.tsx` (final) |
| 7 | It's a Connection! (Match) | html/mobile-match.html | mobile-match.png | `packages/app/src/components/MatchAnimation.tsx` |
| 8 | Chat Inbox | html/mobile-chat-inbox.html | mobile-chat-inbox.png | `apps/mobile/app/(tabs)/chat/index.tsx` |
| 9 | Welcome to Lustre | html/mobile-welcome.html | mobile-welcome.png | `apps/mobile/app/(auth)/welcome.tsx` |
| 10 | Edit Profile | html/mobile-edit-profile.html | mobile-edit-profile.png | `packages/app/src/screens/ProfileEditScreen.tsx` |
| 11 | Chat Room with Emma | html/mobile-chat-room.html | mobile-chat-room.png | `apps/mobile/app/(tabs)/chat/[conversationId].tsx` |

## Design Priority Per Screen

| Priority | Screens | Rationale |
|---|---|---|
| P0 — Core Polaroid | Discovery (3,5), Feed (4), Profile (6), Match (7) | These define the Polaroid identity |
| P1 — Communication | Chat Inbox (8), Chat Room (11) | High-frequency user screens |
| P2 — Profile Mgmt | Edit Profile (10) | Important but lower frequency |
| P3 — Onboarding | Welcome (9) | First impression, but one-time |

## Directory Structure

```
stitch-reference/
  INDEX.md                      (this file)
  mobile-feed.png               (45KB)
  mobile-profile.png            (45KB)
  mobile-discovery.png          (67KB)
  mobile-feed-revised.png       (48KB)
  mobile-discovery-stack.png    (70KB)
  mobile-profile-enhanced.png   (49KB)
  mobile-match.png              (71KB)
  mobile-chat-inbox.png         (37KB)
  mobile-welcome.png            (67KB)
  mobile-edit-profile.png       (29KB)
  mobile-chat-room.png          (45KB)
  html/
    mobile-feed.html
    mobile-profile.html
    mobile-discovery.html
    mobile-feed-revised.html
    mobile-discovery-stack.html
    mobile-profile-enhanced.html
    mobile-match.html
    mobile-chat-inbox.html
    mobile-welcome.html
    mobile-edit-profile.html
    mobile-chat-room.html
```
