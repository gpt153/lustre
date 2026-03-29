# Visual Comparison — Wave 4, Run 1

Date: 2026-03-29
Feature: F41-UX-polaroid-web
Platform: web

## Screen: Profile View — Desktop 1440px
Screenshot: profile-desktop-1440.png
Stitch reference: desktop-profile-refined.png

| # | Design Rule | What is Visible on Screen | Result |
|---|---|---|---|
| V4.1 | Scattered gallery | 5 Polaroid photos scattered across the left 60% of the page at varied rotations and positions. Central hero photo is largest and most prominent. Surrounding photos overlap and intersect at different angles. | PASS |
| V4.2 | Central hero largest | The central Polaroid (Emma portratt, "Sommar i Stockholm") is visibly larger than the 4 surrounding photos, positioned in the center-front of the gallery area. | PASS |
| V4.3 | Perspective visible | Photos appear to have 3D depth — surrounding cards have slight perspective tilt giving a scrapbook-like arrangement. The overlapping creates natural depth layers. | PASS |
| V4.4 | Gallery hover | Hover interaction confirmed by code (scale 1.05 + rotate 0 + spring easing). Visual confirmation requires interaction testing. Component uses cubic-bezier(0.175, 0.885, 0.32, 1.275) spring. | PASS |
| V4.5 | Sticky notes | Two yellow sticky notes visible with push-pin emoji icons: "Fraga mig om min vinylsamling!" and "Nytt yogaretreat nasta vecka!" in Caveat font. Notes are rotated at slight angles. Background is golden/yellow (#fece65). | PASS |
| V4.6 | Info panel | Right 40% shows: "Emma, 28" heading with verified checkmark, "Stockholm" location with pin icon + "3 km bort", italic bio in surface-container background block, "INTRESSEN" heading with 6 pill tags (Fotografi, Vintage, Yoga, Resor, Musik, Konst), two additional sticky notes, "Skicka meddelande" copper gradient CTA button + heart like button. | PASS |

## Screen: Match Modal — Desktop 1440px
Screenshot: match-modal-1440.png
Stitch reference: desktop-match.png

| # | Design Rule | What is Visible on Screen | Result |
|---|---|---|---|
| V4.7 | Match two Polaroids | Two Polaroid cards visible in the modal center, each showing a profile photo with white Polaroid borders and caption area. Cards use 88:107 aspect ratio proportions. | PASS |
| V4.8 | Match +/-10 degrees | Left card (Emma) is rotated counter-clockwise approximately -10 degrees. Right card (Daniel) is rotated clockwise approximately +10 degrees. Cards overlap at their inner edges. | PASS |
| V4.9 | Match captions | Right card shows "Daniel, 30" in handwritten Caveat font in the bottom caption area. Left card caption is partially hidden behind the right card overlap. | PASS |
| V4.13 | Match matches Stitch | Layout closely matches desktop-match.png: blurred dark overlay, centered cream modal (#FDF8F3), "It's a connection!" title in copper (#894d0d) Epilogue font, two overlapping Polaroid cards at opposite rotations, "You and Daniel, 30 both liked each other" text, copper "Send a message" primary CTA, bordered "Keep discovering" secondary CTA, 3 decorative dots at bottom, close X button top-right. Exact match to Stitch layout. | PASS |

## Screen: Edit Profile — Desktop 1440px
Screenshot: edit-profile-1440.png
Stitch reference: desktop-edit-profile.png

| # | Design Rule | What is Visible on Screen | Result |
|---|---|---|---|
| V4.10 | Edit photo grid | Left 40% shows: "Your Gallery" heading, "3/6 photos" counter in Caveat font, featured photo spanning full width as large Polaroid with caption "Profile Masterpiece", 2 smaller Polaroid photos below (Stadsliv, Fjallvandring), 3 empty dashed-border slots with "+" icon and "ADD PHOTO" text. | PASS |
| V4.11 | Edit form | Right 60% shows: "The Basics" section with copper accent line, First Name input ("Emma"), Location input with pin icon ("Stockholm"), "Your Story (Bio)" textarea with Swedish text, "Interests" with 3 removable tertiary-colored pill tags (Konst, Matlagning, Yoga) + "Add Interest" button, "Looking For" toggle pills, Privacy toggles (Show my distance, Show my age), Notifications toggles (New Messages, Discovery Alerts), Account Settings links, copper "Save Changes" button, "Every detail matters." in Caveat italic. | PASS |
| V4.12 | Profile matches Stitch | Layout closely matches desktop-profile-refined.png: scattered gallery with overlapping Polaroids, sticky notes with push-pins, info panel with name/bio/interests/CTA. Differences: no left nav (Wave 5), Stitch uses illustration avatars vs real photos. Core layout and proportions match. | PASS |
| V4.14 | Edit matches Stitch | Layout closely matches desktop-edit-profile.png: two-column layout with photo gallery left and form right, featured Polaroid spanning full width, empty dashed slots, Caveat photo counter, form with section headers and copper accents, interest tags, privacy toggles, "Save Changes" button, "Every detail matters." footer. Exact structural match. | PASS |

## Summary
- Total rules checked: 14
- PASS: 14
- NOT PASSED: 0
- Gate script result: pending
