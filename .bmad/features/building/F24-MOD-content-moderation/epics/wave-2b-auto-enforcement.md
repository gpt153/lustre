# Epic: wave-2b-auto-enforcement

**Model:** haiku
**Feature:** F24-MOD-content-moderation

## Goal
Add automated enforcement to `chat-classifier.ts`: after incrementing `filteredSentCount`, check thresholds and auto-escalate (warning → temp ban → permanent ban).

## Context
- `chat-classifier.ts` already increments `User.filteredSentCount` when a message is filtered
- `User` model has: `filteredSentCount Int`, `warningCount Int`, `isBanned Boolean`, `bannedUntil DateTime?`
- `ModerationAction` model exists for audit trail
- Thresholds from roadmap: 3 filtered → warning, 5 filtered → 7-day ban, 10 filtered → permanent ban
- adminId for automated actions: use a special system UUID constant (e.g., `'00000000-0000-0000-0000-000000000001'`)

## Acceptance Criteria

1. After the `filteredSentCount` increment in `chat-classifier.ts`, fetch the updated count and check thresholds:
   ```
   filteredSentCount === 3 → WARNING
   filteredSentCount === 5 → TEMP_BAN (7 days)
   filteredSentCount === 10 → PERMANENT_BAN
   ```
   Use `===` (not `>=`) so each threshold fires exactly once

2. For each threshold crossed:
   - Create a `ModerationAction` record (userId=senderId, adminId=SYSTEM_ADMIN_ID, actionType, reason='Auto-enforcement: repeated filtered messages')
   - For WARNING: increment `User.warningCount` by 1
   - For TEMP_BAN: set `User.isBanned = true`, `User.bannedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)`
   - For PERMANENT_BAN: set `User.isBanned = true`, `User.bannedUntil = null`

3. All DB operations in the enforcement block are wrapped in a try/catch — errors logged with console.warn but never thrown (must not break the message flow)

4. A constant `SYSTEM_ADMIN_ID = '00000000-0000-0000-0000-000000000001'` is defined at the top of `chat-classifier.ts`

## File Paths
- `services/api/src/lib/chat-classifier.ts` — add auto-enforcement logic after filteredSentCount increment
