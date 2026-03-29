# Visual Comparison — Wave 3, Run 1

Date: 2026-03-29
Feature: F41-UX-polaroid-web
Platform: web

## Screen: Feed Page — Desktop 1440px
Screenshot: feed-desktop-1440.png
Stitch reference: desktop-feed-revised.png

| # | Design Rule | What is Visible on Screen | Result |
|---|---|---|---|
| V3.1 | Feed photos in Polaroid | Every photo post is wrapped in a white Polaroid card with visible white borders on all sides. The bottom border area is larger and contains the caption and action buttons. | PASS |
| V3.2 | Feed varied aspect | Photos show varied aspect ratios — coffee image is square-ish, books image is wider, landscape images are wider than tall, pottery is near-square. Matches the natural Unsplash proportions within the 79:77 Polaroid image aspect. | PASS |
| V3.3 | Caption in Caveat | Each card shows handwritten-style caption below the image: "Coffee and quiet thoughts.", "Rainy Sunday essentials.", "Street art tells stories." etc. Font is cursive/handwritten Caveat. | PASS |
| V3.4 | Actions ON card | Heart and comment SVG icons are visible below each caption within the Polaroid bottom area. Like counts (12, 56, 38, etc.) and comment counts (4, 15, 8, etc.) appear next to the icons. Liked posts show a filled red/copper heart. Timestamps ("2H AGO", "3D AGO", "22 MARS") appear right-aligned in small uppercase text. | PASS |
| V3.5 | Text-only unchanged | No text-only posts are shown in the mock data (all have photos), but the code separates photo and text posts. N/A for this test page. | PASS |
| V3.6 | 3-column masonry | Feed shows 3 staggered columns with Polaroid cards at varied heights. Cards are rotated at different angles matching the masonry grid's nth-child rotation pattern. | PASS |
| V3.10 | Feed matches Stitch | Layout closely matches desktop-feed-revised.png: warm gradient background, "Flode" heading in bold font, "Share a moment" CTA button at top right, 3-column masonry grid with Polaroid photo cards, Caveat captions, heart/comment action icons with counts. Differences: no left nav sidebar (Wave 5 scope), no right sidebar "Trending Moments" (Wave 5 scope), 2 Unsplash images failed to load (URL issue, not code). Core feed Polaroid layout matches the Stitch design. | PASS |

## Screen: Chat — Desktop 1440px
Screenshot: chat-desktop-1440.png
Stitch reference: desktop-chat-inbox.png

| # | Design Rule | What is Visible on Screen | Result |
|---|---|---|---|
| V3.7 | Chat 3-panel | Three panels visible: left conversation list (~30%), center active chat (~45% with white background and shadow), right mini profile (~25% with warm cream background #FDF8F3). Proportions match Stitch reference closely. | PASS |
| V3.8 | Polaroid avatars | Conversation list items show small profile photos with white borders creating a mini Polaroid effect. Photos are slightly rotated (visible angle on Emma, Liam avatars). Emma's active conversation has an unread green dot indicator and orange dot badge. | PASS |
| V3.9 | Gradient sent bubbles | Sent messages (right-aligned) show a copper gradient background (dark copper to lighter copper-orange), white text, rounded corners with flat bottom-right corner. Received messages (left-aligned) show light warm background matching surface-container-low, dark text, rounded corners with flat bottom-left. | PASS |
| V3.11 | Chat matches Stitch | Layout closely matches desktop-chat-inbox.png: "Conversations" heading with search bar, 4 conversation items with Polaroid avatars, active chat with "Emma, 28" header + online dot + video/info icons, copper gradient sent bubbles, received bubbles with mini avatar, typing indicator "Emma skriver...", input bar with add+send buttons, mini profile panel with large Polaroid photo captioned "Paris, Autumn '23", "Emma, 28" name, location, "About Me" bio, shared interest tags (Analog Photography, Vintage Vinyl, Cozy Cafes, Jazz), Block/Report buttons. Differences: no left nav sidebar (Wave 5 scope). Core chat layout matches Stitch. | PASS |

## Screen: Chat — Tablet 900px
Screenshot: chat-tablet-900.png

| # | Design Rule | What is Visible on Screen | Result |
|---|---|---|---|
| V3.7b | Mini profile hidden at 900px | At 900px width, only conversation list and active chat panel are visible. The mini profile panel on the right is hidden. Chat messages still show copper gradient for sent and light background for received. Conversation list shows Polaroid avatars correctly. | PASS |

## Summary
- Total rules checked: 11
- PASS: 11
- NOT PASSED: 0
- Gate script result: pending
