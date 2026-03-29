# F41-UX-polaroid-web — PRD

## Summary

Replace the existing F38 Polaroid Web implementation with a complete rebuild based on Stitch HTML reference designs. Every web-facing page that displays photos — Discovery, Feed, Profile, Chat, Match, and Edit Profile — gets Polaroid 600 treatment with exact proportions, scattered layouts, handwritten captions, and warm copper-toned design.

This is a **conversion** task, not a creative design task. Stitch HTML provides the exact design. F41 translates it to CSS Modules + React Server Components in the existing Next.js app.

## Problem

F38 attempted this but produced components that did not match the Stitch designs with sufficient fidelity. F41 is a clean-slate rebuild using the /planera-ui methodology where every epic starts from a specific HTML file.

## Dependencies

- **F40 Wave 1** — `packages/tokens/polaroid.ts` (shared Polaroid 600 constants). Already exists.
- **F33** — Next.js web app skeleton with CSS Modules architecture. Already exists.
- **Seed data** — 20 user profiles with photos must be loaded before any visual verification.

## Stitch Reference

- **Project v1:** `1086044651106222720` — 7 screens (feed, discovery, profile iterations)
- **Project v2:** `3228541579636523619` — 3 screens (match, chat, edit-profile)
- **HTML + PNG files:** `/home/samuel/lustre/.bmad/features/planned/F41-UX-polaroid-web/screenshots/stitch-reference/`
- **Analysis:** `/home/samuel/lustre/.bmad/features/planned/F41-UX-polaroid-web/stitch-analysis.md`

## Target Architecture

- **Platform:** Next.js (App Router)
- **Styling:** CSS Modules (`.module.css`) — no Tailwind, no styled-components
- **Components:** React Server Components where possible, Client Components only for interactivity
- **Tokens:** CSS custom properties in `apps/web/styles/tokens.css` (Section 11: Polaroid tokens)
- **Shared constants:** `packages/tokens/polaroid.ts` for JS-side calculations
- **Font:** Caveat via `next/font/google` for handwritten captions

## Scope

### In Scope
1. Polaroid design tokens as CSS custom properties
2. `PolaroidCard` component (CSS Module) — exact 600 proportions
3. `PolaroidMasonryGrid` component — CSS columns layout
4. Discovery page (`/discover/browse`) — Polaroid masonry grid with profiles
5. Feed page (`/home`) — masonry of Polaroid photo posts
6. Profile page (`/profile/[userId]`) — scattered Polaroid gallery + info panel
7. Chat page (`/chat`) — 3-panel layout with Polaroid avatars
8. Match modal — overlapping Polaroid cards
9. Edit Profile page — Polaroid photo gallery + form
10. Responsive breakpoints: 1440px, 900px, 599px

### Out of Scope
- Mobile/React Native (separate feature F37)
- Backend API changes
- New data models
- Dark mode (light mode first, dark mode is a follow-up)

## Success Criteria

- Every screen visually matches its Stitch HTML reference
- All Polaroid cards use exact 88:107 aspect ratio
- Caveat font renders for all captions
- Masonry grid responsive at all 3 breakpoints
- Hover effects match Stitch: rotate-to-0, lift -8px, scale 1.02
- `prefers-reduced-motion` disables animations
- Seed data visible in all screenshots — no empty states
- `~/bin/verify-wave-screenshots.sh` passes for every wave

## Non-Functional Requirements

- No increase to First Load JS budget (currently 102KB, budget <200KB)
- Server Components preferred (PolaroidCard, PolaroidMasonryGrid should be RSC)
- CSS Modules only — no inline styles except for dynamic rotation values
- All images lazy-loaded with `loading="lazy"` and proper `alt` text
