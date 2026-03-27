# Design Research: Competitive Analysis & Industry Trends

## 1. Tinder Design System ("Obsidian")

- **Token architecture**: Two-tier — Base Tokens (raw color/spacing values) + Context Tokens (semantic: `color.background.primary`, `color.action.cta`). Managed via Tokens Studio (Figma plugin), compiled through Style Dictionary.
- **Colors**: Brand Primary #FE3C72, Gradient #FD267A to #FF5864 to #FF7854. Clean white backgrounds, minimal color palette.
- **Typography**: Logo = Gotham Rounded, UI = Circular Std (geometric sans-serif).
- **Card swipe mechanics**: Spring physics, rotation +/-12-15 degrees, threshold 100px offset or 500px/s velocity, fly-off 0.2s, snap-back 0.5s.
- **Navigation**: 5 bottom tabs — Discover, Explore, Likes, Messages, Profile.
- **Micro-interactions**: Heart burst on match, card rotation follows finger with spring delay, button press scale 0.95, confetti + haptic on match.

## 2. Hinge

- **Philosophy**: "Designed to be deleted" — focuses on meaningful connections over endless swiping.
- **Colors**: Minimal B&W + Kohlrabi green (~#8DB600) as single accent.
- **Typography**: Modern Era (Family Type) — large x-height, friendly tone.
- **No swipe mechanic**: Scrollable single-profile view replaces card stack.
- **Prompt system**: Photos interspersed with prompt responses. Each photo/prompt individually likeable. Prompt likes 47% more likely to lead to dates than photo likes.
- **AI features**: AI Prompt Feedback (Jan 2025) helps users write better responses.
- **Safety**: "Are You Sure?" pause before offensive messages.

## 3. Bumble (2024 Rebrand)

- **In-house rebrand**: May 2024, significant visual refresh.
- **Colors**: Primary yellow #FFC629, Warm background #FEFBED (not pure white — industry trend).
- **Typography**: Circular (same family as Tinder — industry convergence on geometric sans-serifs).
- **Key stat**: 75% of women say app look-and-feel matters to their experience.
- **UX innovation**: "Opening Moves" — women set icebreaker questions instead of writing first.

## 4. Feeld (Made Thought Rebrand)

- **Awards**: Won Fast Company 2024 Innovation by Design Award.
- **Colors**: Primary "Heat" red #E72900.
- **Typography**: Custom typeface FeeldEdge + Sohne + ABC Diatype — three-font stack for editorial quality.
- **Visual system**: AURA gradient system derived from blurred body photography. Avoids "rainbow" trope for queer/non-monogamous identity.
- **Results**: 20% engagement boost + 271% non-member interest increase post-rebrand.
- **Art direction**: Editorial approach to sex-positive content. Explicit without being crude.
- **Motion system**: Inspired by human body — breath, heartbeat, touch rhythms.
- **Grid**: 12-column grid, spacing derived from typeface metrics.

## 5. Grindr Modernization (2024-2025)

- **Colors**: Primary yellow #FFCC00, dark-first UI with black backgrounds.
- **Layout**: Grid-based profile display (not cards) — fundamentally different interaction model.
- **Strategy**: Modernizing through feature layers (Right Now, Roam, AI Wingman) rather than full visual overhaul.

## 6. Design Trends 2025-2026

- **Glassmorphism 2.0**: Apple's WWDC 2025 "Liquid Glass" made it mainstream. Key CSS: `background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid rgba(255,255,255,0.3)`. Performance rule: limit to 3-5 elements per screen.
- **Dark mode mandatory**: No longer optional. Design tokens must support automatic switching from day one.
- **Spring physics over bezier curves**: Users perceive spring animations as 15-20% "more responsive" (Google 2024 study). Industry-wide shift from ease-in-out to spring configs.
- **Haptic feedback patterns**: Confirm gestures with subtle vibrations. Three tiers: light (scroll snap), medium (action confirm), heavy (match/achievement).
- **Gesture-driven navigation**: Swipe, drag, pinch as primary navigation — buttons as fallback.

## 7. Dating App UX Best Practices

- Onboarding under 90 seconds to first interaction.
- One question per screen during onboarding.
- Progressive profile building — never front-load all fields.
- AI icebreaker prompts increase first-message response rates.
- Prompt-based bios outperform free-text bios (47% more dates per Hinge data).
- Three-tier notification urgency: match = high, message = medium, tip = low.

## 8. Typography Insights

- Variable fonts now standard — single file, all weights/widths.
- Industry converges on geometric sans-serifs: LL Circular, Sohne, Modern Era, ABC Diatype, Suisse International.
- Top fonts for digital-first products with premium positioning: Sohne (Klim), Circular (Lineto), General Sans (Fontshare, free).

## 9. Animation & Motion Systems

- **Framer Motion spring configs**: subtle `{stiffness:200, damping:20}`, standard `{stiffness:100, damping:10}`, bouncy `{stiffness:100, damping:5}`.
- **React Native Reanimated**: UI thread animations via worklets for guaranteed 60fps. Industry standard for gesture-driven RN apps.
- **Complementary tools**: Moti (Framer-like API for RN), Lottie (vector animations from After Effects), Shared Element Transitions (react-native-shared-element).
- **Sound design synergy**: Pair motion with subtle audio cues for premium feel.

## 10. Color Psychology

- First impressions form in under 50ms; 90% of snap judgments based on color alone.
- Red CTAs boost engagement 21% over neutral colors.
- Blue preferred by 54% of users for trust signals.
- Warm whites reduce eye strain and create comfort vs pure white (#FFFFFF).
- Gold and copper tones signal luxury, premium quality, trust, and warmth — ideal for Lustre's positioning as a premium sex-positive platform.

## Key Takeaways for Lustre

1. Every successful dating app uses 5 or fewer bottom tabs.
2. Warm backgrounds (not pure white) are now industry standard (Bumble #FEFBED, Lustre should use #FDF8F3).
3. Geometric sans-serif fonts signal modernity and premium quality.
4. Prompt-based profiles measurably outperform free-text bios.
5. Spring physics animations are perceived as more responsive and polished.
6. Feeld's rebrand proves that design investment directly drives engagement metrics (+20%) and brand interest (+271%).
7. Glassmorphism is mainstream but must be performance-budgeted.
8. Dark mode is table stakes, not a feature.
