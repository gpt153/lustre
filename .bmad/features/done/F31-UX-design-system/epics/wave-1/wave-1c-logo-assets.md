# Epic: wave-1c-logo-assets

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — depends on 1b for typography/brand font)

## Description

Integrate the Lustre logo PNG into the web header, mobile splash screen, and web favicon. Create a reusable LustreLogo component that renders the logo PNG alongside the "Lustre" brand text in the $brand font. Optimize PNG assets for web and mobile.

## Acceptance Criteria

1. Logo PNG files are copied from `.bmad/logo/` to `packages/ui/src/assets/`: `lustre-logo-transparent.png` (for dark backgrounds) and `lustre-logo-white.png` (for light backgrounds).
2. A `LustreLogo` component exists in `packages/ui/` that renders the logo PNG (configurable height, default 32px) + "Lustre" text in $brand font. Accepts `variant` prop: 'light' (white bg logo + charcoal text) or 'dark' (transparent bg logo + warmCream text).
3. Web favicon is generated from the logo and placed at `apps/web/app/favicon.ico` and `apps/web/app/icon.png` (192x192 for PWA).
4. Mobile splash screen config in `apps/mobile/app.json` references the logo with appropriate background color (warmWhite for light, #1A1614 for dark).
5. Logo images are optimized (compressed PNG, no larger than 50KB each).

## File Paths

- `packages/ui/src/assets/` (new directory with logo PNGs)
- `packages/ui/src/LustreLogo.tsx` (new)
- `apps/web/app/favicon.ico`
- `apps/web/app/icon.png` (new)
- `apps/mobile/app.json`
