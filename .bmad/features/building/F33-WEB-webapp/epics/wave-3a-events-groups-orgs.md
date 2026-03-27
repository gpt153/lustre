# Epic: Wave 3a — Events, Groups, Organizations

**Epic ID:** F33-W3a
**Wave:** 3 — Secondary Pages & Polish
**Size:** haiku
**Depends On:** Wave 2 (all)
**Status:** VERIFIED

---

## Goal

Build the events listing/detail, groups listing/detail, and organizations pages. These are content-heavy pages that benefit from desktop's larger screen with multi-column layouts and hover previews.

## Acceptance Criteria

1. Events listing page: grid of event cards (3 columns at >1200px, 2 at 900-1200px, 1 at <900px); each card shows cover image (16:9, Next.js Image), title, date, location, attendee count, and "Gå med" button
2. Event detail page: cover image hero, title/date/location header, description in `max-width: 720px` reading zone, attendee list with avatars (horizontal scroll), map embed (static), RSVP button (primary copper)
3. Groups listing page: grid of group cards similar to events; each shows group avatar, name, member count, category tag, and join button
4. Group detail page: header with cover + avatar + name + description, member grid (similar to discover grid), group feed (reuses PostCard from W2d)
5. Organizations page: list of verified organizations with logo, name, description, event count; click opens org profile with their events and members
6. Event/group cards have hover lift effect (`translateY(-2px)`, shadow deepening to `var(--shadow-lg)`, 300ms `--spring` easing)
7. Filter bar at top of listings: category filter (dropdown), date range (for events), sort by (newest, popular, nearby)
8. All listing pages use React Server Components for initial data fetch with client-side pagination via "Ladda fler" button

## File Paths

- `apps/web/app/(app)/events/page.tsx`
- `apps/web/app/(app)/events/[id]/page.tsx`
- `apps/web/app/(app)/groups/page.tsx`
- `apps/web/app/(app)/groups/[id]/page.tsx`
- `apps/web/components/events/EventCard.tsx`
- `apps/web/components/events/EventCard.module.css`
- `apps/web/components/groups/GroupCard.tsx`

## Technical Notes

### Event Card CSS
```css
.eventCard {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 300ms var(--spring), box-shadow 300ms var(--spring);
}
.eventCard:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.coverImage {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
.cardBody {
  padding: var(--space-4);
}
.eventTitle {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}
.eventMeta {
  font-size: 13px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.attendeeCount {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 13px;
  color: var(--text-muted);
  margin-top: var(--space-3);
}
.joinButton {
  margin-top: var(--space-3);
  width: 100%;
}
```

### Category Tag CSS
```css
.categoryTag {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: var(--accent-glow);
  color: var(--accent);
}
```

### RSC Strategy
- `events/page.tsx` — Server Component: fetches events list
- `events/[id]/page.tsx` — Server Component: fetches event detail
- `EventCard.tsx` — Client Component: hover state, click handler
- `GroupCard.tsx` — Client Component: hover state, join action

## Definition of Done
- Events listing displays cards in responsive grid
- Event detail shows all info with RSVP action
- Groups listing displays cards with join action
- Group detail shows members and group feed
- Organizations listed with their events
- Hover effects work on all cards
- Filters update listings
- Server-rendered initial data, client pagination
