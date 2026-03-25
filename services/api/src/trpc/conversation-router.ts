import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'

const listSchema = z.object({}).strict()

const getMessagesSchema = z.object({
  conversationId: z.string().uuid(),
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(50).default(50),
})

const revealFilteredMediaSchema = z.object({
  messageId: z.string().uuid(),
})

const updateMessageStatusSchema = z.object({
  messageId: z.string().uuid(),
  status: z.enum(['DELIVERED', 'READ']),
})

export const conversationRouter = router({
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ ctx }) => {
      const conversations = await ctx.prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId: ctx.userId,
            },
          },
        },
        select: {
          id: true,
          matchId: true,
          createdAt: true,
          participants: {
            select: {
              userId: true,
              lastReadAt: true,
              readReceipts: true,
              user: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      displayName: true,
                      photos: {
                        where: { isPublic: true },
                        orderBy: { position: 'asc' },
                        take: 1,
                        select: {
                          url: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              content: true,
              type: true,
              createdAt: true,
              senderId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return conversations.map((conv) => {
        const otherParticipant = conv.participants.find(p => p.userId !== ctx.userId) ?? null
        const currentParticipant = conv.participants.find(p => p.userId === ctx.userId) ?? null
        const lastMessage = conv.messages[0]

        // Calculate unreadCount: messages from other user after lastReadAt
        const unreadCount = currentParticipant
          ? (lastMessage &&
              lastMessage.senderId !== ctx.userId &&
              (!currentParticipant.lastReadAt ||
                lastMessage.createdAt > currentParticipant.lastReadAt)
              ? 1
              : 0)
          : 0

        return {
          id: conv.id,
          matchId: conv.matchId,
          createdAt: conv.createdAt,
          otherParticipant: otherParticipant
            ? {
                userId: otherParticipant.userId,
                displayName: otherParticipant.user.profile?.displayName ?? null,
                photoUrl: otherParticipant.user.profile?.photos[0]?.url ?? null,
              }
            : null,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                type: lastMessage.type,
                createdAt: lastMessage.createdAt,
                senderId: lastMessage.senderId,
              }
            : null,
          unreadCount,
        }
      })
    }),

  getMessages: protectedProcedure
    .input(getMessagesSchema)
    .query(async ({ ctx, input }) => {
      const participant = await ctx.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId: ctx.userId,
          },
        },
      })

      if (!participant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not a participant in this conversation',
        })
      }

      const whereConditions: Record<string, unknown> = {
        conversationId: input.conversationId,
      }

      if (input.cursor) {
        whereConditions.id = { gt: input.cursor }
      }

      const messages = await ctx.prisma.message.findMany({
        where: whereConditions,
        select: {
          id: true,
          content: true,
          type: true,
          status: true,
          mediaUrl: true,
          isFiltered: true,
          deletedAt: true,
          createdAt: true,
          senderId: true,
          sender: {
            select: {
              id: true,
              profile: {
                select: {
                  displayName: true,
                  photos: {
                    where: { isPublic: true },
                    orderBy: { position: 'asc' },
                    take: 1,
                    select: {
                      url: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        take: input.limit + 1,
      })

      let nextCursor: string | null = null
      let messagesToReturn = messages

      if (messages.length > input.limit) {
        messagesToReturn = messages.slice(0, input.limit)
        nextCursor = messagesToReturn[messagesToReturn.length - 1].id
      }

      return {
        messages: messagesToReturn.map((msg) => ({
          id: msg.id,
          content: msg.content,
          type: msg.type,
          status: msg.status,
          mediaUrl: msg.mediaUrl,
          isFiltered: msg.isFiltered,
          deletedAt: msg.deletedAt,
          createdAt: msg.createdAt,
          sender: {
            id: msg.senderId,
            displayName: msg.sender.profile?.displayName ?? null,
            photoUrl: msg.sender.profile?.photos[0]?.url ?? null,
          },
        })),
        nextCursor,
      }
    }),

  revealFilteredMedia: protectedProcedure
    .input(revealFilteredMediaSchema)
    .mutation(async ({ ctx, input }) => {
      // Get the message
      const message = await ctx.prisma.message.findUnique({
        where: { id: input.messageId },
      })

      if (!message) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Message not found',
        })
      }

      // Verify caller is a participant in the conversation
      const participant = await ctx.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: message.conversationId,
            userId: ctx.userId,
          },
        },
      })

      if (!participant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not a participant in this conversation',
        })
      }

      // Verify caller is NOT the sender (only recipient can reveal)
      if (message.senderId === ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Sender cannot reveal their own filtered media',
        })
      }

      // Update message to reveal (set isFiltered = false)
      const revealed = await ctx.prisma.message.update({
        where: { id: input.messageId },
        data: { isFiltered: false },
      })

      return {
        messageId: revealed.id,
        isFiltered: revealed.isFiltered,
      }
    }),

  updateMessageStatus: protectedProcedure
    .input(updateMessageStatusSchema)
    .mutation(async ({ ctx, input }) => {
      // Get the message
      const message = await ctx.prisma.message.findUnique({
        where: { id: input.messageId },
      })

      if (!message) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Message not found',
        })
      }

      // Verify caller is a participant in the conversation
      const participant = await ctx.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: message.conversationId,
            userId: ctx.userId,
          },
        },
      })

      if (!participant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not a participant in this conversation',
        })
      }

      // Update message status
      const updated = await ctx.prisma.message.update({
        where: { id: input.messageId },
        data: { status: input.status },
        select: {
          id: true,
          status: true,
        },
      })

      return {
        messageId: updated.id,
        status: updated.status,
      }
    }),

  markRead: protectedProcedure
    .input(z.object({
      conversationId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is a participant in the conversation
      const participant = await ctx.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId: ctx.userId,
          },
        },
      })

      if (!participant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not a participant in this conversation',
        })
      }

      const now = new Date()

      // Only update if read receipts are enabled
      if (participant.readReceipts) {
        // Update participant's lastReadAt
        await ctx.prisma.conversationParticipant.update({
          where: {
            conversationId_userId: {
              conversationId: input.conversationId,
              userId: ctx.userId,
            },
          },
          data: {
            lastReadAt: now,
          },
        })

        // Mark all unread messages from other users as READ
        await ctx.prisma.message.updateMany({
          where: {
            conversationId: input.conversationId,
            senderId: {
              not: ctx.userId,
            },
            status: {
              not: 'READ',
            },
          },
          data: {
            status: 'READ',
          },
        })
      }

      return {
        success: true,
        lastReadAt: now,
      }
    }),

  toggleReadReceipts: protectedProcedure
    .input(z.object({
      conversationId: z.string().uuid(),
      enabled: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is a participant in the conversation
      const participant = await ctx.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId: ctx.userId,
          },
        },
      })

      if (!participant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not a participant in this conversation',
        })
      }

      // Update read receipts setting
      const updated = await ctx.prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId: ctx.userId,
          },
        },
        data: {
          readReceipts: input.enabled,
        },
      })

      return {
        success: true,
        readReceipts: updated.readReceipts,
      }
    }),

  deleteMessage: protectedProcedure
    .input(z.object({
      messageId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.message.findUnique({
        where: { id: input.messageId },
      })

      if (!message) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Message not found',
        })
      }

      if (message.senderId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete this message',
        })
      }

      await ctx.prisma.message.update({
        where: { id: input.messageId },
        data: { deletedAt: new Date() },
      })

      return { success: true }
    }),
})
