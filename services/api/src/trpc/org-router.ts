import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'

async function assertOrgAdmin(prisma: any, orgId: string, userId: string) {
  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  })
  if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not an org admin' })
  }
  return member
}

async function assertOrgOwner(prisma: any, orgId: string, userId: string) {
  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  })
  if (!member || member.role !== 'OWNER') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only org owner can do this' })
  }
  return member
}

export const orgRouter = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string().max(200),
      description: z.string().max(4000).optional(),
      type: z.enum(['CLUB', 'ASSOCIATION', 'BUSINESS', 'EVENT_COMPANY']),
      locationName: z.string().max(500).optional(),
      contactEmail: z.string().optional(),
      contactPhone: z.string().optional(),
      websiteUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.prisma.$transaction(async (tx) => {
        const createdOrg = await tx.organization.create({
          data: {
            name: input.name,
            description: input.description,
            type: input.type,
            locationName: input.locationName,
            contactEmail: input.contactEmail,
            contactPhone: input.contactPhone,
            websiteUrl: input.websiteUrl,
            createdById: ctx.userId,
          },
        })

        await tx.orgMember.create({
          data: {
            orgId: createdOrg.id,
            userId: ctx.userId,
            role: 'OWNER',
          },
        })

        return createdOrg
      })

      const orgWithCount = await ctx.prisma.organization.findUnique({
        where: { id: org.id },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      })

      return orgWithCount
    }),

  get: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const org = await ctx.prisma.organization.findUnique({
        where: { id: input.orgId },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      })

      if (!org) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' })
      }

      const membership = await ctx.prisma.orgMember.findUnique({
        where: {
          orgId_userId: {
            orgId: input.orgId,
            userId: ctx.userId,
          },
        },
      })

      return {
        ...org,
        isMember: !!membership,
        memberRole: membership?.role ?? null,
      }
    }),

  list: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input

      const orgs = await ctx.prisma.organization.findMany({
        take: limit + 1,
        ...(cursor ? {
          cursor: { id: cursor },
          skip: 1,
        } : {}),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      })

      let nextCursor: string | undefined
      if (orgs.length > limit) {
        const nextItem = orgs.pop()
        nextCursor = nextItem?.id
      }

      return { orgs, nextCursor }
    }),

  update: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      name: z.string().max(200).optional(),
      description: z.string().max(4000).optional(),
      locationName: z.string().max(500).optional(),
      contactEmail: z.string().optional(),
      contactPhone: z.string().optional(),
      websiteUrl: z.string().optional(),
      coverImageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertOrgAdmin(ctx.prisma, input.orgId, ctx.userId)

      const { orgId, ...updateData } = input

      const updated = await ctx.prisma.organization.update({
        where: { id: orgId },
        data: updateData,
      })

      return updated
    }),

  join: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.prisma.organization.findUnique({
        where: { id: input.orgId },
      })

      if (!org) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' })
      }

      const existing = await ctx.prisma.orgMember.findUnique({
        where: {
          orgId_userId: {
            orgId: input.orgId,
            userId: ctx.userId,
          },
        },
      })

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Already a member' })
      }

      const membership = await ctx.prisma.orgMember.create({
        data: {
          orgId: input.orgId,
          userId: ctx.userId,
          role: 'MEMBER',
        },
      })

      return membership
    }),

  leave: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.prisma.orgMember.findUnique({
        where: {
          orgId_userId: {
            orgId: input.orgId,
            userId: ctx.userId,
          },
        },
      })

      if (!membership) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Not a member of this organization' })
      }

      if (membership.role === 'OWNER') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot leave as owner' })
      }

      await ctx.prisma.orgMember.delete({
        where: {
          orgId_userId: {
            orgId: input.orgId,
            userId: ctx.userId,
          },
        },
      })

      return { success: true }
    }),

  getMembers: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      cursor: z.string().optional(),
      limit: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input

      const members = await ctx.prisma.orgMember.findMany({
        where: {
          orgId: input.orgId,
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

  addMember: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertOrgAdmin(ctx.prisma, input.orgId, ctx.userId)

      const existing = await ctx.prisma.orgMember.findUnique({
        where: {
          orgId_userId: {
            orgId: input.orgId,
            userId: input.userId,
          },
        },
      })

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'User is already a member' })
      }

      const member = await ctx.prisma.orgMember.create({
        data: {
          orgId: input.orgId,
          userId: input.userId,
          role: 'MEMBER',
        },
      })

      return member
    }),

  removeMember: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertOrgAdmin(ctx.prisma, input.orgId, ctx.userId)

      const member = await ctx.prisma.orgMember.findUnique({
        where: {
          orgId_userId: {
            orgId: input.orgId,
            userId: input.userId,
          },
        },
      })

      if (!member) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' })
      }

      if (member.role === 'OWNER') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot remove owner' })
      }

      await ctx.prisma.orgMember.delete({
        where: {
          orgId_userId: {
            orgId: input.orgId,
            userId: input.userId,
          },
        },
      })

      return { success: true }
    }),

  requestVerification: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await assertOrgOwner(ctx.prisma, input.orgId, ctx.userId)

      const existing = await ctx.prisma.orgVerification.findUnique({
        where: { orgId: input.orgId },
      })

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Verification request already exists' })
      }

      const verification = await ctx.prisma.orgVerification.create({
        data: {
          orgId: input.orgId,
          status: 'PENDING',
        },
      })

      return verification
    }),
})
