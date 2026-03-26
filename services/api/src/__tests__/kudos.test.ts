// Environment variables must be set before importing modules that read them.
process.env.JWT_SECRET = 'test-secret-key-at-least-32-chars-long!!'
process.env.ENCRYPTION_KEY = 'aa'.repeat(32) // 64 hex chars = 32 bytes

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { TRPCError } from '@trpc/server'

// Mock Redis before importing the app router
vi.mock('../lib/redis.js', () => ({
  redis: {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  },
}))

// Mock other dependencies
vi.mock('../lib/r2.js', () => ({
  uploadToR2: vi.fn(async (key: string) => `https://example.r2.com/${key}`),
  deleteFromR2: vi.fn(async () => {}),
  getPhotoKey: (profileId: string, photoId: string, size: string) =>
    `profiles/${profileId}/photos/${photoId}/${size}.webp`,
}))

vi.mock('../lib/image.js', () => ({
  processImage: vi.fn(async () => ({
    original: Buffer.from('original'),
    small: Buffer.from('small'),
    medium: Buffer.from('medium'),
    large: Buffer.from('large'),
  })),
}))

vi.mock('../lib/meilisearch.js', () => {
  const mockIndex = {
    search: vi.fn(async () => ({ hits: [], estimatedTotalHits: 0 })),
    addDocuments: vi.fn(async () => {}),
    deleteDocument: vi.fn(async () => {}),
  }
  return {
    meili: { index: vi.fn(() => mockIndex) },
    PROFILE_INDEX: 'profiles',
    indexProfile: vi.fn(async () => {}),
    removeProfileFromIndex: vi.fn(async () => {}),
  }
})

vi.mock('../lib/gatekeeper-ai.js', () => ({
  buildSystemPrompt: vi.fn(() => 'system prompt'),
  getAIResponse: vi.fn(async () => ({
    message: 'AI response',
    passed: false,
    shouldEnd: false,
  })),
}))

vi.mock('../lib/drm.js', () => ({
  generateUploadPresignedUrl: vi.fn(async () => ({ url: 'https://s3.example.com/upload', key: 'key' })),
  submitMediaConvertJob: vi.fn(async () => 'job-id'),
  generateDrmLicenseToken: vi.fn(() => 'drm-token'),
  generateStreamingUrl: vi.fn(() => 'https://cf.example.com/stream'),
}))

vi.mock('../lib/watermark.js', () => ({
  embedWatermark: vi.fn(async (url: string) => url),
}))

import { appRouter } from '../trpc/router.js'
import type { Context } from '../trpc/context.js'
import { redis } from '../lib/redis.js'

// vi.mocked() gives us access to the mock functions
const mockRedisObj = vi.mocked(redis)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const userId = '550e8400-e29b-41d4-a716-446655440001'
const recipientId = '550e8400-e29b-41d4-a716-446655440002'
const matchId = '550e8400-e29b-41d4-a716-446655440003'

const badgeCategoryId = '550e8400-e29b-41d4-a716-446655440010'
const vanillaBadgeId = '550e8400-e29b-41d4-a716-446655440011'
const spicyBadgeId = '550e8400-e29b-41d4-a716-446655440012'

const mockBadgeCategory = {
  id: badgeCategoryId,
  name: 'Appreciation',
  slug: 'appreciation',
  sortOrder: 1,
  createdAt: new Date(),
  badges: [
    {
      id: vanillaBadgeId,
      categoryId: badgeCategoryId,
      name: 'Respectful',
      slug: 'respectful',
      description: 'Treats others with respect',
      spicyOnly: false,
      sortOrder: 1,
      createdAt: new Date(),
    },
    {
      id: spicyBadgeId,
      categoryId: badgeCategoryId,
      name: 'Passionate',
      slug: 'passionate',
      description: 'Very passionate',
      spicyOnly: true,
      sortOrder: 2,
      createdAt: new Date(),
    },
  ],
}

function buildContext(prismaOverrides: Record<string, any> = {}): Context {
  return {
    userId,
    sessionId: 'session-uuid',
    req: {} as any,
    res: {} as any,
    prisma: {
      profile: {
        findUnique: vi.fn(),
      },
      kudosBadgeCategory: {
        findMany: vi.fn(),
      },
      kudosBadge: {
        findMany: vi.fn(),
      },
      kudos: {
        findFirst: vi.fn(),
        create: vi.fn(),
        count: vi.fn(),
      },
      kudosBadgeSelection: {
        groupBy: vi.fn(),
      },
      ...prismaOverrides,
    } as any,
    redis: redis as any,
  }
}

// ---------------------------------------------------------------------------
// Kudos Tests
// ---------------------------------------------------------------------------

describe('Kudos Backend (Wave 1)', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // Test 1: Badge catalog seeded and queryable by category
  // =========================================================================

  describe('kudos.listBadges', () => {
    test('returns all badge categories with badges in Vanilla mode', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      ;(ctx.prisma as any).kudosBadgeCategory.findMany.mockResolvedValue([mockBadgeCategory])
      ;(mockRedisObj.get as any).mockResolvedValue(null) // Cache miss

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.listBadges({})

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Appreciation')
      expect(result[0].slug).toBe('appreciation')
      expect(result[0].badges).toHaveLength(1) // Only vanilla badge
      expect(result[0].badges[0].name).toBe('Respectful')
      expect(result[0].badges[0].spicyOnly).toBe(false)
    })

    test('returns all badge categories including spicy badges in Spicy mode', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: true,
      })
      ;(ctx.prisma as any).kudosBadgeCategory.findMany.mockResolvedValue([mockBadgeCategory])
      ;(mockRedisObj.get as any).mockResolvedValue(null) // Cache miss

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.listBadges({})

      expect(result).toHaveLength(1)
      expect(result[0].badges).toHaveLength(2) // Both vanilla and spicy
      expect(result[0].badges.map((b: any) => b.name)).toEqual(['Respectful', 'Passionate'])
    })

    test('filters by category slug when provided', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      ;(ctx.prisma as any).kudosBadgeCategory.findMany.mockResolvedValue([mockBadgeCategory])
      ;(mockRedisObj.get as any).mockResolvedValue(null) // Cache miss

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.listBadges({ categorySlug: 'appreciation' })

      expect(result).toHaveLength(1)
      expect(result[0].slug).toBe('appreciation')
    })

    test('returns empty array when no categories match slug filter', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      ;(ctx.prisma as any).kudosBadgeCategory.findMany.mockResolvedValue([mockBadgeCategory])
      ;(mockRedisObj.get as any).mockResolvedValue(null) // Cache miss

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.listBadges({ categorySlug: 'nonexistent' })

      expect(result).toHaveLength(0)
    })

    test('uses cached badge catalog when available', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      const cachedData = JSON.stringify([mockBadgeCategory])
      ;(mockRedisObj.get as any).mockResolvedValue(cachedData)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.listBadges({})

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Appreciation')
      // Verify findMany was NOT called (cache was used)
      expect((ctx.prisma as any).kudosBadgeCategory.findMany).not.toHaveBeenCalled()
    })

    test('excludes spicy badges when queried in Vanilla mode', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      ;(ctx.prisma as any).kudosBadgeCategory.findMany.mockResolvedValue([mockBadgeCategory])
      ;(mockRedisObj.get as any).mockResolvedValue(null)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.listBadges({})

      const allBadges = result.flatMap((c: any) => c.badges)
      expect(allBadges.every((b: any) => !b.spicyOnly)).toBe(true)
    })
  })

  // =========================================================================
  // Test 2: Kudos submission stores badge selections for giver→recipient
  // =========================================================================

  describe('kudos.give', () => {
    test('stores kudos with multiple badge selections', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      ;(mockRedisObj.incr as any).mockResolvedValue(1)
      ;(mockRedisObj.expire as any).mockResolvedValue(1)
      ;(ctx.prisma as any).kudos.findFirst.mockResolvedValue(null) // No duplicate
      ;(ctx.prisma as any).kudosBadge.findMany.mockResolvedValue([
        {
          id: vanillaBadgeId,
          categoryId: badgeCategoryId,
          name: 'Respectful',
          slug: 'respectful',
          spicyOnly: false,
        },
      ])
      ;(ctx.prisma as any).kudos.create.mockResolvedValue({
        id: 'kudos-uuid',
        giverId: userId,
        recipientId,
        matchId,
        badges: [
          {
            id: 'selection-uuid',
            kudosId: 'kudos-uuid',
            badgeId: vanillaBadgeId,
            badge: {
              id: vanillaBadgeId,
              name: 'Respectful',
              spicyOnly: false,
            },
          },
        ],
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.give({
        recipientId,
        matchId,
        badgeIds: [vanillaBadgeId],
      })

      expect(result.giverId).toBe(userId)
      expect(result.recipientId).toBe(recipientId)
      expect(result.matchId).toBe(matchId)
      expect(result.badges).toHaveLength(1)
      expect(result.badges[0].badge.name).toBe('Respectful')
      expect((ctx.prisma as any).kudos.create).toHaveBeenCalled()
    })

    test('prevents self-kudos (giver === recipient)', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })

      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.kudos.give({
          recipientId: userId, // Same as giver
          badgeIds: [vanillaBadgeId],
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Cannot give kudos to yourself',
      })
    })

    test('validates that all badge IDs exist', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      ;(mockRedisObj.incr as any).mockResolvedValue(1)
      ;(mockRedisObj.expire as any).mockResolvedValue(1)
      ;(ctx.prisma as any).kudos.findFirst.mockResolvedValue(null)
      ;(ctx.prisma as any).kudosBadge.findMany.mockResolvedValue([]) // No badges found

      const nonExistentBadgeId = '550e8400-e29b-41d4-a716-446655440099'
      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.kudos.give({
          recipientId,
          badgeIds: [vanillaBadgeId, nonExistentBadgeId],
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'One or more invalid badge IDs',
      })
    })
  })

  // =========================================================================
  // Test 3: Duplicate kudos for same interaction rejected
  // =========================================================================

  describe('kudos.give - Duplicate Prevention', () => {
    test('rejects duplicate kudos for same giver→recipient (without matchId)', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      ;(mockRedisObj.incr as any).mockResolvedValue(1)
      ;(mockRedisObj.expire as any).mockResolvedValue(1)
      ;(ctx.prisma as any).kudos.findFirst.mockResolvedValue({
        id: 'existing-kudos',
        giverId: userId,
        recipientId,
        matchId: null,
      }) // Duplicate found

      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.kudos.give({
          recipientId,
          badgeIds: [vanillaBadgeId],
        })
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        message: 'Kudos already given for this interaction',
      })
    })

    test('rejects duplicate kudos for same giver→recipient→matchId', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      ;(mockRedisObj.incr as any).mockResolvedValue(1)
      ;(mockRedisObj.expire as any).mockResolvedValue(1)
      ;(ctx.prisma as any).kudos.findFirst.mockResolvedValue({
        id: 'existing-kudos',
        giverId: userId,
        recipientId,
        matchId,
      }) // Duplicate found

      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.kudos.give({
          recipientId,
          matchId,
          badgeIds: [vanillaBadgeId],
        })
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        message: 'Kudos already given for this interaction',
      })
    })

    test('allows kudos to same recipient with different matchId', async () => {
      const ctx = buildContext()
      const differentMatchId = '550e8400-e29b-41d4-a716-446655440099'
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      ;(mockRedisObj.incr as any).mockResolvedValue(1)
      ;(mockRedisObj.expire as any).mockResolvedValue(1)
      ;(ctx.prisma as any).kudos.findFirst.mockResolvedValue(null) // No duplicate
      ;(ctx.prisma as any).kudosBadge.findMany.mockResolvedValue([
        {
          id: vanillaBadgeId,
          spicyOnly: false,
        },
      ])
      ;(ctx.prisma as any).kudos.create.mockResolvedValue({
        id: 'kudos-uuid',
        giverId: userId,
        recipientId,
        matchId: differentMatchId,
        badges: [],
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.give({
        recipientId,
        matchId: differentMatchId,
        badgeIds: [vanillaBadgeId],
      })

      expect(result.matchId).toBe(differentMatchId)
      expect((ctx.prisma as any).kudos.create).toHaveBeenCalled()
    })
  })

  // =========================================================================
  // Test 4: Rate limit enforced (10 per 24h)
  // =========================================================================

  describe('kudos.give - Rate Limiting', () => {
    test('allows kudos when under rate limit', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      ;(mockRedisObj.incr as any).mockResolvedValue(5) // 5/10 limit
      ;(mockRedisObj.expire as any).mockResolvedValue(1)
      ;(ctx.prisma as any).kudos.findFirst.mockResolvedValue(null)
      ;(ctx.prisma as any).kudosBadge.findMany.mockResolvedValue([
        { id: vanillaBadgeId, spicyOnly: false },
      ])
      ;(ctx.prisma as any).kudos.create.mockResolvedValue({
        id: 'kudos-uuid',
        giverId: userId,
        recipientId,
        badges: [],
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.give({
        recipientId,
        badgeIds: [vanillaBadgeId],
      })

      expect(result.id).toBe('kudos-uuid')
    })

    test('rejects kudos when rate limit (10) is exceeded', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      ;(mockRedisObj.incr as any).mockResolvedValue(11) // 11/10 limit exceeded
      ;(mockRedisObj.expire as any).mockResolvedValue(1)

      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.kudos.give({
          recipientId,
          badgeIds: [vanillaBadgeId],
        })
      ).rejects.toMatchObject({
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Max 10 kudos per 24 hours.',
      })
    })

    test('allows exactly 10 kudos within 24h window', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      ;(mockRedisObj.incr as any).mockResolvedValue(10) // Exactly 10/10
      ;(mockRedisObj.expire as any).mockResolvedValue(1)
      ;(ctx.prisma as any).kudos.findFirst.mockResolvedValue(null)
      ;(ctx.prisma as any).kudosBadge.findMany.mockResolvedValue([
        { id: vanillaBadgeId, spicyOnly: false },
      ])
      ;(ctx.prisma as any).kudos.create.mockResolvedValue({
        id: 'kudos-uuid',
        giverId: userId,
        recipientId,
        badges: [],
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.give({
        recipientId,
        badgeIds: [vanillaBadgeId],
      })

      expect(result.id).toBe('kudos-uuid')
    })
  })

  // =========================================================================
  // Test 5: SpicyOnly badges excluded when queried in Vanilla mode
  // =========================================================================

  describe('kudos.give - Spicy Badge Restrictions', () => {
    test('prevents spicy badges in vanilla mode', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false, // Vanilla mode
      })
      ;(mockRedisObj.incr as any).mockResolvedValue(1)
      ;(mockRedisObj.expire as any).mockResolvedValue(1)
      ;(ctx.prisma as any).kudos.findFirst.mockResolvedValue(null)
      ;(ctx.prisma as any).kudosBadge.findMany.mockResolvedValue([
        {
          id: spicyBadgeId,
          spicyOnly: true,
          name: 'Passionate',
        },
      ])

      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.kudos.give({
          recipientId,
          badgeIds: [spicyBadgeId],
        })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Cannot select spicy badges in vanilla mode',
      })
    })

    test('allows spicy badges in spicy mode', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: true, // Spicy mode
      })
      ;(mockRedisObj.incr as any).mockResolvedValue(1)
      ;(mockRedisObj.expire as any).mockResolvedValue(1)
      ;(ctx.prisma as any).kudos.findFirst.mockResolvedValue(null)
      ;(ctx.prisma as any).kudosBadge.findMany.mockResolvedValue([
        {
          id: spicyBadgeId,
          spicyOnly: true,
          name: 'Passionate',
        },
      ])
      ;(ctx.prisma as any).kudos.create.mockResolvedValue({
        id: 'kudos-uuid',
        giverId: userId,
        recipientId,
        badges: [{ badge: { id: spicyBadgeId, name: 'Passionate', spicyOnly: true } }],
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.give({
        recipientId,
        badgeIds: [spicyBadgeId],
      })

      expect(result.id).toBe('kudos-uuid')
      expect((ctx.prisma as any).kudos.create).toHaveBeenCalled()
    })

    test('filters out spicy badges in getProfileKudos when vanilla mode', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })
      ;(ctx.prisma as any).kudos.count.mockResolvedValue(10)
      ;(ctx.prisma as any).kudosBadgeSelection.groupBy.mockResolvedValue([
        {
          badgeId: vanillaBadgeId,
          _count: { badgeId: 5 },
        },
      ])
      ;(ctx.prisma as any).kudosBadge.findMany.mockResolvedValue([
        {
          id: vanillaBadgeId,
          name: 'Respectful',
          spicyOnly: false,
          category: { name: 'Appreciation' },
        },
      ])

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.getProfileKudos({ userId: recipientId })

      expect(result.totalCount).toBe(10)
      expect(result.badges).toHaveLength(1)
      expect(result.badges[0].name).toBe('Respectful')
    })

    test('includes spicy badges in getProfileKudos when spicy mode', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: true,
      })
      ;(ctx.prisma as any).kudos.count.mockResolvedValue(10)
      ;(ctx.prisma as any).kudosBadgeSelection.groupBy.mockResolvedValue([
        {
          badgeId: vanillaBadgeId,
          _count: { badgeId: 5 },
        },
        {
          badgeId: spicyBadgeId,
          _count: { badgeId: 3 },
        },
      ])
      ;(ctx.prisma as any).kudosBadge.findMany.mockResolvedValue([
        {
          id: vanillaBadgeId,
          name: 'Respectful',
          spicyOnly: false,
          category: { name: 'Appreciation' },
        },
        {
          id: spicyBadgeId,
          name: 'Passionate',
          spicyOnly: true,
          category: { name: 'Appreciation' },
        },
      ])

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.getProfileKudos({ userId: recipientId })

      expect(result.totalCount).toBe(10)
      expect(result.badges).toHaveLength(2)
      expect(result.badges.map((b: any) => b.name)).toEqual(['Respectful', 'Passionate'])
    })
  })

  // =========================================================================
  // Additional Edge Cases
  // =========================================================================

  describe('kudos.give - Edge Cases', () => {
    test('enforces min 1 and max 6 badges per submission', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: false,
      })

      const caller = appRouter.createCaller(ctx)

      // Empty array should fail during input validation
      await expect(
        caller.kudos.give({
          recipientId,
          badgeIds: [], // Empty!
        })
      ).rejects.toThrow()

      // More than 6 should fail during input validation
      await expect(
        caller.kudos.give({
          recipientId,
          badgeIds: [
            vanillaBadgeId,
            vanillaBadgeId,
            vanillaBadgeId,
            vanillaBadgeId,
            vanillaBadgeId,
            vanillaBadgeId,
            vanillaBadgeId, // 7th!
          ],
        })
      ).rejects.toThrow()
    })

    test('getProfileKudos returns badges sorted by count descending', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).profile.findUnique.mockResolvedValue({
        userId,
        spicyModeEnabled: true,
      })
      ;(ctx.prisma as any).kudos.count.mockResolvedValue(15)
      ;(ctx.prisma as any).kudosBadgeSelection.groupBy.mockResolvedValue([
        {
          badgeId: vanillaBadgeId,
          _count: { badgeId: 10 }, // Highest count
        },
        {
          badgeId: spicyBadgeId,
          _count: { badgeId: 5 }, // Lower count
        },
      ])
      ;(ctx.prisma as any).kudosBadge.findMany.mockResolvedValue([
        {
          id: vanillaBadgeId,
          name: 'Respectful',
          category: { name: 'Appreciation' },
        },
        {
          id: spicyBadgeId,
          name: 'Passionate',
          category: { name: 'Appreciation' },
        },
      ])

      const caller = appRouter.createCaller(ctx)
      const result = await caller.kudos.getProfileKudos({ userId: recipientId })

      expect(result.badges[0].count).toBe(10)
      expect(result.badges[1].count).toBe(5)
    })
  })
})
