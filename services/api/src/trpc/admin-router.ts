import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, adminProcedure } from './middleware.js'
import { Prisma } from '@prisma/client'

export const adminRouter = router({
  searchUsers: adminProcedure
    .input(z.object({
      query: z.string(),
      cursor: z.string().uuid().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const searchQuery = `%${input.query}%`
      const query = input.cursor
        ? Prisma.sql`
            SELECT u.id, u.is_banned, u.banned_until, u.warning_count, u.created_at, u.email, p.display_name
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.id > ${input.cursor}::uuid
            AND (p.display_name ILIKE ${searchQuery} OR u.email ILIKE ${searchQuery})
            ORDER BY u.id ASC
            LIMIT ${input.limit + 1}
          `
        : Prisma.sql`
            SELECT u.id, u.is_banned, u.banned_until, u.warning_count, u.created_at, u.email, p.display_name
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE p.display_name ILIKE ${searchQuery} OR u.email ILIKE ${searchQuery}
            ORDER BY u.id ASC
            LIMIT ${input.limit + 1}
          `

      const results = await ctx.prisma.$queryRaw<Array<{
        id: string
        email: string | null
        display_name: string | null
        is_banned: boolean
        banned_until: Date | null
        warning_count: number
        created_at: Date
      }>>(query)

      let nextCursor: string | undefined
      const users = results.slice(0, input.limit).map((row) => ({
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        isBanned: row.is_banned,
        bannedUntil: row.banned_until,
        warningCount: row.warning_count,
        createdAt: row.created_at,
      }))

      if (results.length > input.limit) {
        nextCursor = results[input.limit]!.id
      }

      return { users, nextCursor }
    }),

  getUser: adminProcedure
    .input(z.object({
      userId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.prisma.$queryRaw<Array<{
        id: string
        email: string | null
        status: string
        is_banned: boolean
        banned_until: Date | null
        warning_count: number
        filtered_sent_count: number
        created_at: Date
        display_name: string | null
        gender: string | null
      }>>(Prisma.sql`
        SELECT u.id, u.email, u.status::text, u.is_banned, u.banned_until,
               u.warning_count, u.filtered_sent_count, u.created_at,
               p.display_name, p.gender::text
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.id = ${input.userId}::uuid
      `)

      if (!rows[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }

      const row = rows[0]
      const moderationActions = await ctx.prisma.$queryRaw<Array<{
        id: string
        action_type: string
        reason: string | null
        created_at: Date
        expires_at: Date | null
      }>>(Prisma.sql`
        SELECT id, action_type::text, reason, created_at, expires_at
        FROM moderation_actions
        WHERE user_id = ${input.userId}::uuid
        ORDER BY created_at DESC
        LIMIT 10
      `)

      return {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        status: row.status,
        isBanned: row.is_banned,
        bannedUntil: row.banned_until,
        warningCount: row.warning_count,
        filteredSentCount: row.filtered_sent_count,
        createdAt: row.created_at,
        gender: row.gender,
        moderationActions,
      }
    }),

  suspendUser: adminProcedure
    .input(z.object({
      userId: z.string().uuid(),
      durationDays: z.number().min(1).max(365),
      reason: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const bannedUntil = new Date(Date.now() + input.durationDays * 24 * 60 * 60 * 1000)

      await ctx.prisma.$transaction([
        ctx.prisma.$executeRaw`UPDATE users SET is_banned = true, banned_until = ${bannedUntil} WHERE id = ${input.userId}::uuid`,
        ctx.prisma.$executeRaw`INSERT INTO moderation_actions (id, user_id, admin_id, action_type, reason, expires_at, created_at) VALUES (gen_random_uuid(), ${input.userId}::uuid, ${ctx.userId}::uuid, 'TEMP_BAN', ${input.reason ?? null}, ${bannedUntil}, NOW())`,
      ])

      return { success: true }
    }),

  banUser: adminProcedure
    .input(z.object({
      userId: z.string().uuid(),
      reason: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction([
        ctx.prisma.$executeRaw`UPDATE users SET is_banned = true, banned_until = NULL WHERE id = ${input.userId}::uuid`,
        ctx.prisma.$executeRaw`INSERT INTO moderation_actions (id, user_id, admin_id, action_type, reason, created_at) VALUES (gen_random_uuid(), ${input.userId}::uuid, ${ctx.userId}::uuid, 'PERMANENT_BAN', ${input.reason ?? null}, NOW())`,
      ])

      return { success: true }
    }),

  getReports: adminProcedure
    .input(z.object({
      status: z.enum(['PENDING', 'REVIEWED', 'DISMISSED']).optional(),
      cursor: z.string().uuid().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const statusFilter = input.status
        ? Prisma.sql`AND r.status::text = ${input.status}`
        : Prisma.sql``
      const cursorFilter = input.cursor
        ? Prisma.sql`AND r.id > ${input.cursor}::uuid`
        : Prisma.sql``
      const reports = await ctx.prisma.$queryRaw<Array<{
        id: string
        reporter_id: string
        target_id: string
        target_type: string
        category: string
        description: string | null
        status: string
        reviewed_by: string | null
        reviewed_at: Date | null
        created_at: Date
      }>>(Prisma.sql`
        SELECT r.id, r.reporter_id, r.target_id, r.target_type::text, r.category::text,
               r.description, r.status::text, r.reviewed_by, r.reviewed_at, r.created_at
        FROM reports r
        WHERE 1=1 ${statusFilter} ${cursorFilter}
        ORDER BY r.created_at DESC
        LIMIT ${input.limit + 1}
      `)

      let nextCursor: string | undefined
      if (reports.length > input.limit) {
        nextCursor = reports[input.limit]!.id
      }

      return { reports: reports.slice(0, input.limit), nextCursor }
    }),

  resolveReport: adminProcedure
    .input(z.object({
      reportId: z.string().uuid(),
      status: z.enum(['REVIEWED', 'DISMISSED']),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$executeRaw`
        UPDATE reports
        SET status = ${input.status}::text::"ReportStatus",
            reviewed_by = ${ctx.userId}::uuid,
            reviewed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${input.reportId}::uuid
      `
      return { success: true }
    }),

  getOverview: adminProcedure
    .query(async ({ ctx }) => {
      const dauResult = await ctx.prisma.$queryRaw<Array<{ count: bigint }>>(
        Prisma.sql`
          SELECT COUNT(DISTINCT user_id) as count
          FROM sessions
          WHERE created_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC')
        `
      )

      const mauResult = await ctx.prisma.$queryRaw<Array<{ count: bigint }>>(
        Prisma.sql`
          SELECT COUNT(DISTINCT user_id) as count
          FROM sessions
          WHERE created_at >= NOW() - INTERVAL '30 days'
        `
      )

      const totalUsersResult = await ctx.prisma.$queryRaw<Array<{ count: bigint }>>(
        Prisma.sql`
          SELECT COUNT(*) as count
          FROM users
          WHERE status = 'ACTIVE'
        `
      )

      const pendingReportsResult = await ctx.prisma.$queryRaw<Array<{ count: bigint }>>(
        Prisma.sql`
          SELECT COUNT(*) as count
          FROM reports
          WHERE status = 'PENDING'
        `
      )

      return {
        dau: Number(dauResult[0]?.count ?? 0),
        mau: Number(mauResult[0]?.count ?? 0),
        totalUsers: Number(totalUsersResult[0]?.count ?? 0),
        pendingReports: Number(pendingReportsResult[0]?.count ?? 0),
      }
    }),

  getRegistrations: adminProcedure
    .input(z.object({
      days: z.union([z.literal(7), z.literal(30), z.literal(90)]).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const daysInterval = (() => {
        if (input.days === 7) return Prisma.sql`INTERVAL '7 days'`
        if (input.days === 30) return Prisma.sql`INTERVAL '30 days'`
        return Prisma.sql`INTERVAL '90 days'`
      })()

      const query = Prisma.sql`
        SELECT DATE_TRUNC('day', created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at >= NOW() - ${daysInterval}
        GROUP BY 1
        ORDER BY 1 ASC
      `

      const results = await ctx.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>(query)

      return results.map((row) => ({
        date: row.date.toISOString().split('T')[0],
        count: Number(row.count),
      }))
    }),

  getGenderRatio: adminProcedure
    .query(async ({ ctx }) => {
      const results = await ctx.prisma.$queryRaw<Array<{ gender: string; count: bigint }>>(
        Prisma.sql`
          SELECT gender::text, COUNT(*) as count
          FROM profiles
          WHERE gender IS NOT NULL
          GROUP BY gender
          ORDER BY count DESC
        `
      )

      return results.map((row) => ({
        gender: row.gender,
        count: Number(row.count),
      }))
    }),

  getRevenue: adminProcedure
    .input(z.object({
      days: z.union([z.literal(7), z.literal(30), z.literal(90)]).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const daysInterval = (() => {
        if (input.days === 7) return Prisma.sql`INTERVAL '7 days'`
        if (input.days === 30) return Prisma.sql`INTERVAL '30 days'`
        return Prisma.sql`INTERVAL '90 days'`
      })()

      const totalResult = await ctx.prisma.$queryRaw<Array<{ total: string | number }>>(
        Prisma.sql`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM payments
          WHERE status = 'PAID' AND completed_at >= NOW() - ${daysInterval}
        `
      )

      const byDayQuery = Prisma.sql`
        SELECT DATE_TRUNC('day', completed_at) as date, SUM(amount) as amount_sek
        FROM payments
        WHERE status = 'PAID' AND completed_at >= NOW() - ${daysInterval}
        GROUP BY 1
        ORDER BY 1 ASC
      `

      const byDayResults = await ctx.prisma.$queryRaw<Array<{ date: Date; amount_sek: string | number }>>(byDayQuery)

      return {
        totalSek: Number(totalResult[0]?.total ?? 0),
        byDay: byDayResults.map((row) => ({
          date: row.date.toISOString().split('T')[0],
          amountSek: Number(row.amount_sek),
        })),
      }
    }),

  getAiCosts: adminProcedure
    .input(z.object({
      days: z.union([z.literal(7), z.literal(30), z.literal(90)]).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const daysInterval = (() => {
        if (input.days === 7) return Prisma.sql`INTERVAL '7 days'`
        if (input.days === 30) return Prisma.sql`INTERVAL '30 days'`
        return Prisma.sql`INTERVAL '90 days'`
      })()

      const totalResult = await ctx.prisma.$queryRaw<Array<{ total: string | number }>>(
        Prisma.sql`
          SELECT COALESCE(SUM(ABS(amount)), 0) as total
          FROM token_transactions
          WHERE type IN ('GATEKEEPER', 'COACH_SESSION') AND amount < 0 AND created_at >= NOW() - ${daysInterval}
        `
      )

      const byTypeResults = await ctx.prisma.$queryRaw<Array<{ type: string; tokens: string | number }>>(
        Prisma.sql`
          SELECT type::text, COALESCE(SUM(ABS(amount)), 0) as tokens
          FROM token_transactions
          WHERE type IN ('GATEKEEPER', 'COACH_SESSION') AND amount < 0 AND created_at >= NOW() - ${daysInterval}
          GROUP BY type
        `
      )

      return {
        totalTokens: Number(totalResult[0]?.total ?? 0),
        byType: byTypeResults.map((row) => ({
          type: row.type,
          tokens: Number(row.tokens),
        })),
      }
    }),
})
