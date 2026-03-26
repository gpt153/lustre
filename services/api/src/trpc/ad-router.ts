import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { AdFormat, BillingModel, Gender, Orientation, RelationshipType } from '@prisma/client'

const campaignIdInput = z.object({
  campaignId: z.string().uuid(),
})

async function assertCampaignOwner(
  prisma: Parameters<Parameters<typeof protectedProcedure.mutation>[0]>[0]['ctx']['prisma'],
  campaignId: string,
  userId: string
) {
  const campaign = await prisma.adCampaign.findUnique({ where: { id: campaignId } })
  if (!campaign || campaign.advertiserId !== userId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your campaign' })
  }
  return campaign
}

export const adRouter = router({
  createCampaign: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        format: z.nativeEnum(AdFormat),
        billingModel: z.nativeEnum(BillingModel),
        dailyBudgetSEK: z.number().min(100),
        totalBudgetSEK: z.number().optional(),
        startsAt: z.date().optional(),
        endsAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.adCampaign.create({
        data: {
          name: input.name,
          format: input.format,
          billingModel: input.billingModel,
          dailyBudgetSEK: input.dailyBudgetSEK,
          totalBudgetSEK: input.totalBudgetSEK,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          status: 'DRAFT',
          advertiserId: ctx.userId,
        },
      })

      return campaign
    }),

  updateTargeting: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        ageMin: z.number().optional(),
        ageMax: z.number().optional(),
        genders: z.nativeEnum(Gender).array().optional(),
        orientations: z.nativeEnum(Orientation).array().optional(),
        relationshipTypes: z.nativeEnum(RelationshipType).array().optional(),
        kinkTagIds: z.string().array().optional(),
        radiusKm: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertCampaignOwner(ctx.prisma, input.campaignId, ctx.userId)

      const targeting = await ctx.prisma.adTargeting.upsert({
        where: { campaignId: input.campaignId },
        create: {
          campaignId: input.campaignId,
          ageMin: input.ageMin,
          ageMax: input.ageMax,
          genders: input.genders ?? [],
          orientations: input.orientations ?? [],
          relationshipTypes: input.relationshipTypes ?? [],
          kinkTagIds: input.kinkTagIds ?? [],
          radiusKm: input.radiusKm,
        },
        update: {
          ageMin: input.ageMin,
          ageMax: input.ageMax,
          genders: input.genders ?? [],
          orientations: input.orientations ?? [],
          relationshipTypes: input.relationshipTypes ?? [],
          kinkTagIds: input.kinkTagIds ?? [],
          radiusKm: input.radiusKm,
        },
      })

      return targeting
    }),

  addCreative: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        headline: z.string().max(80),
        body: z.string().max(200).optional(),
        imageUrl: z.string().optional(),
        ctaUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertCampaignOwner(ctx.prisma, input.campaignId, ctx.userId)

      const creative = await ctx.prisma.adCreative.create({
        data: {
          campaignId: input.campaignId,
          headline: input.headline,
          body: input.body,
          imageUrl: input.imageUrl,
          ctaUrl: input.ctaUrl,
        },
      })

      return creative
    }),

  activateCampaign: protectedProcedure
    .input(campaignIdInput)
    .mutation(async ({ ctx, input }) => {
      await assertCampaignOwner(ctx.prisma, input.campaignId, ctx.userId)

      const activeCreatives = await ctx.prisma.adCreative.count({
        where: { campaignId: input.campaignId, isActive: true },
      })

      if (activeCreatives === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Campaign must have at least one active creative before activating',
        })
      }

      await ctx.prisma.adCampaign.update({
        where: { id: input.campaignId },
        data: { status: 'ACTIVE' },
      })

      return { success: true }
    }),

  pauseCampaign: protectedProcedure
    .input(campaignIdInput)
    .mutation(async ({ ctx, input }) => {
      await assertCampaignOwner(ctx.prisma, input.campaignId, ctx.userId)

      await ctx.prisma.adCampaign.update({
        where: { id: input.campaignId },
        data: { status: 'PAUSED' },
      })

      return { success: true }
    }),

  getCampaigns: protectedProcedure.query(async ({ ctx }) => {
    const campaigns = await ctx.prisma.adCampaign.findMany({
      where: { advertiserId: ctx.userId },
      include: {
        targeting: true,
        creatives: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return campaigns
  }),

  getAnalytics: protectedProcedure
    .input(campaignIdInput)
    .query(async ({ ctx, input }) => {
      await assertCampaignOwner(ctx.prisma, input.campaignId, ctx.userId)

      const [impressions, clicks, campaign] = await Promise.all([
        ctx.prisma.adImpression.count({ where: { campaignId: input.campaignId } }),
        ctx.prisma.adClick.count({ where: { campaignId: input.campaignId } }),
        ctx.prisma.adCampaign.findUnique({
          where: { id: input.campaignId },
          select: { spentSEK: true },
        }),
      ])

      const ctr = impressions > 0 ? Math.round((clicks / impressions) * 100 * 100) / 100 : 0

      return {
        impressions,
        clicks,
        ctr,
        spentSEK: campaign?.spentSEK ?? 0,
      }
    }),

  recordImpression: protectedProcedure
    .input(z.object({
      campaignId: z.string().uuid(),
      creativeId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.adImpression.create({
        data: {
          campaignId: input.campaignId,
          creativeId: input.creativeId,
          userId: ctx.userId,
        },
      })
      return { success: true }
    }),

  recordClick: protectedProcedure
    .input(z.object({
      campaignId: z.string().uuid(),
      creativeId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.adClick.create({
        data: {
          campaignId: input.campaignId,
          creativeId: input.creativeId,
          userId: ctx.userId,
        },
      })

      const campaign = await ctx.prisma.adCampaign.findUnique({
        where: { id: input.campaignId },
        select: { billingModel: true },
      })

      if (campaign?.billingModel === 'CPC') {
        const cost = 1
        await ctx.prisma.$executeRaw`
          UPDATE ad_campaigns
          SET spent_sek = spent_sek + ${cost}
          WHERE id = ${input.campaignId}::uuid
            AND spent_sek + ${cost} <= daily_budget_sek
        `
      }

      return { success: true }
    }),
})
