import crypto from 'node:crypto'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { generateUploadPresignedUrl, submitMediaConvertJob, generateDrmLicenseToken, generateStreamingUrl } from '../lib/drm.js'
import { embedWatermark } from '../lib/watermark.js'

function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000 // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const consentRouter = router({
  initiate: protectedProcedure
    .input(
      z.object({
        participantId: z.string().uuid(),
        gpsLat: z.number(),
        gpsLng: z.number(),
        bluetoothProof: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      const result = await ctx.prisma.$transaction(async (tx) => {
        // Create ConsentRecord
        const consentRecord = await tx.consentRecord.create({
          data: {
            initiatorId: ctx.userId,
            participantId: input.participantId,
            status: 'PENDING',
            gpsLat: input.gpsLat,
            gpsLng: input.gpsLng,
            bluetoothProof: input.bluetoothProof ?? null,
            timestamp: now,
            expiresAt,
          },
        })

        // Create Recording with status=PROCESSING
        const recording = await tx.recording.create({
          data: {
            consentRecordId: consentRecord.id,
            status: 'PROCESSING',
          },
        })

        // Create RecordingAccess for initiator
        await tx.recordingAccess.create({
          data: {
            recordingId: recording.id,
            userId: ctx.userId,
            isActive: true,
          },
        })

        // Create RecordingAccess for participant
        await tx.recordingAccess.create({
          data: {
            recordingId: recording.id,
            userId: input.participantId,
            isActive: true,
          },
        })

        return { consentRecordId: consentRecord.id, expiresAt }
      })

      return result
    }),

  confirm: protectedProcedure
    .input(
      z.object({
        consentRecordId: z.string().uuid(),
        gpsLat: z.number(),
        gpsLng: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find ConsentRecord where participantId=ctx.userId AND id=consentRecordId
      const consentRecord = await ctx.prisma.consentRecord.findFirst({
        where: {
          id: input.consentRecordId,
          participantId: ctx.userId,
        },
      })

      if (!consentRecord) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Consent record not found',
        })
      }

      // Check if already CONFIRMED or REVOKED
      if (consentRecord.status === 'CONFIRMED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Consent already confirmed',
        })
      }

      if (consentRecord.status === 'REVOKED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Consent has been revoked',
        })
      }

      // GPS proximity check using Haversine formula
      if (
        consentRecord.gpsLat !== null &&
        consentRecord.gpsLng !== null &&
        consentRecord.gpsLat !== undefined &&
        consentRecord.gpsLng !== undefined
      ) {
        const distance = haversineDistanceMeters(
          consentRecord.gpsLat,
          consentRecord.gpsLng,
          input.gpsLat,
          input.gpsLng,
        )

        if (distance > 100) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Parties must be within 100 meters',
          })
        }
      }

      // Update ConsentRecord status=CONFIRMED
      await ctx.prisma.consentRecord.update({
        where: { id: input.consentRecordId },
        data: { status: 'CONFIRMED' },
      })

      return {
        consentRecordId: input.consentRecordId,
        status: 'CONFIRMED' as const,
      }
    }),

  getRecordings: protectedProcedure.query(async ({ ctx }) => {
    // Find all RecordingAccess where userId=ctx.userId AND isActive=true
    const accesses = await ctx.prisma.recordingAccess.findMany({
      where: {
        userId: ctx.userId,
        isActive: true,
      },
      include: {
        recording: {
          include: {
            consentRecord: true,
          },
        },
      },
    })

    return accesses.map((access) => ({
      id: access.recording.id,
      status: access.recording.status,
      createdAt: access.recording.createdAt,
      deletedAt: access.recording.deletedAt,
      drmUrl: access.recording.status === 'READY' ? access.recording.drmUrl : null,
      consentRecord: {
        status: access.recording.consentRecord.status,
      },
    }))
  }),

  revoke: protectedProcedure
    .input(
      z.object({
        recordingId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find RecordingAccess where recordingId=input.recordingId AND userId=ctx.userId AND isActive=true
      const access = await ctx.prisma.recordingAccess.findFirst({
        where: {
          recordingId: input.recordingId,
          userId: ctx.userId,
          isActive: true,
        },
      })

      if (!access) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recording access not found',
        })
      }

      await ctx.prisma.$transaction(async (tx) => {
        // Update RecordingAccess: isActive=false, revokedAt=now()
        await tx.recordingAccess.update({
          where: { id: access.id },
          data: {
            isActive: false,
            revokedAt: new Date(),
          },
        })

        // Create RecordingRevocation
        await tx.recordingRevocation.create({
          data: {
            recordingId: input.recordingId,
            revokedByUserId: ctx.userId,
          },
        })

        // Check if ALL RecordingAccesses for this recording are now inactive
        const activeAccessCount = await tx.recordingAccess.count({
          where: {
            recordingId: input.recordingId,
            isActive: true,
          },
        })

        // If all are inactive, update Recording: status=DELETED, deletedAt=now(), drmUrl=null
        if (activeAccessCount === 0) {
          await tx.recording.update({
            where: { id: input.recordingId },
            data: {
              status: 'DELETED',
              deletedAt: new Date(),
              drmUrl: null,
            },
          })
        }
      })

      return { success: true }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        recordingId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find Recording by id, include consentRecord
      const recording = await ctx.prisma.recording.findUnique({
        where: { id: input.recordingId },
        include: { consentRecord: true },
      })

      if (!recording) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recording not found',
        })
      }

      // Validate ctx.userId is initiatorId or participantId on consentRecord
      const isAuthorized =
        ctx.userId === recording.consentRecord.initiatorId ||
        ctx.userId === recording.consentRecord.participantId

      if (!isAuthorized) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recording not found',
        })
      }

      // Update Recording: status=DELETED, deletedAt=now(), drmUrl=null, s3Key=null
      await ctx.prisma.recording.update({
        where: { id: input.recordingId },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
          drmUrl: null,
          s3Key: null,
        },
      })

      return { success: true }
    }),

  getUploadUrl: protectedProcedure
    .input(z.object({ consentRecordId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const consentRecord = await ctx.prisma.consentRecord.findFirst({
        where: {
          id: input.consentRecordId,
          OR: [{ initiatorId: ctx.userId }, { participantId: ctx.userId }],
        },
        include: { recording: true },
      })

      if (!consentRecord) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Consent record not found',
        })
      }

      if (consentRecord.status !== 'CONFIRMED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Consent must be confirmed before recording',
        })
      }

      if (consentRecord.recording && consentRecord.recording.status !== 'PROCESSING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Recording already exists',
        })
      }

      const recording =
        consentRecord.recording ??
        (await ctx.prisma.recording.create({ data: { consentRecordId: consentRecord.id } }))

      const result = await generateUploadPresignedUrl(recording.id)

      await ctx.prisma.recording.update({
        where: { id: recording.id },
        data: { s3Key: result.s3Key },
      })

      return {
        recordingId: recording.id,
        uploadUrl: result.uploadUrl,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      }
    }),

  confirmUpload: protectedProcedure
    .input(z.object({ recordingId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const recording = await ctx.prisma.recording.findUnique({
        where: { id: input.recordingId },
        include: { consentRecord: true },
      })

      if (
        !recording ||
        (ctx.userId !== recording.consentRecord.initiatorId &&
          ctx.userId !== recording.consentRecord.participantId)
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recording not found',
        })
      }

      if (recording.s3Key === null) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Upload not started',
        })
      }

      const { jobId } = await submitMediaConvertJob(recording.id, recording.s3Key)

      return { jobId, status: 'PROCESSING' as const }
    }),

  getPlaybackToken: protectedProcedure
    .input(z.object({ recordingId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const access = await ctx.prisma.recordingAccess.findFirst({
        where: {
          recordingId: input.recordingId,
          userId: ctx.userId,
          isActive: true,
        },
      })

      if (!access) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Access denied',
        })
      }

      const recording = await ctx.prisma.recording.findUnique({
        where: { id: input.recordingId },
      })

      if (!recording || recording.status !== 'READY') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Recording not yet ready',
        })
      }

      const licenseToken = await generateDrmLicenseToken(ctx.userId, recording.id)
      const streamingUrl = await generateStreamingUrl(recording.id)
      const sessionId = crypto.randomUUID()

      const watermarkResult = await embedWatermark(ctx.userId, recording.id, sessionId)
      const finalUrl = watermarkResult.watermarkedUrl || streamingUrl

      await ctx.prisma.playbackLog.create({
        data: { recordingId: recording.id, userId: ctx.userId, sessionId, watermarkedUrl: finalUrl },
      })

      return { licenseToken, streamingUrl: finalUrl }
    }),

  getStatus: protectedProcedure
    .input(z.object({ recordingId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const access = await ctx.prisma.recordingAccess.findFirst({
        where: {
          recordingId: input.recordingId,
          userId: ctx.userId,
        },
      })

      if (!access) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recording not found',
        })
      }

      const recording = await ctx.prisma.recording.findUnique({
        where: { id: input.recordingId },
      })

      if (!recording) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recording not found',
        })
      }

      return {
        id: recording.id,
        status: recording.status,
        drmUrl: recording.status === 'READY' ? recording.drmUrl : null,
        createdAt: recording.createdAt,
      }
    }),
})
