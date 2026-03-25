import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'

export const callRouter = router({
  initiate: protectedProcedure
    .input(z.object({
      conversationId: z.string().uuid(),
      callType: z.enum(['VOICE', 'VIDEO']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is participant
      const participant = await ctx.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId: ctx.userId,
          },
        },
      })
      if (!participant) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a participant in this conversation' })
      }

      // Check for existing active/ringing call
      const existing = await ctx.prisma.callSession.findFirst({
        where: {
          conversationId: input.conversationId,
          status: { in: ['RINGING', 'ACTIVE'] },
        },
      })
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'A call is already in progress' })
      }

      // Get the other participant
      const otherParticipant = await ctx.prisma.conversationParticipant.findFirst({
        where: {
          conversationId: input.conversationId,
          userId: { not: ctx.userId },
        },
      })
      if (!otherParticipant) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Other participant not found' })
      }

      const roomName = `call-${input.conversationId}`
      const callSession = await ctx.prisma.callSession.create({
        data: {
          conversationId: input.conversationId,
          initiatorId: ctx.userId,
          receiverId: otherParticipant.userId,
          callType: input.callType,
          roomName,
        },
      })

      return {
        callId: callSession.id,
        roomName: callSession.roomName,
        receiverId: callSession.receiverId,
        callType: callSession.callType,
      }
    }),

  accept: protectedProcedure
    .input(z.object({ callId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const call = await ctx.prisma.callSession.findUnique({
        where: { id: input.callId },
      })
      if (!call) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Call not found' })
      }
      if (call.receiverId !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the receiver can accept the call' })
      }
      if (call.status !== 'RINGING') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Call is not in RINGING state' })
      }

      const updated = await ctx.prisma.callSession.update({
        where: { id: input.callId },
        data: { status: 'ACTIVE', startedAt: new Date() },
      })

      return {
        callId: updated.id,
        roomName: updated.roomName,
        callType: updated.callType,
      }
    }),

  reject: protectedProcedure
    .input(z.object({ callId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const call = await ctx.prisma.callSession.findUnique({
        where: { id: input.callId },
      })
      if (!call) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Call not found' })
      }
      if (call.receiverId !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the receiver can reject the call' })
      }
      if (call.status !== 'RINGING') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Call is not in RINGING state' })
      }

      await ctx.prisma.callSession.update({
        where: { id: input.callId },
        data: { status: 'REJECTED', endedAt: new Date() },
      })

      return { success: true }
    }),

  end: protectedProcedure
    .input(z.object({ callId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const call = await ctx.prisma.callSession.findUnique({
        where: { id: input.callId },
      })
      if (!call) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Call not found' })
      }
      if (call.initiatorId !== ctx.userId && call.receiverId !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a participant in this call' })
      }
      if (!['RINGING', 'ACTIVE'].includes(call.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Call is already ended' })
      }

      const now = new Date()
      const durationSeconds = call.startedAt
        ? Math.round((now.getTime() - call.startedAt.getTime()) / 1000)
        : null

      await ctx.prisma.callSession.update({
        where: { id: input.callId },
        data: { status: 'ENDED', endedAt: now },
      })

      return { success: true, durationSeconds }
    }),

  getStatus: protectedProcedure
    .input(z.object({ callId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const call = await ctx.prisma.callSession.findUnique({
        where: { id: input.callId },
      })
      if (!call) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Call not found' })
      }
      if (call.initiatorId !== ctx.userId && call.receiverId !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a participant in this call' })
      }

      return {
        callId: call.id,
        status: call.status,
        callType: call.callType,
        roomName: call.roomName,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
        initiatorId: call.initiatorId,
        receiverId: call.receiverId,
      }
    }),
})
