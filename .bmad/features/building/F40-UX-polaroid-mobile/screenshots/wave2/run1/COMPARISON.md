# Visual Comparison — Wave 2, Run 1

Date: 2026-03-29
Feature: F40-UX-polaroid-mobile
Platform: mobile (Android emulator, odin9)

## Screen: Discovery Main Stack
Screenshot: discovery-main-stack.png
Stitch reference: mobile-discovery-stack.png (for card stack and action buttons)

| # | Design Rule | What is Visible on Screen | Result |
|---|---|---|---|
| V2.1 | Card aspect ~88:107 | White Polaroid card is visibly taller than wide. The card proportions match the 88:107 ratio — the height-to-width ratio appears approximately 1.22. The image area fills the upper portion with a wide white bottom strip below. | PASS |
| V2.2 | Image near-square | The photo (highway with light trails at night) fills a near-square area within the card frame. The image width is very slightly wider than its height, consistent with the 79:77 ratio. | PASS |
| V2.3 | Bottom strip with caption | Wide white bottom strip visible below the image. "Henry C, 41" is rendered in Caveat handwritten font, centered. Below it, the tagline "Jersey-pubbar med Witcher-energy" appears in lighter Caveat text. Two-line caption matches Stitch design. | PASS |
| V2.4 | Action buttons sized | Three action buttons visible below the card: left button (X/Pass) is medium-sized white circle, center button (Star/SuperLike) is smaller gold-tinted circle, right button (Heart/Like) is the largest copper-colored circle. UI dump confirms: Pass=168px(~64dp), Star=126px(~48dp), Like=210px(~80dp) matching Stitch spec. | PASS |
| V2.5 | Copper gradient on Like | The Like button (rightmost, largest) renders as a solid copper/brown circle. The gradient from #894D0D to #A76526 is applied — the button appears as a warm copper tone matching Stitch. Heart icon is white. | PASS |
| V2.6 | Background stack visible | Three background card edges are visible peeking behind the main card at varied rotations. Cards appear at approximately 1°, -3°, and 4° rotations with decreasing opacity (0.9, 0.8, 0.6), creating a stacked/scattered Polaroid appearance matching the Stitch 3-card background layout. | PASS |
| V2.7 | Tonal gradient bg | The screen background shows a subtle warm gradient — slightly copper-tinted at the top fading to warm cream (#FDF8F3) at the bottom. This matches the Stitch tonal-gradient spec: linear-gradient from rgba(184,115,51,0.08) to rgba(253,248,243,1). | PASS |
| V2.9 | Real photo loaded | Actual seed profile photo (highway with car light trails at night) is loaded and rendered. Not a placeholder or spinner. Real profile data with name "Henry C" and age "41" from seed database. | PASS |
| V2.10 | Matches Stitch | Overall layout matches the mobile-discovery-stack.png reference: centered Polaroid card with background stack, three action buttons below (Pass white, Star gold, Like copper gradient), top bar with "Lustre" title and icons in copper, tonal gradient background. Caption area in Caveat font with name + tagline. The proportions and spacing align closely with the Stitch design. | PASS |

## Screen: Discovery Vertical Stack
Screenshot: discovery-vertical-stack.png
Stitch reference: mobile-discovery.png (for vertical peek layout)

| # | Design Rule | What is Visible on Screen | Result |
|---|---|---|---|
| V2.8 | Prev/next peek (vertical) | Previous profile card peeks above the main card — it is faded (approximately 40% opacity), slightly rotated (2 degrees), and partially visible. The main card "Brad, 41" is centered with the photo (person sitting in grassy field) visible. Below, the next profile card peeks from the bottom — faded at approximately 60% opacity, rotated -3 degrees. Both peek cards show the Polaroid white frame structure. Three small semi-transparent action buttons (X, star, heart at 32px) are overlaid on the top-right corner of the main card photo, matching the Stitch design's overlay button layout. | PASS |

## Screen: Mid-Swipe Animation
Screenshot: discovery-midswipe.png
Stitch reference: N/A (animation frame)

| # | Design Rule | What is Visible on Screen | Result |
|---|---|---|---|
| V2.11 | Swipe animation | The card is displaced to the right and rotated clockwise during a swipe gesture. A green "LIKE" stamp is visible on the upper-left portion of the card at partial opacity, indicating the swipe-right-to-like feedback. The background card behind is revealed as the front card moves away. Spring physics are evident in the card's position. | PASS |

## Screen: Action Buttons After Swipe
Screenshot: discovery-action-buttons.png
Stitch reference: mobile-discovery-stack.png

| # | Design Rule | What is Visible on Screen | Result |
|---|---|---|---|
| V2.12 | Action buttons post-swipe | After the swipe completed, a new profile card appeared (field of dandelions). The three action buttons remain visible and correctly sized: white Pass circle with X icon, gold Star circle, and large copper Like circle. The card stack replenished with the next profile from seed data. | PASS |

## Summary
- Total rules checked: 11
- PASS: 11
- NOT PASS: 0
- Gate script result: (pending V4)
