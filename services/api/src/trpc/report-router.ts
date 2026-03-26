import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { ReportTargetType, ReportCategory, ReportStatus, ModerationActionType } from '@prisma/client'

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? '').split(',').filter(Boolean)

function assertAdmin(userId: string) {
  if (!ADMIN_USER_IDS.includes(userId)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' })
  }
}

export const reportRouter = router({
  create: protectedProcedure
    .input(z.object({
      targetId: z.string().uuid(),
      targetType: z.nativeEnum(ReportTargetType),
      category: z.nativeEnum(ReportCategory),
      description: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check for duplicate
      const existing = await ctx.prisma.report.findFirst({
        where: { reporterId: ctx.userId, targetId: input.targetId, targetType: input.targetType },
      })
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Already reported' })
      }
      const report = await ctx.prisma.report.create({
        data: {
          reporterId: ctx.userId,
          targetId: input.targetId,
          targetType: input.targetType,
          category: input.category,
          description: input.description,
        },
      })
      return { id: report.id }
    }),

  list: protectedProcedure
    .input(z.object({
      status: z.nativeEnum(ReportStatus).optional(),
      cursor: z.string().uuid().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      assertAdmin(ctx.userId)
      const reports = await ctx.prisma.report.findMany({
        where: input.status ? { status: input.status } : undefined,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true } },
        },
      })
      let nextCursor: string | undefined
      if (reports.length > input.limit) {
        nextCursor = reports.pop()!.id
      }
      return { reports, nextCursor }
    }),

  resolve: protectedProcedure
    .input(z.object({
      reportId: z.string().uuid(),
      status: z.enum(['REVIEWED', 'DISMISSED']),
    }))
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx.userId)
      const report = await ctx.prisma.report.update({
        where: { id: input.reportId },
        data: {
          status: input.status as ReportStatus,
          reviewedBy: ctx.userId,
          reviewedAt: new Date(),
        },
      })
      return report
    }),

  getContext: protectedProcedure
    .input(z.object({ reportId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      assertAdmin(ctx.userId)
      const report = await ctx.prisma.report.findUniqueOrThrow({
        where: { id: input.reportId },
        include: { reporter: { select: { id: true } } },
      })

      let context: Record<string, unknown> = {}

      if (report.targetType === 'MESSAGE') {
        const message = await ctx.prisma.message.findUnique({
          where: { id: report.targetId },
          select: {
            id: true,
            content: true,
            mediaUrl: true,
            isFiltered: true,
            createdAt: true,
            sender: { select: { id: true, profile: { select: { id: true, displayName: true } } } },
          },
        })
        context = { type: 'MESSAGE', data: message }
      } else if (report.targetType === 'POST') {
        const post = await ctx.prisma.post.findUnique({
          where: { id: report.targetId },
          select: {
            id: true,
            text: true,
            createdAt: true,
            media: { select: { id: true, url: true, tags: { select: { dimension: true, value: true, confidence: true } } } },
            author: { select: { id: true, profile: { select: { id: true, displayName: true } } } },
          },
        })
        context = { type: 'POST', data: post }
      } else if (report.targetType === 'PROFILE') {
        const profile = await ctx.prisma.profile.findUnique({
          where: { userId: report.targetId },
          select: {
            id: true,
            displayName: true,
            bio: true,
            photos: { take: 1, select: { url: true } },
          },
        })
        context = { type: 'PROFILE', data: profile }
      }

      return { report, context }
    }),

  takeAction: protectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      actionType: z.nativeEnum(ModerationActionType),
      reason: z.string().max(500).optional(),
      durationDays: z.number().min(1).max(365).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx.userId)

      const action = await ctx.prisma.moderationAction.create({
        data: {
          userId: input.userId,
          adminId: ctx.userId,
          actionType: input.actionType,
          reason: input.reason,
          expiresAt:
            input.actionType === 'TEMP_BAN'
              ? new Date(Date.now() + (input.durationDays ?? 7) * 24 * 60 * 60 * 1000)
              : undefined,
        },
      })

      if (input.actionType === 'WARNING') {
        await ctx.prisma.user.update({
          where: { id: input.userId },
          data: { warningCount: { increment: 1 } },
        })
      } else if (input.actionType === 'TEMP_BAN') {
        await ctx.prisma.user.update({
          where: { id: input.userId },
          data: {
            isBanned: true,
            bannedUntil: new Date(Date.now() + (input.durationDays ?? 7) * 24 * 60 * 60 * 1000),
          },
        })
      } else if (input.actionType === 'PERMANENT_BAN') {
        await ctx.prisma.user.update({
          where: { id: input.userId },
          data: { isBanned: true, bannedUntil: null },
        })
      }

      return { actionId: action.id }
    }),
})
