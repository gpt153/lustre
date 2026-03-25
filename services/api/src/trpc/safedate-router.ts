import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import bcrypt from 'bcryptjs'
import { router, protectedProcedure, publicProcedure } from './middleware.js'
import { encrypt, decrypt } from '../auth/crypto.js'

export const safedateRouter = router({
  activate: protectedProcedure
    .input(
      z.object({
        targetDescription: z.string().min(1).max(500),
        durationMinutes: z.number().int().min(10).max(480),
        safetyContacts: z
          .array(
            z.object({
              name: z.string().min(1),
              phone: z.string().min(5),
            }),
          )
          .min(1)
          .max(5),
        pin: z.string().regex(/^\d{4,8}$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.safetyContacts.length < 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'At least 1 safety contact required',
        })
      }

      const activeCount = await ctx.prisma.safeDate.count({
        where: { userId: ctx.userId, status: { in: ['ACTIVE', 'CHECKED_IN'] } },
      })
      if (activeCount >= 3) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Maximum 3 active SafeDates allowed' })
      }

      const pinHash = await bcrypt.hash(input.pin, 10)
      const shareToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + input.durationMinutes * 60 * 1000)

      const safeDate = await ctx.prisma.$transaction(async (tx) => {
        return tx.safeDate.create({
          data: {
            userId: ctx.userId,
            targetDescription: input.targetDescription,
            durationMinutes: input.durationMinutes,
            pinHash,
            shareToken,
            expiresAt,
            status: 'ACTIVE',
            safetyContacts: {
              create: input.safetyContacts.map((contact) => ({
                name: contact.name,
                phone: contact.phone,
              })),
            },
          },
          include: { safetyContacts: true },
        })
      })

      return {
        id: safeDate.id,
        expiresAt: safeDate.expiresAt,
        shareToken: safeDate.shareToken,
      }
    }),

  checkin: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        pin: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const safeDate = await ctx.prisma.safeDate.findFirst({
        where: { id: input.id, userId: ctx.userId },
      })

      if (!safeDate) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'SafeDate not found' })
      }

      const pinValid = await bcrypt.compare(input.pin, safeDate.pinHash)
      if (!pinValid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid PIN' })
      }

      const expiresAt = new Date(Date.now() + safeDate.durationMinutes * 60 * 1000)

      await ctx.prisma.safeDate.update({
        where: { id: safeDate.id },
        data: {
          status: 'CHECKED_IN',
          checkedInAt: new Date(),
          expiresAt,
        },
      })

      return { expiresAt }
    }),

  extend: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        additionalMinutes: z.number().int().min(5).max(120),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const safeDate = await ctx.prisma.safeDate.findFirst({
        where: { id: input.id, userId: ctx.userId },
      })

      if (!safeDate) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'SafeDate not found' })
      }

      if (!['ACTIVE', 'CHECKED_IN'].includes(safeDate.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'SafeDate cannot be extended in its current status',
        })
      }

      const expiresAt = new Date(
        safeDate.expiresAt.getTime() + input.additionalMinutes * 60 * 1000,
      )

      await ctx.prisma.safeDate.update({
        where: { id: safeDate.id },
        data: { expiresAt },
      })

      return { expiresAt }
    }),

  end: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const safeDate = await ctx.prisma.safeDate.findFirst({
        where: { id: input.id, userId: ctx.userId },
      })

      if (!safeDate) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'SafeDate not found' })
      }

      await ctx.prisma.safeDate.update({
        where: { id: safeDate.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          deletionScheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      return { success: true }
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const safeDate = await ctx.prisma.safeDate.findFirst({
        where: { id: input.id, userId: ctx.userId },
        include: { safetyContacts: true },
      })

      if (!safeDate) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'SafeDate not found' })
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { pinHash: _pinHash, ...safeDateWithoutPin } = safeDate
      return safeDateWithoutPin
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const safeDates = await ctx.prisma.safeDate.findMany({
      where: { userId: ctx.userId },
      include: { safetyContacts: true },
      orderBy: { createdAt: 'desc' },
    })

    return safeDates.map(({ pinHash: _pinHash, ...rest }) => rest)
  }),

  logGPS: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        accuracy: z.number().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const safeDate = await ctx.prisma.safeDate.findFirst({
        where: { id: input.id, userId: ctx.userId },
      })

      if (!safeDate) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'SafeDate not found' })
      }

      const lastLog = await ctx.prisma.gPSLog.findFirst({
        where: { safeDateId: input.id },
        orderBy: { recordedAt: 'desc' },
      })

      if (lastLog && lastLog.recordedAt.getTime() > Date.now() - 5000) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'GPS log rate limit: max 1 log per 3 seconds',
        })
      }

      const { encrypted: latEncrypted, iv: ivLat } = encrypt(String(input.lat))
      const { encrypted: lngEncrypted, iv: ivLng } = encrypt(String(input.lng))
      const iv = `${ivLat}:${ivLng}`

      await ctx.prisma.gPSLog.create({
        data: {
          safeDateId: input.id,
          latEncrypted,
          lngEncrypted,
          accuracy: input.accuracy ?? null,
          iv,
          recordedAt: new Date(),
        },
      })

      return { success: true }
    }),

  getLiveLocation: publicProcedure
    .input(z.object({ shareToken: z.string() }))
    .query(async ({ ctx, input }) => {
      const safeDate = await ctx.prisma.safeDate.findFirst({
        where: { shareToken: input.shareToken },
      })

      if (!safeDate) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid share token' })
      }

      if (safeDate.status === 'COMPLETED') {
        return {
          status: safeDate.status,
          expiresAt: safeDate.expiresAt,
          escalatedAt: safeDate.escalatedAt,
          gpsPoints: [],
        }
      }

      const logs = await ctx.prisma.gPSLog.findMany({
        where: { safeDateId: safeDate.id },
        orderBy: { recordedAt: 'desc' },
        take: 50,
      })

      const gpsPoints = logs.map((log) => {
        const [ivLat, ivLng] = log.iv.split(':')
        const lat = parseFloat(decrypt(log.latEncrypted, ivLat))
        const lng = parseFloat(decrypt(log.lngEncrypted, ivLng))
        return { lat, lng, accuracy: log.accuracy, recordedAt: log.recordedAt }
      })

      return {
        status: safeDate.status,
        expiresAt: safeDate.expiresAt,
        escalatedAt: safeDate.escalatedAt,
        gpsPoints,
      }
    }),
})
