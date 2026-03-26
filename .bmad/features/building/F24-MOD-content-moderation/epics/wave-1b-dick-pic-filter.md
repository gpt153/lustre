# Epic: wave-1b-dick-pic-filter

**Model:** haiku
**Feature:** F24-MOD-content-moderation

## Goal
Enhance the existing chat image classifier to:
1. Use the new `classifyAndTagMessage` + `isDickPic` functions from sightengine.ts
2. Track `filteredSentCount` on the sender (User.filteredSentCount) each time a message is filtered
3. The filter already works (sets `message.isFiltered = true`); this epic just wires in the new functions and tracking

## Context
- Existing: `services/api/src/lib/chat-classifier.ts` — classifies chat images, sets `isFiltered = true` if dick-pic AND recipient has NO_DICK_PICS filter
- New in wave-1a: `classifyAndTagMessage(messageId, imageUrl)`, `isDickPic(tags)`, `classifyMessageAsync()` in `sightengine.ts`
- New in wave-1a: `User.filteredSentCount Int @default(0)` in schema

## Acceptance Criteria

1. `chat-classifier.ts` updated to call `classifyAndTagMessage(messageId, imageUrl)` instead of the old inline `classifyImage()` call (so tags are persisted in `MessageContentTag`)

2. After classifying, uses `isDickPic(tags)` from sightengine.ts to decide if filtering is needed (same outcome as before — no behavior change for existing logic)

3. When a message IS filtered (`isFiltered = true`), increment `User.filteredSentCount` by 1 for the sender:
   ```typescript
   await prisma.user.update({
     where: { id: senderId },
     data: { filteredSentCount: { increment: 1 } },
   })
   ```

4. Export a function `classifyChatMedia(messageId: string, mediaUrl: string, conversationId: string): Promise<void>` (same signature as before so existing callers work)

5. No other behavior changes — if recipient does NOT have NO_DICK_PICS filter, message is NOT filtered even if it's a dick-pic

## File Paths
- `services/api/src/lib/chat-classifier.ts` — refactor to use classifyAndTagMessage + isDickPic + increment filteredSentCount
