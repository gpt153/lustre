import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'

const listSchema = z.object({}).strict()

const getMessagesSchema = z.object({
  conversationId: z.string().uuid(),
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(50).default(50),
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
            where: {
              userId: {
                not: ctx.userId,
              },
            },
            select: {
              userId: true,
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
        const otherParticipant = conv.participants[0]
        const lastMessage = conv.messages[0]

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
          unreadCount: 0,
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
})
