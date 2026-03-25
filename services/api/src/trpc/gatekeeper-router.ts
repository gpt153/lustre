import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { buildSystemPrompt, getAIResponse } from '../lib/gatekeeper-ai.js'
import type { ConversationMessage } from '../lib/gatekeeper-ai.js'
import { checkBalance, debitTokens, GATEKEEPER_COST } from '../lib/tokens.js'

const updateConfigSchema = z.object({
  strictness: z.enum(['MILD', 'STANDARD', 'STRICT']).optional(),
  customQuestions: z.array(z.string().max(500)).max(10).optional(),
  dealbreakers: z.array(z.string().max(200)).max(10).optional(),
  aiTone: z.enum(['FORMAL', 'CASUAL', 'FLIRTY']).optional(),
})

export const gatekeeperRouter = router({
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    let config = await ctx.prisma.gatekeeperConfig.findUnique({
      where: { userId: ctx.userId },
    })

    if (!config) {
      config = await ctx.prisma.gatekeeperConfig.create({
        data: {
          userId: ctx.userId,
          enabled: true,
          strictness: 'STANDARD',
          aiTone: 'CASUAL',
          customQuestions: [],
          dealbreakers: [],
        },
      })
    }

    return config
  }),

  updateConfig: protectedProcedure
    .input(updateConfigSchema)
    .mutation(async ({ ctx, input }) => {
      let config = await ctx.prisma.gatekeeperConfig.findUnique({
        where: { userId: ctx.userId },
      })

      if (!config) {
        config = await ctx.prisma.gatekeeperConfig.create({
          data: {
            userId: ctx.userId,
            enabled: true,
            strictness: 'STANDARD',
            aiTone: 'CASUAL',
            customQuestions: [],
            dealbreakers: [],
          },
        })
      }

      const updateData: Record<string, unknown> = {}
      if (input.strictness !== undefined) updateData.strictness = input.strictness
      if (input.customQuestions !== undefined) updateData.customQuestions = input.customQuestions
      if (input.dealbreakers !== undefined) updateData.dealbreakers = input.dealbreakers
      if (input.aiTone !== undefined) updateData.aiTone = input.aiTone

      return ctx.prisma.gatekeeperConfig.update({
        where: { userId: ctx.userId },
        data: updateData,
      })
    }),

  toggle: protectedProcedure.mutation(async ({ ctx }) => {
    let config = await ctx.prisma.gatekeeperConfig.findUnique({
      where: { userId: ctx.userId },
    })

    if (!config) {
      config = await ctx.prisma.gatekeeperConfig.create({
        data: {
          userId: ctx.userId,
          enabled: false,
          strictness: 'STANDARD',
          aiTone: 'CASUAL',
          customQuestions: [],
          dealbreakers: [],
        },
      })
    }

    return ctx.prisma.gatekeeperConfig.update({
      where: { userId: ctx.userId },
      data: { enabled: !config.enabled },
    })
  }),

  checkRequired: protectedProcedure
    .input(z.object({ recipientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const config = await ctx.prisma.gatekeeperConfig.findUnique({
        where: { userId: input.recipientId },
      })

      if (!config || !config.enabled) {
        return { required: false }
      }

      const passed = await ctx.prisma.gatekeeperConversation.findFirst({
        where: {
          senderId: ctx.userId,
          recipientId: input.recipientId,
          status: 'PASSED',
        },
      })

      if (passed) {
        return { required: false, alreadyPassed: true }
      }

      return { required: true }
    }),

  initiate: protectedProcedure
    .input(z.object({
      recipientId: z.string().uuid(),
      message: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.prisma.gatekeeperConfig.findUnique({
        where: { userId: input.recipientId },
      })

      if (!config || !config.enabled) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Gatekeeper is not enabled for this recipient',
        })
      }

      const existing = await ctx.prisma.gatekeeperConversation.findFirst({
        where: {
          senderId: ctx.userId,
          recipientId: input.recipientId,
          status: 'ACTIVE',
        },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An active conversation already exists with this recipient',
        })
      }

      const alreadyPassed = await ctx.prisma.gatekeeperConversation.findFirst({
        where: {
          senderId: ctx.userId,
          recipientId: input.recipientId,
          status: 'PASSED',
        },
      })

      if (alreadyPassed) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Already qualified',
        })
      }

      const balance = await checkBalance(ctx.prisma, ctx.userId)
      if (balance < GATEKEEPER_COST) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Insufficient tokens',
        })
      }

      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: input.recipientId },
        include: { user: true },
      })

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recipient profile not found',
        })
      }

      const recipientProfile = {
        displayName: profile.displayName,
        bio: profile.bio,
        age: profile.age,
        gender: profile.gender,
        orientation: profile.orientation,
        seeking: profile.seeking,
        relationshipType: profile.relationshipType,
      }

      const systemPrompt = buildSystemPrompt(
        {
          strictness: config.strictness as 'MILD' | 'STANDARD' | 'STRICT',
          aiTone: config.aiTone as 'FORMAL' | 'CASUAL' | 'FLIRTY',
          customQuestions: config.customQuestions as string[],
          dealbreakers: config.dealbreakers as string[],
        },
        recipientProfile,
      )

      const conversation = await ctx.prisma.gatekeeperConversation.create({
        data: {
          status: 'ACTIVE',
          senderId: ctx.userId,
          recipientId: input.recipientId,
          configId: config.id,
        },
      })

      await ctx.prisma.gatekeeperMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'USER',
          content: input.message,
        },
      })

      const aiResponse = await getAIResponse(systemPrompt, [], input.message)

      await ctx.prisma.gatekeeperMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'AI',
          content: aiResponse.message,
        },
      })

      if (aiResponse.decision === 'PASS' || aiResponse.decision === 'FAIL') {
        await ctx.prisma.gatekeeperConversation.update({
          where: { id: conversation.id },
          data: {
            status: aiResponse.decision === 'PASS' ? 'PASSED' : 'FAILED',
            tokensCost: GATEKEEPER_COST,
            ...(aiResponse.decision === 'PASS' && aiResponse.summary
              ? { summary: aiResponse.summary }
              : {}),
          },
        })
        await debitTokens(ctx.prisma, ctx.userId, GATEKEEPER_COST, 'GATEKEEPER', conversation.id)
      }

      return {
        conversationId: conversation.id,
        aiMessage: aiResponse.message,
        decision: aiResponse.decision,
        ...(aiResponse.summary ? { summary: aiResponse.summary } : {}),
      }
    }),

  respond: protectedProcedure
    .input(z.object({
      conversationId: z.string().uuid(),
      message: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await ctx.prisma.gatekeeperConversation.findUnique({
        where: { id: input.conversationId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
          config: true,
        },
      })

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        })
      }

      if (conversation.senderId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this conversation',
        })
      }

      if (conversation.status !== 'ACTIVE') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This conversation is no longer active',
        })
      }

      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: conversation.recipientId },
        include: { user: true },
      })

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recipient profile not found',
        })
      }

      const config = conversation.config

      const systemPrompt = buildSystemPrompt(
        {
          strictness: config.strictness as 'MILD' | 'STANDARD' | 'STRICT',
          aiTone: config.aiTone as 'FORMAL' | 'CASUAL' | 'FLIRTY',
          customQuestions: config.customQuestions as string[],
          dealbreakers: config.dealbreakers as string[],
        },
        {
          displayName: profile.displayName,
          bio: profile.bio,
          age: profile.age,
          gender: profile.gender,
          orientation: profile.orientation,
          seeking: profile.seeking,
          relationshipType: profile.relationshipType,
        },
      )

      const history: ConversationMessage[] = conversation.messages.map(m => ({
        role: m.role as ConversationMessage['role'],
        content: m.content,
      }))

      await ctx.prisma.gatekeeperMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'USER',
          content: input.message,
        },
      })

      const aiResponse = await getAIResponse(systemPrompt, history, input.message)

      await ctx.prisma.gatekeeperMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'AI',
          content: aiResponse.message,
        },
      })

      if (aiResponse.decision === 'PASS') {
        await ctx.prisma.gatekeeperConversation.update({
          where: { id: conversation.id },
          data: {
            status: 'PASSED',
            tokensCost: GATEKEEPER_COST,
            ...(aiResponse.summary ? { summary: aiResponse.summary } : {}),
          },
        })
      } else if (aiResponse.decision === 'FAIL') {
        await ctx.prisma.gatekeeperConversation.update({
          where: { id: conversation.id },
          data: { status: 'FAILED', tokensCost: GATEKEEPER_COST },
        })
      }

      if (aiResponse.decision === 'PASS' || aiResponse.decision === 'FAIL') {
        await debitTokens(ctx.prisma, ctx.userId, GATEKEEPER_COST, 'GATEKEEPER', conversation.id)
      }

      return {
        aiMessage: aiResponse.message,
        decision: aiResponse.decision,
        ...(aiResponse.summary ? { summary: aiResponse.summary } : {}),
      }
    }),

  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const conversation = await ctx.prisma.gatekeeperConversation.findUnique({
        where: { id: input.conversationId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      })

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        })
      }

      if (conversation.senderId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this conversation',
        })
      }

      return conversation
    }),
})
