# Visual Comparison — Wave 3, Run 2

Date: 2026-03-29
Feature: F40-UX-polaroid-mobile
Platform: mobile (Android emulator, emulator-5556)

## Screen: Feed with photo posts
Screenshot: feed-photo-posts.png
Stitch reference: mobile-feed-revised.png

| # | Design Rule | What is Visible on Screen | PASS/FAIL |
|---|---|---|---|
| V3.1 | Feed photos in Polaroid — White frame around each photo | Polaroid card visible with white border frame around the river/cliff photo. The white padding is visible on all sides with a thicker bottom strip. Second card partially visible at bottom. | PASS |
| V3.2 | Scattered rotations — Cards at -3, 2, -1, 4 degrees | The first card (Scarlett J river photo) is visibly rotated slightly counter-clockwise (~-3 degrees). The card is not straight. Second card at bottom shows a different rotation angle. | PASS |
| V3.3 | Actions ON card — Heart + chat icon on bottom white strip | Heart icon (♡) and chat icon (💬) visible on the bottom white strip of the Polaroid card, positioned to the right of the caption text. | PASS |
| V3.4 | Feed caption Caveat — Handwritten text, one line | Caption "Found this beautiful river spot today. Nature really heals the soul 🌊" visible in handwritten-style Caveat font below the photo, within the white bottom strip of the Polaroid. | PASS |
| V3.5 | Paper texture bg — Warm cream #FDF8F3, not cold white | Background is a warm cream/off-white color matching #FDF8F3. Header area and space between cards shows this warm tone, distinctly warmer than pure white. Sticky note banner visible with gold/warm tint. | PASS |
| V3.11 | Feed matches Stitch — Layout matches mobile-feed-revised.png | Header shows "Flöde" in copper italic, tab pills (Alla/Följer/Populärt) present. Sticky note welcome message visible. Polaroid cards with scattered rotations match the Stitch design layout. Author overlay (Scarlett J, 2h) at top-left of image inside dark pill. Overall structure matches Stitch reference closely. | PASS |

## Screen: Chat inbox
Screenshot: chat-inbox.png
Stitch reference: mobile-chat-inbox.png

| # | Design Rule | What is Visible on Screen | PASS/FAIL |
|---|---|---|---|
| V3.6 | Chat Polaroid avatars — Mini Polaroid frames, not circles | Avatars next to conversation names appear as small olive/green colored blocks approximately 54px in size. At this small size, the Polaroid white frame is not clearly distinguishable. The avatars load picsum.photos images but the Polaroid framing effect is minimal at 54px. The Stitch reference shows larger circular photos, not Polaroid frames. Implementation uses PolaroidAvatar but visual distinction is marginal. | FAIL |
| V3.7 | Unread copper dot — Copper dot with glow on unread rows | A dark dot is visible on the Zoe S conversation row (right side). The copper color and glow effect are not clearly visible in the screenshot — the dot appears dark/brown rather than vibrant copper with glow. | FAIL |

## Screen: Chat room with messages
Screenshot: chat-room-messages.png
Stitch reference: mobile-chat-room.png

| # | Design Rule | What is Visible on Screen | PASS/FAIL |
|---|---|---|---|
| V3.8 | Chat bubble colors — Received: #F5F1EE, Sent: copper gradient | The chat room background is very dark (near black). Message bubbles are present but text is barely visible — the bubble backgrounds appear as dark outlines against the dark background. The Stitch reference shows a light background with clearly visible beige received bubbles and copper-gradient sent bubbles. The dark theme does not match the design. | FAIL |
| V3.10 | Copper send button — Gradient circle, send icon | Input bar visible at bottom with camera icon (left), text input field, heart emoji, and send arrow (➤). The send button area is present but on the dark background the copper gradient circle is not clearly visible. The Stitch reference shows a prominent copper/brown circular send button. | FAIL |
| V3.12 | Chat matches Stitch — Layout matches mobile-chat-inbox.png + mobile-chat-room.png | Chat inbox: "Meddelanden" header with unread count badge (3), search bar, three conversation rows with names/timestamps/preview text — structural layout matches Stitch. Chat room: Header with back arrow, avatar initials, name "Zoe S", "ONLINE" label, kebab menu. Messages display with timestamps. Input bar with camera/input/heart/send buttons. Overall structure matches but the dark color scheme deviates significantly from the Stitch light theme. | FAIL |

## Screen: Chat room with inline Polaroid
Screenshot: chat-room-polaroid.png
Stitch reference: mobile-chat-room.png

| # | Design Rule | What is Visible on Screen | PASS/FAIL |
|---|---|---|---|
| V3.9 | Inline chat Polaroid — 256px wide, 88:107 ratio, -1deg tilt | A large rectangular area (~256px wide) is visible in the received messages section, appearing as a PolaroidCard component with white border frame around an image area. The image inside appears dark/not loaded but the Polaroid frame structure with white padding is visible. The card appears to have a slight rotation. | PASS |

## Summary
- Total rules checked: 12
- PASS: 7
- FAIL: 5
- Gate script result: PENDING

## Issues to fix for run3:
1. **V3.6 (Chat Polaroid avatars):** PolaroidAvatar at size 54 is too small to show the Polaroid frame clearly. Consider increasing size or making the white border more prominent.
2. **V3.7 (Unread copper dot):** Dot color needs to be more vibrant copper (#B87333) with visible glow shadow.
3. **V3.8, V3.10, V3.12 (Chat room dark theme):** The chat room renders with a near-black background instead of the warm light theme shown in Stitch. The ChatRoomScreen background color needs to be changed to warm cream/white to match the design. This is the biggest issue — affects bubble visibility, send button visibility, and overall Stitch match.
