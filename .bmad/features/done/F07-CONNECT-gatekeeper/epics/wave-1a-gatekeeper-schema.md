# Epic: wave-1a-gatekeeper-schema
**Model:** haiku
**Wave:** 1, Group A (sequential, first)

## Description
Add Prisma models for the Gatekeeper system: GatekeeperConfig, GatekeeperConversation, GatekeeperMessage.

## Acceptance Criteria
1. GatekeeperConfig model with fields: id, userId (unique relation to Profile), enabled (Boolean, default true), strictness (enum: MILD/STANDARD/STRICT, default STANDARD), customQuestions (String[] array), dealbreakers (String[] array), aiTone (enum: FORMAL/CASUAL/FLIRTY, default CASUAL), createdAt, updatedAt
2. GatekeeperConversation model with fields: id, senderId (relation to User), recipientId (relation to User), configId (relation to GatekeeperConfig), status (enum: ACTIVE/PASSED/FAILED/EXPIRED), summary (optional String for AI summary), tokensCost (Int, default 0), createdAt, updatedAt
3. GatekeeperMessage model with fields: id, conversationId (relation to GatekeeperConversation), role (enum: USER/AI/SYSTEM), content (String), createdAt
4. Enums: GatekeeperStrictness, GatekeeperTone, GatekeeperStatus, GatekeeperMessageRole
5. Proper indexes on senderId, recipientId, conversationId
6. Migration generated successfully
7. No TODO/FIXME comments

## File Paths
- services/api/prisma/schema.prisma
