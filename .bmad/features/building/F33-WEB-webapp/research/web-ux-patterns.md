# Research: Desktop Dating App & Productivity UX Patterns

**Created:** 2026-03-27

---

## 1. Dating App Web Experiences

### Tinder Web
- **Layout:** Two-column — sidebar (matches/messages) + main area (card stack or chat)
- **Discovery:** Single card at a time with like/pass buttons below — same as mobile, not grid
- **Navigation:** Top nav bar with icons, no keyboard shortcuts
- **Strengths:** Simple, familiar to mobile users
- **Weaknesses:** Wastes screen real estate, no hover previews, no keyboard navigation
- **Lustre opportunity:** Grid discovery is more efficient for power users on desktop

### Hinge Web
- **Layout:** Two-column — discover on left, chat on right
- **Discovery:** Single profile at a time with scroll, comment on specific prompts
- **Navigation:** Minimal, click-driven
- **Strengths:** Prompt-commenting pattern works well on desktop (keyboard for typing)
- **Weaknesses:** No grid view, limited multitasking, no keyboard shortcuts
- **Lustre opportunity:** Multi-panel layout allows discover + chat simultaneously

### Bumble Web
- **Layout:** Three-column — nav rail + discover + matches/chat
- **Discovery:** Single card stack, similar to mobile
- **Navigation:** Left sidebar with icons + labels
- **Strengths:** Best existing layout among dating apps, closest to Lustre's three-zone
- **Weaknesses:** Still no grid view, no keyboard shortcuts, no hover previews
- **Lustre opportunity:** Bumble validated the three-column approach; Lustre can add grid, keyboard, hover

### Feeld Web
- **Layout:** Simple two-column
- **Discovery:** Card-based but larger format
- **Navigation:** Basic top nav
- **Strengths:** Clean design, handles non-traditional content well
- **Weaknesses:** Minimal desktop optimization
- **Lustre opportunity:** Show that sex-positive platforms can have premium web experiences

### Key Takeaways — Dating Apps
1. All dating apps treat web as "mobile in a browser" — none optimize for desktop
2. No dating app uses grid discovery — this is a clear differentiator for Lustre
3. No dating app has keyboard shortcuts — massive power-user opportunity
4. Bumble's three-column layout is the closest validation for Lustre's three-zone design
5. Chat is always secondary on web — Lustre can make it first-class with two-column chat

---

## 2. Productivity App Patterns (Non-Dating)

### Discord
- **Layout:** Three-column — server/channel list + message list + member sidebar
- **Relevance:** Proves three-column layout works for communication apps
- **Keyboard:** Ctrl+K for quick switcher (equivalent to Lustre's command palette)
- **Hover:** Server icons show tooltip with server name
- **Responsive:** Collapses to two-column, then single column
- **Adopted:** Command palette (Ctrl+K), three-zone collapse behavior, hover tooltips on nav rail

### Slack
- **Layout:** Three-column — workspace/channels + messages + thread sidebar
- **Relevance:** Thread sidebar = Lustre's context panel concept
- **Keyboard:** Extensive shortcuts, Ctrl+K for search
- **Hover:** Channel names show preview on hover
- **Responsive:** Desktop-first, mobile is separate app
- **Adopted:** Context panel as "thread sidebar" pattern, keyboard-first design

### Notion
- **Layout:** Two-column — sidebar + content, with optional side panel
- **Relevance:** Command palette, keyboard navigation, drag-and-drop
- **Keyboard:** Ctrl+K or / for commands, arrow keys for navigation
- **Hover:** Blocks show drag handle on hover
- **Responsive:** Sidebar collapses to hamburger menu
- **Adopted:** Slash commands in command palette, clean minimal sidebar

### Linear
- **Layout:** Three-column — sidebar + list + detail panel
- **Relevance:** Best-in-class keyboard shortcuts and fast navigation
- **Keyboard:** Single-key shortcuts (no modifier needed for common actions)
- **Hover:** Row hover shows action buttons
- **Responsive:** Desktop-only
- **Adopted:** Single-key shortcuts for common actions (L=like, P=pass), row hover actions

### Figma
- **Layout:** Canvas with panels
- **Relevance:** Drag-and-drop, hover states, keyboard shortcuts
- **Keyboard:** Extensive shortcuts with visual cheatsheet
- **Hover:** Layers show on hover in sidebar
- **Adopted:** Drag-and-drop photo reordering pattern

---

## 3. Pattern Synthesis for Lustre Web

### Three-Zone Layout (validated by: Discord, Slack, Bumble)
```
Nav Rail (72px) | Main Content (max 720px) | Context Panel (320px)
```
- Nav rail with icon-only items + tooltip on hover (Discord pattern)
- Main content area never wider than 720px for readability
- Context panel for preview/detail (Slack thread pattern)
- Collapses progressively: context panel -> nav rail to bottom bar

### Grid Discovery (unique to Lustre, inspired by: Pinterest, Instagram Explore)
- 4-column grid at desktop, responsive down to 2 columns
- Hover reveals second image + name/age overlay (300ms crossfade)
- Click opens in context panel, not full page (Slack thread pattern)
- Keyboard navigation with visible focus indicator

### Command Palette (validated by: Discord, Slack, Notion, Linear, VS Code)
- Ctrl+K global trigger
- Search across: profiles, conversations, events, settings
- Recent items section
- Fuzzy search with category filtering
- Arrow keys to navigate, Enter to select, Escape to close

### Keyboard Shortcuts (validated by: Linear, Notion, Gmail)
- Single-key shortcuts for common actions (no Ctrl needed): L, P, S, Enter, Escape
- Number keys for tab switching (Gmail pattern)
- ? key shows shortcut overlay
- Shortcuts are contextual — different per page

### Hover as Design Language (validated by: all productivity apps)
- Cards: lift + shadow deepen + reveal secondary info
- Avatars: scale + accent ring
- Nav items: label tooltip appears
- List items: action buttons reveal
- Images: crossfade to next image

### Responsive Collapse (validated by: Discord, Slack)
```
>1440px:  Rail + Content + Context
1200px:   Rail + Content + Narrow Context
900px:    Rail + Content (context on demand)
600px:    Bottom bar + Content
<600px:   Bottom bar + Single column
```

---

## 4. Anti-Patterns to Avoid

1. **Mobile-in-browser:** Do NOT show a single swipe card on desktop (Tinder Web mistake)
2. **Desktop-only features without mobile equivalents:** Ensure every web feature has a mobile equivalent in F32 (except admin/ads dashboards)
3. **Over-relying on hover:** All hover interactions must have click/tap alternatives for tablet users
4. **Complex keyboard shortcuts:** Keep shortcuts single-key or well-known combos (Ctrl+K, not Ctrl+Shift+Alt+K)
5. **Ignoring tab navigation:** Every interactive element must be reachable via Tab key
6. **Forgetting `prefers-reduced-motion`:** All animations must respect this media query
