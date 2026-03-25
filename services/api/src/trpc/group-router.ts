import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'

async function assertGroupModerator(prisma: any, groupId: string, userId: string, requireOwner = false) {
  const moderator = await prisma.groupModerator.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })
  if (!moderator) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a moderator of this group' })
  }
  if (requireOwner && moderator.role !== 'OWNER') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the group owner can do this' })
  }
  return moderator
}

export const groupRouter = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string().max(100),
      description: z.string().max(2000).optional(),
      category: z.string().max(100),
      visibility: z.enum(['OPEN', 'PRIVATE']).default('OPEN'),
    }))
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.$transaction(async (tx) => {
        const createdGroup = await tx.group.create({
          data: {
            name: input.name,
            description: input.description,
            category: input.category,
            visibility: input.visibility,
            createdById: ctx.userId,
          },
        })

        await tx.groupMember.create({
          data: {
            groupId: createdGroup.id,
            userId: ctx.userId,
            status: 'ACTIVE',
          },
        })

        await tx.groupModerator.create({
          data: {
            groupId: createdGroup.id,
            userId: ctx.userId,
            role: 'OWNER',
          },
        })

        return createdGroup
      })

      const groupWithCount = await ctx.prisma.group.findUnique({
        where: { id: group.id },
        include: {
          _count: {
            select: {
              members: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
      })

      return groupWithCount
    }),

  get: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const group = await ctx.prisma.group.findUnique({
        where: { id: input.groupId },
        include: {
          _count: {
            select: {
              members: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
      })

      if (!group) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found' })
      }

      const membership = await ctx.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.userId,
          },
        },
      })

      const moderator = await ctx.prisma.groupModerator.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.userId,
          },
        },
      })

      return {
        ...group,
        isMember: !!membership,
        membershipStatus: membership?.status ?? null,
        isModerator: !!moderator,
        moderatorRole: moderator?.role ?? null,
      }
    }),

  list: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input

      const groups = await ctx.prisma.group.findMany({
        take: limit + 1,
        ...(cursor ? {
          cursor: { id: cursor },
          skip: 1,
        } : {}),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              members: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
      })

      let nextCursor: string | undefined
      if (groups.length > limit) {
        const nextItem = groups.pop()
        nextCursor = nextItem?.id
      }

      return { groups, nextCursor }
    }),

  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      const groups = await ctx.prisma.group.findMany({
        where: {
          OR: [
            {
              name: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
          ],
        },
        take: 20,
        include: {
          _count: {
            select: {
              members: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
      })

      return groups
    }),

  join: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.group.findUnique({
        where: { id: input.groupId },
      })

      if (!group) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found' })
      }

      const existing = await ctx.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.userId,
          },
        },
      })

      if (existing) {
        if (existing.status === 'ACTIVE') {
          throw new TRPCError({ code: 'CONFLICT', message: 'Already a member' })
        }
        if (existing.status === 'BANNED') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You are banned from this group' })
        }
        if (existing.status === 'PENDING') {
          throw new TRPCError({ code: 'CONFLICT', message: 'Join request already pending' })
        }
      }

      const membership = await ctx.prisma.groupMember.create({
        data: {
          groupId: input.groupId,
          userId: ctx.userId,
          status: group.visibility === 'OPEN' ? 'ACTIVE' : 'PENDING',
        },
      })

      return membership
    }),

  leave: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.userId,
          },
        },
      })

      if (!membership) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Not a member of this group' })
      }

      const moderator = await ctx.prisma.groupModerator.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.userId,
          },
        },
      })

      if (moderator && moderator.role === 'OWNER') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Transfer ownership before leaving' })
      }

      await ctx.prisma.groupMember.delete({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.userId,
          },
        },
      })

      if (moderator) {
        await ctx.prisma.groupModerator.delete({
          where: {
            groupId_userId: {
              groupId: input.groupId,
              userId: ctx.userId,
            },
          },
        })
      }

      return { success: true }
    }),

  approve: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const moderator = await ctx.prisma.groupModerator.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.userId,
          },
        },
      })

      if (!moderator) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a moderator of this group' })
      }

      const membership = await ctx.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      })

      if (!membership) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Membership not found' })
      }

      if (membership.status !== 'PENDING') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Membership is not pending' })
      }

      const updated = await ctx.prisma.groupMember.update({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
        data: { status: 'ACTIVE' },
      })

      return updated
    }),

  reject: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const moderator = await ctx.prisma.groupModerator.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.userId,
          },
        },
      })

      if (!moderator) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a moderator of this group' })
      }

      const membership = await ctx.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      })

      if (!membership) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Membership not found' })
      }

      if (membership.status !== 'PENDING') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Membership is not pending' })
      }

      await ctx.prisma.groupMember.delete({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      })

      return { success: true }
    }),

  members: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      cursor: z.string().optional(),
      limit: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input

      const members = await ctx.prisma.groupMember.findMany({
        where: {
          groupId: input.groupId,
          status: 'ACTIVE',
        },
        take: limit + 1,
        ...(cursor ? {
          cursor: { id: cursor },
          skip: 1,
        } : {}),
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      })

      let nextCursor: string | undefined
      if (members.length > limit) {
        const nextItem = members.pop()
        nextCursor = nextItem?.id
      }

      return { members, nextCursor }
    }),

  ban: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertGroupModerator(ctx.prisma, input.groupId, ctx.userId)

      const targetModerator = await ctx.prisma.groupModerator.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      })

      if (targetModerator) {
        const callerModerator = await ctx.prisma.groupModerator.findUnique({
          where: {
            groupId_userId: {
              groupId: input.groupId,
              userId: ctx.userId,
            },
          },
        })
        if (callerModerator?.role !== 'OWNER') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the owner can ban moderators' })
        }
      }

      const membership = await ctx.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      })

      if (!membership) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Membership not found' })
      }

      if (membership.status === 'BANNED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'User is already banned' })
      }

      const updated = await ctx.prisma.groupMember.update({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
        data: { status: 'BANNED' },
      })

      if (targetModerator) {
        await ctx.prisma.groupModerator.delete({
          where: {
            groupId_userId: {
              groupId: input.groupId,
              userId: input.userId,
            },
          },
        })
      }

      return updated
    }),

  unban: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertGroupModerator(ctx.prisma, input.groupId, ctx.userId)

      const membership = await ctx.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      })

      if (!membership || membership.status !== 'BANNED') {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Banned membership not found' })
      }

      await ctx.prisma.groupMember.delete({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      })

      return { success: true }
    }),

  removePost: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      postId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertGroupModerator(ctx.prisma, input.groupId, ctx.userId)

      const post = await ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
          groupId: input.groupId,
        },
      })

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' })
      }

      await ctx.prisma.post.update({
        where: { id: input.postId },
        data: { groupId: null },
      })

      return { success: true }
    }),

  update: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      name: z.string().max(100).optional(),
      description: z.string().max(2000).optional(),
      category: z.string().max(100).optional(),
      visibility: z.enum(['OPEN', 'PRIVATE']).optional(),
      coverImageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertGroupModerator(ctx.prisma, input.groupId, ctx.userId, true)

      const { groupId, ...updateData } = input

      const updated = await ctx.prisma.group.update({
        where: { id: groupId },
        data: updateData,
      })

      return updated
    }),

  addModerator: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertGroupModerator(ctx.prisma, input.groupId, ctx.userId, true)

      const membership = await ctx.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      })

      if (!membership || membership.status !== 'ACTIVE') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'User is not an active member' })
      }

      const existing = await ctx.prisma.groupModerator.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      })

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'User is already a moderator' })
      }

      const moderator = await ctx.prisma.groupModerator.create({
        data: {
          groupId: input.groupId,
          userId: input.userId,
          role: 'MODERATOR',
        },
      })

      return moderator
    }),

  removeModerator: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertGroupModerator(ctx.prisma, input.groupId, ctx.userId, true)

      if (input.userId === ctx.userId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot remove yourself as owner' })
      }

      const moderator = await ctx.prisma.groupModerator.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      })

      if (!moderator) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Moderator not found' })
      }

      await ctx.prisma.groupModerator.delete({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      })

      return { success: true }
    }),

  pendingMembers: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      await assertGroupModerator(ctx.prisma, input.groupId, ctx.userId)

      const members = await ctx.prisma.groupMember.findMany({
        where: {
          groupId: input.groupId,
          status: 'PENDING',
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      })

      return members
    }),
})
