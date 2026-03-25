# Epic: wave-2b-gatekeeper-flow
**Model:** sonnet
**Wave:** 2, Group A (sequential, second — depends on wave-2a)

## Description
Orchestration layer: tRPC procedures to initiate gatekeeper conversation, send messages, handle AI responses, deliver message on pass, redirect on fail.

## Acceptance Criteria
1. `gatekeeper.initiate` mutation: sender provides recipientId + their initial message; creates GatekeeperConversation (status ACTIVE), stores sender's message, returns first AI response
2. `gatekeeper.respond` mutation: sender sends reply to AI; stores message, gets AI response, checks if qualification is complete
3. On PASS: updates conversation status to PASSED, stores AI summary, returns success with summary and badge info
4. On FAIL: updates conversation status to FAILED, returns constructive redirect feedback
5. `gatekeeper.getConversation` query: returns conversation with all messages for sender
6. `gatekeeper.checkRequired` query: given recipientId, returns whether Gatekeeper is active for that user (and whether sender has already passed)
7. Mutual match bypass: if both users have liked each other, skip Gatekeeper entirely
8. Conversations expire after 24 hours of inactivity (status -> EXPIRED)
9. All procedures use protectedProcedure
10. No TODO/FIXME comments

## File Paths
- services/api/src/trpc/gatekeeper-router.ts (extend existing)
