# Epic: Wave 3b — Learn Modules, Coach (Text), Achievements

**Epic ID:** F33-W3b
**Wave:** 3 — Secondary Pages & Polish
**Size:** haiku
**Depends On:** Wave 2 (all)
**Status:** NOT STARTED

---

## Goal

Build the educational content pages (Learn modules), the AI coach in text-only mode (no voice on web), and the achievements/gamification display. Desktop provides a reading-friendly environment for longer educational content.

## Acceptance Criteria

1. Learn listing page: module cards in 2-column grid (>900px) or single column (<900px); each card shows module title, description snippet, progress bar (copper fill), estimated duration, difficulty tag
2. Learn module detail: article-style layout in `max-width: 720px` reading zone with rich text content (headings, paragraphs, bullet lists, blockquotes), images, and "Markera som klar" completion button at bottom
3. Progress tracking: copper progress bar at top of module (sticky below header), percentage complete, updates as user scrolls through content sections (via IntersectionObserver)
4. Coach page: text-only chat interface reusing ChatRoom component styling from W2b, with coach avatar (distinct from user chats), typing indicator for AI responses, suggested prompts as clickable chips above input
5. Coach sessions show "Röstläge finns i appen" (Voice mode available in app) subtle banner at top with app download link
6. Achievements page: grid of achievement badges (4 columns >1200px, 3 at 900-1200px, 2 at <900px); unlocked badges in full color with copper glow, locked badges in grayscale with lock icon overlay; hover shows achievement description
7. Streak counter displayed prominently: current streak number (large, General Sans 48px, copper color), flame icon, "dagar i rad" label, calendar heatmap showing activity (similar to GitHub contributions)
8. All learn content server-rendered (RSC) for SEO; coach and achievements are client components

## File Paths

- `apps/web/app/(app)/learn/page.tsx`
- `apps/web/app/(app)/learn/[id]/page.tsx`
- `apps/web/app/(app)/coach/page.tsx`
- `apps/web/app/(app)/achievements/page.tsx`
- `apps/web/components/learn/ModuleCard.tsx`
- `apps/web/components/learn/ModuleCard.module.css`
- `apps/web/components/achievements/AchievementBadge.tsx`
- `apps/web/components/achievements/StreakCounter.tsx`

## Technical Notes

### Module Card CSS
```css
.moduleCard {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 300ms var(--spring), box-shadow 300ms var(--spring);
}
.moduleCard:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.progressBar {
  height: 4px;
  border-radius: 2px;
  background: var(--border-subtle);
  margin-top: var(--space-4);
  overflow: hidden;
}
.progressFill {
  height: 100%;
  background: var(--color-copper);
  border-radius: 2px;
  transition: width 300ms var(--ease-out-expo);
}
.difficultyTag {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background: var(--accent-glow);
  color: var(--accent);
}
```

### Achievement Badge CSS
```css
.badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  cursor: pointer;
}
.badgeIcon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 200ms var(--spring), box-shadow 200ms ease;
}
.badgeUnlocked {
  box-shadow: 0 0 12px rgba(184, 115, 51, 0.2);
}
.badgeUnlocked:hover {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(184, 115, 51, 0.3);
}
.badgeLocked {
  filter: grayscale(1);
  opacity: 0.5;
}
.badgeName {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
}
```

### Streak Counter CSS
```css
.streakCounter {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8);
}
.streakNumber {
  font-family: var(--font-heading);
  font-size: 48px;
  font-weight: 600;
  color: var(--color-copper);
  line-height: 1;
}
.streakLabel {
  font-size: 15px;
  color: var(--text-muted);
  margin-top: var(--space-2);
}
.heatmap {
  display: grid;
  grid-template-columns: repeat(52, 12px);
  gap: 2px;
  margin-top: var(--space-6);
}
.heatmapCell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: var(--border-subtle);
}
.heatmapLevel1 { background: rgba(184, 115, 51, 0.2); }
.heatmapLevel2 { background: rgba(184, 115, 51, 0.4); }
.heatmapLevel3 { background: rgba(184, 115, 51, 0.6); }
.heatmapLevel4 { background: var(--color-copper); }
```

### Coach Suggested Prompts
```css
.promptChips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
}
.promptChip {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-medium);
  background: var(--bg-elevated);
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 200ms ease, border-color 200ms ease;
}
.promptChip:hover {
  background: rgba(184, 115, 51, 0.06);
  border-color: var(--color-copper);
  color: var(--color-copper);
}
```

## Definition of Done
- Learn listing shows module cards with progress bars
- Module detail renders article-style with scroll progress indicator
- Coach chat works in text mode with AI responses
- Coach shows "voice mode in app" banner
- Achievements display as badge grid with unlocked/locked states
- Streak counter shows current streak with heatmap
- All pages responsive at all breakpoints
- Learn content server-rendered for SEO
