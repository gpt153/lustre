# Epic: E10 — Chatt Screen

## Stitch Source
Convert: `html/chatt.html`
Reference: `screenshots/stitch-reference/chatt.png`

## Description
Rewrite the Chatt tab screen to match Stitch design. Two sections: "Nya matchningar" horizontal avatar scroll with copper ring borders, and "Konversationer" vertical list with avatar, name, message preview, timestamp, and unread badges. Reuse existing useChat hook and conversation data.

## Acceptance Criteria
1. Screen header: "Chatt" in 20px extrabold Manrope
2. "Nya matchningar" section: horizontal FlatList of 56px avatars
3. Match avatars: copper ring border (2px primary-container), copper dot for new
4. "Konversationer" section: vertical FlatList of conversation rows
5. Row: 48px avatar + name (bold) + message preview (truncated) + timestamp (right)
6. Unread badge: primary-container bg (#894D0D), white text, 20px circle
7. Typing indicator: italic text "skriver..." in primary-container color
8. Online indicator: green dot at bottom-right of avatar (8px)
9. Tapping a conversation navigates to chat room via existing [conversationId] route
10. Dividers between rows: 1px outline-variant at 30% opacity

## File Paths
- `apps/mobile/app/(tabs)/chat/index.tsx` (rewrite)
- `apps/mobile/app/(tabs)/chat/_layout.tsx` (update)

## Design Tokens (from Stitch)
- Match avatar: 56px (w-14), copper ring border 2px
- New match dot: 10px, primary-container bg, positioned bottom-right
- Conversation avatar: 48px (w-12)
- Name: 16px bold Manrope, on-surface (#211a17)
- Preview: 14px medium Manrope, on-surface-variant (#524439), max 1 line
- Timestamp: 12px medium Manrope, outline (#857467)
- Unread badge: 20px circle, bg primary-container, text white 10px bold
- Online dot: 8px, bg #22c55e (green), border 2px white
- Typing: 14px italic, color primary-container (#894D0D)
- Row padding: 12px vertical, 24px horizontal
- Divider: 1px, rgba(216,195,180,0.30)
