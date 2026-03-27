# Epic: Wave 3d — Settings Panel

**Epic ID:** F33-W3d
**Wave:** 3 — Secondary Pages & Polish
**Size:** haiku
**Depends On:** Wave 2 (all)
**Status:** NOT STARTED

---

## Goal

Build a unified settings page with sidebar navigation and content area. Desktop's wide layout allows sidebar + content simultaneously, making settings browsing efficient.

## Acceptance Criteria

1. Settings layout: two-column with sidebar navigation (240px, left) + content area (right, max 600px); sidebar shows section groups with icons (Account, Privacy, Notifications, Appearance, Subscription, Help)
2. Account section: email, phone, password change, linked social accounts, delete account (destructive action with confirmation modal)
3. Privacy section: profile visibility toggles (show on discover, show distance, show online status), blocked users list with unblock option, data export request button
4. Notifications section: toggle switches for email notifications (matches, messages, events, marketing), desktop notification permission request button via Notification API
5. Appearance section: theme toggle (light/dark) with live preview, mode switch (vanilla/spicy), sound effects toggle, reduced motion toggle
6. Subscription section: current plan display, upgrade CTA (links to app for in-app purchase), billing history table
7. All toggle switches use copper color when enabled, smooth slide animation (200ms `--spring`), `role="switch"` with `aria-checked`
8. Settings persist immediately on change via shared `usePreferencesStore` with optimistic updates and error rollback toast

## File Paths

- `apps/web/app/(app)/settings/page.tsx`
- `apps/web/app/(app)/settings/layout.tsx`
- `apps/web/components/settings/SettingsSidebar.tsx`
- `apps/web/components/settings/SettingsSidebar.module.css`
- `apps/web/components/settings/SettingsSection.tsx`
- `apps/web/components/settings/Toggle.tsx`
- `apps/web/components/settings/Toggle.module.css`

## Technical Notes

### Settings Layout CSS
```css
.settingsLayout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--space-8);
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-6);
}
@media (max-width: 900px) {
  .settingsLayout {
    grid-template-columns: 1fr;
  }
}
```

### Sidebar CSS
```css
.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.sidebarItem {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 200ms ease, color 200ms ease;
}
.sidebarItem:hover {
  background: rgba(184, 115, 51, 0.06);
  color: var(--text-primary);
}
.sidebarItemActive {
  background: rgba(184, 115, 51, 0.1);
  color: var(--color-copper);
}
```

### Toggle Switch CSS
```css
.toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--border-medium);
  position: relative;
  cursor: pointer;
  border: none;
  padding: 0;
  transition: background 200ms var(--spring);
}
.toggle[aria-checked="true"] {
  background: var(--color-copper);
}
.toggleKnob {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 2px;
  left: 2px;
  box-shadow: var(--shadow-xs);
  transition: transform 200ms var(--spring);
}
.toggle[aria-checked="true"] .toggleKnob {
  transform: translateX(20px);
}
.toggle:focus-visible {
  outline: 2px solid var(--color-copper);
  outline-offset: 2px;
}
```

### Settings Section CSS
```css
.section {
  margin-bottom: var(--space-8);
}
.sectionTitle {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-subtle);
}
.settingRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--border-subtle);
}
.settingLabel {
  font-size: 15px;
  color: var(--text-primary);
}
.settingDescription {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: var(--space-1);
}
```

### Delete Account Confirmation
Uses Modal component from W1c with destructive variant:
```css
.destructiveButton {
  background: var(--color-ember);
  color: white;
}
```

### RSC Strategy
- `settings/layout.tsx` — Server Component: renders sidebar + content area
- `settings/page.tsx` — Server Component: fetches user preferences
- `SettingsSidebar.tsx` — Client Component: active section state
- `SettingsSection.tsx` — Client Component: form state, toggle handlers
- `Toggle.tsx` — Client Component: switch interaction

## Definition of Done
- Settings page renders with sidebar + content area
- All 6 sections render with correct controls
- Toggle switches animate smoothly and persist changes
- Desktop notification permission request works
- Theme/mode changes apply live
- Delete account shows confirmation modal
- Responsive: sidebar collapses to top nav at <900px
- All toggles accessible with keyboard and screen reader
