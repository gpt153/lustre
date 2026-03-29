# Epic: wave-5a-vibe-filters

**Model:** haiku
**Wave:** 5
**Group:** A (parallel)

## Description

Client-side image/video filters applied before upload. Mood filters, location stickers, intent tags, and styled text overlays. No face-altering filters.

## Acceptance Criteria

1. **Mood filters** (5 presets):
   - Warm Glow: warm color temperature shift + slight vignette
   - Golden Hour: golden tint + soft contrast
   - Neon: high saturation + cool shadows
   - Film Grain: desaturation + noise texture + slight fade
   - Noir: high contrast black & white
2. **Location stickers** (selectable from list):
   - Swedish cities: Stockholm, Göteborg, Malmö, Uppsala, etc.
   - Stockholm neighborhoods: Söder, Östermalm, Vasastan, Kungsholmen, etc.
   - Rendered as styled text overlay on image (Stitch typography, semi-transparent background pill)
   - Position: user can drag to place (or default bottom-left)
3. **Intent tags** (badges overlaid on media):
   - "Date night 🌙", "Just vibes ✨", "New in town 🗺️", "Looking for trouble 🔥", "Cozy night in 🛋️"
   - Rendered as pill badges, position selectable (top-left, top-right, bottom-left, bottom-right)
4. **Styled text overlays**:
   - User types caption directly on image
   - 3 font styles: serif (Noto Serif), sans (Manrope), handwritten
   - Color picker (white, copper, charcoal, gold)
   - Background: none, semi-transparent dark, semi-transparent light
5. All filters applied client-side using `expo-image-manipulator` (photos) or `expo-av` effects (video)
6. Filter preview: real-time preview before applying
7. Multiple effects can be combined (mood + sticker + intent + text)
8. Final composited image/video uploaded as a single file (server receives finished result)

## File Paths

- `packages/app/src/components/FilterPicker.tsx` (new)
- `packages/app/src/components/LocationStickerPicker.tsx` (new)
- `packages/app/src/components/IntentTagPicker.tsx` (new)
- `packages/app/src/components/TextOverlayEditor.tsx` (new)
- `packages/app/src/lib/image-filters.ts` (new — filter application logic)
- `packages/app/src/screens/CreatePostScreen.tsx` (update — add filter step)
