import { prisma } from '../trpc/context.js'
import { classifyAndTagMessage, isDickPic } from './sightengine.js'
import { ModerationActionType } from '@prisma/client'

const SYSTEM_ADMIN_ID = '00000000-0000-0000-0000-000000000001'

/**
 * Classify chat media and apply content filters.
 * Fire-and-forget function for asynchronous processing.
 *
 * @param messageId - UUID of the Message record
 * @param mediaUrl - Public URL of the media for classification
 * @param conversationId - UUID of the conversation
 */
export async function classifyChatMedia(messageId: string, mediaUrl: string, conversationId: string): Promise<void> {
  try {
    // Only classify images (videos don't need classification for dick-pic filtering)
    const tags = await classifyAndTagMessage(messageId, mediaUrl)
    if (tags.length === 0) {
      return
    }

    // Check if it's a dick-pic using the new isDickPic helper
    if (!isDickPic(tags)) {
      return
    }

    // Get the message and sender ID
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return
    }

    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
    })

    // Find the recipient (the participant who is NOT the sender)
    const recipientParticipant = participants.find(p => p.userId !== message.senderId)
    if (!recipientParticipant) {
      return
    }

    // Check recipient's content filter preference
    const recipientFilter = await prisma.userContentFilter.findUnique({
      where: { userId: recipientParticipant.userId },
    })

    // If recipient has NO_DICK_PICS preference and it's a dick-pic, mark as filtered
    if (recipientFilter && recipientFilter.preset === 'NO_DICK_PICS') {
      await prisma.message.update({
        where: { id: messageId },
        data: { isFiltered: true },
      })

      // Increment the sender's filteredSentCount
      await prisma.user.update({
        where: { id: message.senderId },
        data: { filteredSentCount: { increment: 1 } },
      })

      // Auto-enforcement thresholds
      try {
        const updatedUser = await prisma.user.findUnique({
          where: { id: message.senderId },
          select: { filteredSentCount: true },
        })
        const count = updatedUser?.filteredSentCount ?? 0

        if (count === 3) {
          // Warning
          await prisma.moderationAction.create({
            data: {
              userId: message.senderId,
              adminId: SYSTEM_ADMIN_ID,
              actionType: ModerationActionType.WARNING,
              reason: 'Auto-enforcement: repeated filtered messages',
            },
          })
          await prisma.user.update({
            where: { id: message.senderId },
            data: { warningCount: { increment: 1 } },
          })
        } else if (count === 5) {
          // 7-day temp ban
          await prisma.moderationAction.create({
            data: {
              userId: message.senderId,
              adminId: SYSTEM_ADMIN_ID,
              actionType: ModerationActionType.TEMP_BAN,
              reason: 'Auto-enforcement: repeated filtered messages',
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          })
          await prisma.user.update({
            where: { id: message.senderId },
            data: {
              isBanned: true,
              bannedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          })
        } else if (count === 10) {
          // Permanent ban
          await prisma.moderationAction.create({
            data: {
              userId: message.senderId,
              adminId: SYSTEM_ADMIN_ID,
              actionType: ModerationActionType.PERMANENT_BAN,
              reason: 'Auto-enforcement: repeated filtered messages',
            },
          })
          await prisma.user.update({
            where: { id: message.senderId },
            data: { isBanned: true, bannedUntil: null },
          })
        }
      } catch (err) {
        console.warn('[chat-classifier] auto-enforcement error:', err)
      }
    }
  } catch (error) {
    console.warn('Failed to classify chat media:', error)
  }
}
