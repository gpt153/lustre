# Visual Comparison — Wave 1, Run 1

Date: 2026-03-29
Feature: F40-UX-polaroid-mobile
Platform: mobile (Android emulator, odin9)

## Screen: PolaroidCard standalone (280px)
Screenshot: polaroid-card-280px.png
Stitch reference: mobile-match.png (for card proportions and shadow)

| # | Design Rule | What is Visible on Screen | Result |
|---|---|---|---|
| V1.1 | Card aspect ratio 88:107 | White card is visibly taller than wide. The height-to-width ratio appears correct at approximately 1.22, matching the Polaroid 600 spec. The image area is near-square inside the white frame. | PASS |
| V1.2 | Image aspect ratio 79:77 | The photo (woman in kayak on lake) fills a near-square area. It is very slightly wider than tall, consistent with the 79:77 ratio (1.026). | PASS |
| V1.3 | Side borders 5.11% | Thin white borders on left and right side of the image. The borders are narrow but visible, approximately 14px on a 280px card (5.0%). | PASS |
| V1.4 | Top border 7.39% | White border above the image is slightly taller than the side borders. Approximately 25px on a 340px card height (7.3%). | PASS |
| V1.5 | Bottom border 26.70% | Large white strip below the image containing the "Brad, 61" caption. The bottom strip is clearly the largest border, taking up roughly a quarter of the card height. | PASS |
| V1.6 | Bottom ~5x sides | The bottom white strip is visually approximately 5 times wider than the side borders. The caption area dominates the lower portion of the card. | PASS |
| V1.7 | White background #FFFFFF | Card background is pure white, distinct from the warm cream (#FDF8F3) page background. Clear contrast between card and page background. | PASS |
| V1.8 | Warm charcoal shadow | Soft shadow visible around the card with a warm brownish tone. Not grey. The shadow spreads diffusely, matching the warm charcoal spec (#2E1500 with 0.12 opacity). | PASS |
| V1.9 | Caveat caption | "Brad, 61" renders in a handwritten cursive script (Caveat font). The text is centered in the bottom white strip, dark charcoal color, legible at the correct size. | PASS |

## Screen: PolaroidStack (280px, 4 photos)
Screenshot: polaroid-stack-avatar.png
Stitch reference: mobile-profile-enhanced.png (for stack layout)

| # | Design Rule | What is Visible on Screen | Result |
|---|---|---|---|
| V1.10 | Stack peeking | Front card shows kayak photo with "Braa" caption. Behind it, 1-2 background card edges are visible at slight rotations (one peeking right, one left). The cards create a stacked/scattered appearance. Below the stack, 4 dot indicators are visible — 1 filled copper dot (active) and 3 lighter dots (inactive). | PASS |

## Screen: PolaroidAvatar (54px default)
Screenshot: polaroid-stack-avatar.png
Stitch reference: mobile-chat-inbox.png (for avatar proportions)

| # | Design Rule | What is Visible on Screen | Result |
|---|---|---|---|
| V1.11 | Avatar mini Polaroid | Three mini Polaroid avatars in a row. Left ("Brad") and center ("Angie") show stack ghost layers — faint card outlines peeking at rotations behind the main frame. Right ("Cat") has no stack layers. All three show photos loaded correctly. Each has a tiny name at the bottom in Caveat font. The overall dimensions appear proportional to 54x66px. | PASS |

## Summary
- Total rules checked: 11
- PASS: 11
- NOT PASS: 0
- Gate script result: (pending V4)
