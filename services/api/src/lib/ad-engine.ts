import { PrismaClient, Gender, Orientation, RelationshipType } from '@prisma/client'

type BillingModel = 'CPM' | 'CPC'

type CampaignWithRelations = {
  id: string
  billingModel: BillingModel
  dailyBudgetSEK: number
  spentSEK: number
  endsAt: Date | null
  targeting: {
    genders: Gender[]
    orientations: Orientation[]
    relationshipTypes: RelationshipType[]
    kinkTagIds: string[]
    ageMin: number | null
    ageMax: number | null
  } | null
  creatives: {
    id: string
    headline: string
    body: string | null
    imageUrl: string | null
    ctaUrl: string
    isActive: boolean
  }[]
  advertiser: {
    displayName: string | null
  }
}

type ImpressionRecord = {
  campaignId: string
}

export async function selectAd(
  prisma: PrismaClient,
  userId: string,
): Promise<{
  campaignId: string
  creativeId: string
  headline: string
  body: string | null
  imageUrl: string | null
  ctaUrl: string
  sponsor: string | null
} | null> {
  try {
  // 1. Fetch user profile with kink tags
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      kinkTags: { select: { kinkTagId: true } },
    },
  })

  if (!profile) {
    return null
  }

  const now = new Date()
  const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000)

  // 2. Fetch ACTIVE campaigns with targeting and active creatives
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prismaAny = prisma as any
  const campaigns: CampaignWithRelations[] = await prismaAny.adCampaign.findMany({
    where: { status: 'ACTIVE' },
    include: {
      targeting: true,
      creatives: { where: { isActive: true } },
      advertiser: { select: { displayName: true } },
    },
  })

  // Filter: budget not exhausted, not expired, has active creatives
  const budgetEligible = campaigns.filter((campaign: CampaignWithRelations) => {
    if (campaign.spentSEK >= campaign.dailyBudgetSEK) return false
    if (campaign.endsAt && campaign.endsAt < now) return false
    if (campaign.creatives.length === 0) return false
    return true
  })

  if (budgetEligible.length === 0) {
    return null
  }

  // 3. Filter out campaigns seen by user in last 30 minutes (frequency cap)
  const recentImpressions: ImpressionRecord[] = await prismaAny.adImpression.findMany({
    where: {
      userId,
      campaignId: { in: budgetEligible.map((c: CampaignWithRelations) => c.id) },
      recordedAt: { gte: thirtyMinsAgo },
    },
    select: { campaignId: true },
  })

  const recentCampaignIds = new Set(recentImpressions.map((i: ImpressionRecord) => i.campaignId))

  const frequencyEligible = budgetEligible.filter(
    (campaign: CampaignWithRelations) => !recentCampaignIds.has(campaign.id),
  )

  if (frequencyEligible.length === 0) {
    return null
  }

  // 4. Filter by targeting criteria (all AND logic)
  const userKinkTagIds = new Set(profile.kinkTags.map(kt => kt.kinkTagId))

  const targeted = frequencyEligible.filter((campaign: CampaignWithRelations) => {
    const t = campaign.targeting
    if (!t) return true

    // Gender filter
    if (t.genders.length > 0 && !t.genders.includes(profile.gender)) {
      return false
    }

    // Orientation filter
    if (t.orientations.length > 0 && !t.orientations.includes(profile.orientation)) {
      return false
    }

    // Age min filter
    if (t.ageMin !== null && t.ageMin !== undefined && profile.age < t.ageMin) {
      return false
    }

    // Age max filter
    if (t.ageMax !== null && t.ageMax !== undefined && profile.age > t.ageMax) {
      return false
    }

    // Relationship type filter
    if (
      t.relationshipTypes.length > 0 &&
      profile.relationshipType !== null &&
      profile.relationshipType !== undefined &&
      !t.relationshipTypes.includes(profile.relationshipType)
    ) {
      return false
    }

    // Kink tag filter: user must have at least 1 matching kink tag
    if (t.kinkTagIds.length > 0) {
      const hasMatch = t.kinkTagIds.some((tagId: string) => userKinkTagIds.has(tagId))
      if (!hasMatch) return false
    }

    return true
  })

  if (targeted.length === 0) {
    return null
  }

  // 5. Pick a random eligible campaign
  const shuffled = [...targeted].sort(() => Math.random() - 0.5)

  for (const campaign of shuffled) {
    const creative = campaign.creatives[0]
    if (!creative) continue

    // 6. Atomically debit budget for CPM
    if (campaign.billingModel === 'CPM') {
      const cost = Math.max(1, Math.ceil(campaign.dailyBudgetSEK / 1000))
      const affected = await prisma.$executeRaw`
        UPDATE ad_campaigns
        SET spent_sek = spent_sek + ${cost}
        WHERE id = ${campaign.id}::uuid
          AND spent_sek + ${cost} <= daily_budget_sek
      `
      if (affected === 0) {
        // Budget exhausted for this campaign, try next
        continue
      }
    }

    // 7. Return creative data
    return {
      campaignId: campaign.id,
      creativeId: creative.id,
      headline: creative.headline,
      body: creative.body ?? null,
      imageUrl: creative.imageUrl ?? null,
      ctaUrl: creative.ctaUrl,
      sponsor: campaign.advertiser.displayName ?? null,
    }
  }

  return null
  } catch {
    // Ad system tables may not exist yet — gracefully return no ad
    return null
  }
}
