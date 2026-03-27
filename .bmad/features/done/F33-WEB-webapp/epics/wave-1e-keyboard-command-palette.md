# Epic: Wave 1e — Keyboard Shortcuts & Command Palette

**Epic ID:** F33-W1e
**Wave:** 1 — Design Foundation
**Size:** haiku
**Depends On:** W1b (three-zone layout)
**Status:** VERIFIED

---

## Goal

Implement the keyboard shortcut system and command palette (Ctrl+K). This makes Lustre Web feel like a power-user tool — fast, efficient, keyboard-first when desired.

## Acceptance Criteria

1. Global keyboard shortcut system via `useKeyboardShortcuts` hook that registers/unregisters shortcuts based on active page context; shortcuts disabled when focus is in an input/textarea element
2. Global shortcuts work: `Ctrl+K` opens command palette, `Escape` closes any modal/panel/palette, `1-5` number keys switch tabs (Discover, Connect, Explore, Learn, Profile), `/` focuses search field
3. Discover page shortcuts: `→` or `L` likes, `←` or `P` passes, `↑` or `S` super-likes, `Enter` opens selected profile, arrow keys navigate grid with visible focus ring
4. Chat page shortcuts: `Enter` sends message, `Shift+Enter` inserts newline, `Escape` closes active chat panel
5. Command palette UI: glassmorphism modal with search input at top, sections for recent items / profiles / conversations / events / settings, arrow key navigation of results, `Enter` to select, `Escape` to close
6. Command palette search is fuzzy-matched, debounced (200ms), and shows max 8 results per section
7. `?` key shows a keyboard shortcut overlay displaying all available shortcuts for the current page context
8. All keyboard shortcuts have ARIA descriptions and are screen-reader announced via live region when triggered

## File Paths

- `apps/web/hooks/useKeyboardShortcuts.ts`
- `apps/web/hooks/useCommandPalette.ts`
- `apps/web/components/common/CommandPalette.tsx`
- `apps/web/components/common/CommandPalette.module.css`
- `apps/web/components/common/ShortcutOverlay.tsx`
- `apps/web/components/common/ShortcutOverlay.module.css`

## Technical Notes

### useKeyboardShortcuts Hook
```typescript
// apps/web/hooks/useKeyboardShortcuts.ts
'use client';
import { useEffect, useCallback } from 'react';

type ShortcutMap = Record<string, () => void>;

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if focus is in input/textarea/contenteditable
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Only allow Escape and Ctrl+K in input fields
      if (e.key !== 'Escape' && !(e.ctrlKey && e.key === 'k')) return;
    }

    const key = buildKeyString(e); // e.g., "Ctrl+k", "ArrowRight", "l"
    if (shortcuts[key]) {
      e.preventDefault();
      shortcuts[key]();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

### Command Palette CSS
```css
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(44, 36, 33, 0.4);
  z-index: 300;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20vh;
  animation: fadeIn 150ms ease;
}
.palette {
  width: 560px;
  max-height: 480px;
  background: var(--bg-elevated);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: paletteIn 300ms var(--spring);
}
@keyframes paletteIn {
  from { opacity: 0; transform: scale(0.97) translateY(-8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.searchInput {
  width: 100%;
  padding: var(--space-4) var(--space-6);
  border: none;
  border-bottom: 1px solid var(--border-subtle);
  background: transparent;
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--text-primary);
  outline: none;
}
.results {
  overflow-y: auto;
  max-height: 400px;
  padding: var(--space-2);
}
.resultItem {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: background 100ms ease;
}
.resultItem:hover,
.resultItemActive {
  background: rgba(184, 115, 51, 0.08);
}
.sectionLabel {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  padding: var(--space-3) var(--space-4) var(--space-1);
}
.shortcutHint {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}
```

### Command Palette — Dynamic Import
```typescript
// Load command palette only when needed
const CommandPalette = dynamic(
  () => import('@/components/common/CommandPalette'),
  { ssr: false }
);
```

### Shortcut Context System
Different pages register different shortcuts:
- **Global:** Ctrl+K, Escape, 1-5, /, ?
- **Discover:** L, P, S, Enter, ArrowUp/Down/Left/Right
- **Chat:** Enter (send), Shift+Enter (newline), Escape (close)
- **Profile:** E (edit), Escape (back)

Context is determined by which page component mounts `useKeyboardShortcuts`.

### RSC Boundaries
- `CommandPalette.tsx` — Client Component (dynamic import, interactive)
- `ShortcutOverlay.tsx` — Client Component (interactive overlay)
- `useKeyboardShortcuts.ts` — Client hook

## Definition of Done
- Ctrl+K opens command palette from any page
- Command palette search returns results across profiles, conversations, events
- Arrow keys navigate results, Enter selects, Escape closes
- Number keys 1-5 switch tabs from any page
- Discover shortcuts (L, P, S, arrows) work when on discover page
- Shortcuts disabled when typing in input fields (except Escape and Ctrl+K)
- ? shows shortcut overlay for current page
- Screen reader announces shortcut actions via ARIA live region
