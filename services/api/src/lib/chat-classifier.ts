import { prisma } from '../trpc/context.js'
import { classifyImage } from './sightengine.js'

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
    const tags = await classifyImage(mediaUrl)
    if (tags.length === 0) {
      return
    }

    // Check if nudity detected (FULL or PARTIAL)
    const nudityTag = tags.find(tag => tag.dimension === 'NUDITY')
    const genitalsTag = tags.find(tag => tag.dimension === 'BODY_PART' && tag.value === 'GENITALS')

    const hasNudity = nudityTag && (nudityTag.value === 'FULL' || nudityTag.value === 'PARTIAL')
    const hasGenitals = genitalsTag && genitalsTag.confidence > 0.3

    if (!hasNudity && !hasGenitals) {
      return
    }

    // Get the recipient (the other participant in the conversation)
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

    // If recipient has NO_DICK_PICS preference and nudity was detected, mark as filtered
    if (recipientFilter && recipientFilter.preset === 'NO_DICK_PICS') {
      await prisma.message.update({
        where: { id: messageId },
        data: { isFiltered: true },
      })
    }
  } catch (error) {
    console.warn('Failed to classify chat media:', error)
  }
}
