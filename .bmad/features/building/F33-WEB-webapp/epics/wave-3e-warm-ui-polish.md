# Epic: Wave 3e — Warm UI Polish

**Epic ID:** F33-W3e
**Wave:** 3 — Secondary Pages & Polish
**Size:** haiku
**Depends On:** Wave 2 (all)
**Status:** NOT STARTED

---

## Goal

Apply the final warm UI polish layer across all pages: ambient animations, sound design via Web Audio API, micro-interactions, and texture refinement. This transforms the app from "functional" to "delightful."

## Acceptance Criteria

1. Paper grain texture (`/textures/paper-grain.png`, 200x200px, ~5KB) applied to page background via `background-blend-mode: multiply` on light mode, `screen` on dark mode; noise texture (`/textures/noise-soft.png`, 128x128px, ~2KB) on elevated surfaces at `opacity: 0.03`
2. Breathing ambient gradient: fixed-position copper radial gradient with `@keyframes breathe` (8s cycle, opacity 0.04 -> 0.08, subtle scale 1.0 -> 1.05), positioned top-right, `pointer-events: none`
3. Sound design via `SoundManager` (Web Audio API singleton): `like.mp3` on like action, `match.mp3` on match, `message.mp3` on incoming message, `send.mp3` on message sent; all sounds <5KB each, initialized lazily on first user interaction, respect user sound preference
4. Nav rail hover micro-interactions: icon scales 1.05 on hover, underline indicator slides in from left (200ms `--spring`), tooltip fades in after 300ms delay
5. Avatar hover: scale(1.05) + copper ring (`box-shadow: 0 0 0 3px var(--color-copper), 0 0 0 5px rgba(184, 115, 51, 0.2)`) with 200ms `--spring` transition
6. Button press haptic replacement: all primary buttons show brief copper radial pulse behind on click (`@keyframes buttonPulse`, 400ms, opacity 0.2 -> 0), replacing mobile's haptic feedback
7. Page transitions: cross-fade between routes (200ms opacity transition) using Next.js `loading.tsx` with skeleton components
8. All warm UI animations disabled when `prefers-reduced-motion: reduce` — breathing gradient static at opacity 0.06, all transitions set to near-instant (0.01ms), sounds still play

## File Paths

- `apps/web/lib/sound-manager.ts`
- `apps/web/styles/warm-ui.css`
- `apps/web/public/textures/paper-grain.png`
- `apps/web/public/textures/noise-soft.png`
- `apps/web/public/sounds/like.mp3`
- `apps/web/public/sounds/match.mp3`
- `apps/web/public/sounds/message.mp3`
- `apps/web/public/sounds/send.mp3`

## Technical Notes

### SoundManager Implementation
```typescript
// apps/web/lib/sound-manager.ts
class SoundManager {
  private context: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private enabled = false;

  async init() {
    if (this.context) return;
    this.context = new AudioContext();
    await Promise.all([
      this.load('like', '/sounds/like.mp3'),
      this.load('match', '/sounds/match.mp3'),
      this.load('message', '/sounds/message.mp3'),
      this.load('send', '/sounds/send.mp3'),
    ]);
  }

  private async load(name: string, url: string) {
    if (!this.context) return;
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    this.buffers.set(name, await this.context.decodeAudioData(buffer));
  }

  play(name: string, volume = 0.5) {
    if (!this.context || !this.enabled || !this.buffers.has(name)) return;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = this.buffers.get(name)!;
    gain.gain.value = volume;
    source.connect(gain).connect(this.context.destination);
    source.start();
  }

  setEnabled(val: boolean) { this.enabled = val; }
}

export const soundManager = new SoundManager();
```

### Warm UI CSS (warm-ui.css)
```css
/* Breathing gradient */
.appShell::after {
  content: '';
  position: fixed;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at 70% 30%,
    rgba(184, 115, 51, 0.08) 0%,
    transparent 60%
  );
  animation: breathe 8s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes breathe {
  0%, 100% { opacity: 0.04; transform: scale(1); }
  50% { opacity: 0.08; transform: scale(1.05); }
}

/* Noise overlay on elevated surfaces */
.elevated::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/textures/noise-soft.png');
  background-size: 128px;
  opacity: 0.03;
  pointer-events: none;
  border-radius: inherit;
  z-index: 1;
}

/* Button pulse on click */
@keyframes buttonPulse {
  0% { transform: scale(0.5); opacity: 0.2; }
  100% { transform: scale(2); opacity: 0; }
}
.primaryButton::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle, var(--color-copper) 0%, transparent 70%);
  opacity: 0;
  pointer-events: none;
}
.primaryButton:active::after {
  animation: buttonPulse 400ms ease-out;
}

/* Nav item underline slide */
.navItem::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--color-copper);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 200ms var(--spring);
}
.navItem:hover::after {
  transform: scaleX(1);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .appShell::after {
    animation: none;
    opacity: 0.06;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Page Transition Pattern
```css
/* In layout or loading.tsx */
.pageEnter {
  animation: pageIn 200ms ease;
}
@keyframes pageIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Sound Integration Points
- Like action (discover, profile, feed): `soundManager.play('like')`
- Match popup: `soundManager.play('match')`
- Incoming chat message: `soundManager.play('message', 0.3)`
- Message sent: `soundManager.play('send', 0.3)`

### Performance Budget Check
- Paper grain: 5KB PNG
- Noise: 2KB PNG
- Sounds: ~15KB total (4 files)
- Breathing gradient: 0KB (CSS only)
- All micro-interactions: 0KB (CSS only)
- **Total warm UI overhead: ~22KB**

## Definition of Done
- Paper grain texture visible on page background (both light and dark)
- Breathing gradient animates subtly at 60fps
- Sound effects play on like, match, message send/receive
- Sounds respect user preference toggle
- Nav rail hover shows scale + underline + tooltip
- Avatar hover shows scale + copper ring
- Button click shows copper pulse
- Page transitions crossfade smoothly
- All animations disabled under `prefers-reduced-motion`
- Total warm UI asset overhead <25KB
