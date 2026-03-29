# Epic: wave-2b-say-hi-bridge

**Model:** sonnet
**Wave:** 2
**Group:** A (parallel with 2a)

## Description

"Säg hej" button on posts creates or finds a conversation with the post author, attaching the post as context. Share-to-DM allows sending a post to an existing conversation. Integrates with F07 Gatekeeper and F09 Chat.

## Acceptance Criteria

1. tRPC `post.sayHi` (mutation):
   - Input: `{ postId }`
   - If Match exists between viewer and author → find or create Conversation, send system message "👋 [username] vill säga hej om din post" with post reference
   - If no Match exists → initiate Gatekeeper flow (F07 `gatekeeper.initiate`) with post context as conversation starter
   - If Gatekeeper is disabled by recipient → create Conversation directly
   - Returns `{ conversationId }` for navigation to chat
   - Rate limited: max 10 "Säg hej" per 24h per user (Redis counter)
2. tRPC `post.shareToConversation` (mutation):
   - Input: `{ postId, conversationId }`
   - Validates caller is participant in conversation
   - Creates Message with type TEXT and body containing post reference (formatted link/embed)
   - Post reference includes: author display name, first media thumbnail URL, text preview (first 100 chars)
3. Post reference model: `PostReference` embedded in message metadata (not a separate table — stored as JSON in Message.metadata field)
4. If the post is deleted after being shared, the reference shows "Inlägget har tagits bort" placeholder
5. Privacy: "Säg hej" respects block list — if either party has blocked the other, procedure throws FORBIDDEN

## File Paths

- `services/api/src/trpc/post-router.ts` (add sayHi, shareToConversation)
- `services/api/src/lib/say-hi.ts` (new — orchestration logic)
- `services/api/prisma/schema.prisma` (add metadata field to Message if not exists)
