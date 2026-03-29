# Epic 1a: Polaroid Tokens

**Model:** haiku
**Wave:** 1
**Depends on:** nothing

## Description
Create Polaroid 600 token constants as a pure TypeScript module in the tokens package.

## Acceptance Criteria
1. File `packages/tokens/polaroid.ts` exists
2. Exports `POLAROID` object with: `CARD_ASPECT` (88/107), `IMAGE_ASPECT` (79/77), `BORDER_SIDE` (0.0511), `BORDER_TOP` (0.0739), `BORDER_BOTTOM` (0.2670), `IMAGE_WIDTH_RATIO` (0.8977)
3. Exports `getPolaroidDimensions(cardWidth: number)` returning `{ cardWidth, cardHeight, imageWidth, imageHeight, borderSide, borderTop, borderBottom }`
4. Exports `POLAROID_ROTATIONS` array: `[-5, -3, -1.5, 0, 1.5, 3, 5]`
5. Exports `POLAROID_SHADOW` matching the md shadow from `@lustre/tokens` shadows
6. Zero runtime dependencies — pure TS constants
7. `packages/tokens/index.ts` re-exports all Polaroid exports

## File Paths
- `packages/tokens/polaroid.ts` (CREATE)
- `packages/tokens/index.ts` (EDIT — add re-exports)
