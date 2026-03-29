# Lustre Polaroid Design System

## Core Concept
All photos in Lustre (profiles, feed, chat, avatars) are rendered as Polaroid instant photo cards. This creates a tactile, authentic aesthetic that differentiates Lustre from every other dating app.

## Polaroid 600 Proportions (MANDATORY)

Based on real Polaroid 600 film: 88 x 107mm total, 79 x 77mm image area.

```
┌─────────────────────────┐
│       6.5mm (7.39%)     │  ← Top border
│   ┌─────────────────┐   │
│   │                 │   │
│4.5│   79 x 77 mm    │4.5│  ← Side borders (5.11%)
│mm │   (image area)  │mm │
│   │                 │   │
│   └─────────────────┘   │
│      23.5mm (26.70%)    │  ← Bottom border (caption area)
└─────────────────────────┘
        88 x 107mm
```

### Exact Ratios
| Property | Value |
|---|---|
| Card aspect ratio | 88:107 (0.8224) |
| Image width | 89.77% of card width |
| Image aspect ratio | 79:77 (1.026:1, near-square) |
| Image height | 72% of card height |
| Side border | 5.11% of card width |
| Top border | 7.39% of card width |
| Bottom border | 26.70% of card width |
| Bottom vs sides | 5.22x thicker |
| Bottom vs top | 3.62x thicker |

### CSS Implementation
```css
.polaroid-card {
  aspect-ratio: 88 / 107;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  /* CSS padding-% is relative to element WIDTH, matching our ratios */
  padding: 7.39% 5.11% 26.70% 5.11%;
}

.polaroid-image {
  width: 100%;
  aspect-ratio: 79 / 77;
  object-fit: cover;
}

.polaroid-caption {
  font-family: 'Caveat', 'Patrick Hand', cursive;
  font-size: 0.9rem;
  color: #2C2421;
  text-align: center;
  margin-top: auto;
}
```

### React Native Implementation
```tsx
const POLAROID = {
  CARD_ASPECT: 88 / 107,      // 0.8224
  IMAGE_ASPECT: 79 / 77,      // 1.026
  BORDER_SIDE: 0.0511,        // × card width
  BORDER_TOP: 0.0739,         // × card width
  BORDER_BOTTOM: 0.2670,      // × card width
  IMAGE_WIDTH_RATIO: 0.8977,  // × card width
} as const;

function getPolaroidDimensions(cardWidth: number) {
  return {
    cardWidth,
    cardHeight: cardWidth * (107 / 88),
    imageWidth: cardWidth * POLAROID.IMAGE_WIDTH_RATIO,
    imageHeight: cardWidth * (77 / 88),
    borderTop: cardWidth * POLAROID.BORDER_TOP,
    borderSide: cardWidth * POLAROID.BORDER_SIDE,
    borderBottom: cardWidth * POLAROID.BORDER_BOTTOM,
  };
}
```

## Visual Rules

### Card Styling
- Background: pure white (#FFFFFF)
- Shadow: soft drop shadow (0 4px 16px rgba(0,0,0,0.18))
- Rotation: ±2° to ±6° for scattered/natural feel
- Stack effect: 2-3 card edges visible behind main card at varied angles

### Caption Area (bottom white strip)
- ONE line of handwritten text only
- Font: Caveat, Patrick Hand, or Indie Flower
- Content varies by context:
  - Discovery: name + short quote from profile
  - Feed: photo caption
  - Chat: message or description
  - Profile: personal quote

### Interactions
- Like/comment/action icons go ON the Polaroid
  - Discovery: semi-transparent overlay icons on photo, or on white strip
  - Feed: small icons on white bottom strip next to caption
- NEVER place interaction buttons outside/below the card

## Brand Colors
| Color | Hex | Usage |
|---|---|---|
| Copper | #B87333 | Primary, CTAs, active states |
| Gold | #D4A843 | Secondary accents, highlights |
| Warm White | #FDF8F3 | Backgrounds |
| Charcoal | #2C2421 | Text, icons |
| Ember | #C85A3A | Tertiary, alerts, emphasis |

## Typography
| Context | Font |
|---|---|
| Headlines | Plus Jakarta Sans (or General Sans) |
| Body text | Inter |
| Polaroid captions | Caveat / Patrick Hand / Indie Flower |

## Backgrounds
- Primary: Warm White #FDF8F3
- Gradient: flowing organic from faded copper to warm cream
- NEVER tile or repeat patterns
- NEVER use cold tones (green, blue, grey)
- Animated backgrounds: React Native Skia + Reanimated (BlurCircle layers, FractalNoise)

## Layout Patterns

### Mobile
- Discovery: single Polaroid centered, vertical stack flow, prev/next peeking
- Feed: vertical scattered Polaroids with varied rotation
- Chat: messages as bubbles, shared photos as inline Polaroids
- Profile: Polaroid stack with swipe gesture

### Desktop
- Discovery: masonry grid of Polaroids with staggered rotations
- Feed: 3-column masonry with scattered Polaroids
- Chat: 3-panel (conversations / chat / mini profile)
- Profile: scattered Polaroids left, info right

## Stitch Design System
- Asset ID: 16173399879373693498
- Name: "Lustre Polaroid System"
- Project v1: 1086044651106222720 (iterations)
- Project v2: 3228541579636523619 (full app)

## NEVER DO
- Never make bottom border larger than 26.70% of card width
- Never make image area smaller than 72% of card height
- Never use more than one caption line
- Never tile/repeat backgrounds
- Never place interactions outside the Polaroid
- Never use cold colors in backgrounds
