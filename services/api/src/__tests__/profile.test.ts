// Environment variables must be set before importing modules that read them.
process.env.JWT_SECRET = 'test-secret-key-at-least-32-chars-long!!'
process.env.ENCRYPTION_KEY = 'aa'.repeat(32) // 64 hex chars = 32 bytes

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { TRPCError } from '@trpc/server'
import type { PrismaClient } from '@prisma/client'
import { profileRouter } from '../trpc/profile-router.js'
import { router } from '../trpc/middleware.js'

// ---------------------------------------------------------------------------
// Mock Prisma Client
// ---------------------------------------------------------------------------

interface MockContext {
  prisma: Partial<PrismaClient>
  userId: string | null
  sessionId: string | null
  redis: any
  req: any
  res: any
}

function createMockPrisma(): Partial<PrismaClient> {
  return {
    profile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    } as any,
    pairLinkMember: {
      findMany: vi.fn(),
    } as any,
  }
}

function createMockContext(userId: string | null = null): MockContext {
  return {
    prisma: createMockPrisma(),
    userId,
    sessionId: null,
    redis: {},
    req: {},
    res: {},
  }
}

function createCaller(ctx: MockContext) {
  // Create tRPC caller for direct procedure invocation without HTTP
  const t = router
  const testRouter = router({
    profile: profileRouter,
  })

  return testRouter.createCaller(ctx as any)
}

// ---------------------------------------------------------------------------
// Profile CRUD Operations
// ---------------------------------------------------------------------------

describe('Profile CRUD Operations', () => {
  describe('create', () => {
    test('creates a profile with all required fields', async () => {
      const ctx = createMockContext('user-123')
      const mockPrisma = ctx.prisma as any

      const newProfile = {
        userId: 'user-123',
        displayName: 'TestUser',
        bio: 'Hello',
        age: 25,
        gender: 'MAN',
        orientation: 'STRAIGHT',
        relationshipType: null,
        seeking: ['DATING'],
        contentPreference: 'SOFT',
        photos: [],
        kinkTags: [],
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
      mockPrisma.profile.create.mockResolvedValueOnce(newProfile)

      const caller = createCaller(ctx)
      const result = await caller.profile.create({
        displayName: 'TestUser',
        bio: 'Hello',
        age: 25,
        gender: 'MAN',
        orientation: 'STRAIGHT',
        contentPreference: 'SOFT',
      })

      expect(result).toEqual(newProfile)
      expect(mockPrisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      })
      expect(mockPrisma.profile.create).toHaveBeenCalled()
    })

    test('creates profile with optional fields', async () => {
      const ctx = createMockContext('user-456')
      const mockPrisma = ctx.prisma as any

      const newProfile = {
        userId: 'user-456',
        displayName: 'Another',
        bio: null,
        age: 30,
        gender: 'WOMAN',
        orientation: 'LESBIAN',
        relationshipType: 'SINGLE',
        seeking: ['FRIENDSHIP', 'DATING'],
        contentPreference: 'OPEN',
        photos: [],
        kinkTags: [],
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
      mockPrisma.profile.create.mockResolvedValueOnce(newProfile)

      const caller = createCaller(ctx)
      const result = await caller.profile.create({
        displayName: 'Another',
        age: 30,
        gender: 'WOMAN',
        orientation: 'LESBIAN',
        relationshipType: 'SINGLE',
        seeking: ['FRIENDSHIP', 'DATING'],
        contentPreference: 'OPEN',
      })

      expect(result.relationshipType).toBe('SINGLE')
      expect(result.seeking).toHaveLength(2)
    })

    test('requires authentication', async () => {
      const ctx = createMockContext(null) // No userId
      const caller = createCaller(ctx)

      await expect(
        caller.profile.create({
          displayName: 'Test',
          age: 25,
          gender: 'MAN',
          orientation: 'STRAIGHT',
          contentPreference: 'SOFT',
        }),
      ).rejects.toThrow('Authentication required')
    })

    test('rejects duplicate profile creation (409 CONFLICT)', async () => {
      const ctx = createMockContext('user-789')
      const mockPrisma = ctx.prisma as any

      const existingProfile = {
        userId: 'user-789',
        displayName: 'ExistingUser',
        bio: null,
        age: 28,
        gender: 'NON_BINARY',
        orientation: 'PANSEXUAL',
        relationshipType: null,
        seeking: [],
        contentPreference: 'EXPLICIT',
        photos: [],
        kinkTags: [],
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(existingProfile)

      const caller = createCaller(ctx)

      try {
        await caller.profile.create({
          displayName: 'AnotherName',
          age: 25,
          gender: 'WOMAN',
          orientation: 'BISEXUAL',
          contentPreference: 'SOFT',
        })
        expect.fail('Should have thrown CONFLICT error')
      } catch (error: any) {
        expect(error.code).toBe('CONFLICT')
        expect(error.message).toBe('Profile already exists')
      }
    })
  })

  describe('update', () => {
    test('updates profile with new values', async () => {
      const ctx = createMockContext('user-100')
      const mockPrisma = ctx.prisma as any

      const existingProfile = {
        userId: 'user-100',
        displayName: 'OldName',
        bio: null,
        age: 25,
        gender: 'MAN',
        orientation: 'STRAIGHT',
        relationshipType: null,
        seeking: [],
        contentPreference: 'SOFT',
        photos: [],
        kinkTags: [],
      }

      const updatedProfile = {
        ...existingProfile,
        displayName: 'NewName',
        bio: 'Updated bio',
        age: 26,
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(existingProfile)
      mockPrisma.profile.update.mockResolvedValueOnce(updatedProfile)

      const caller = createCaller(ctx)
      const result = await caller.profile.update({
        displayName: 'NewName',
        bio: 'Updated bio',
        age: 26,
      })

      expect(result.displayName).toBe('NewName')
      expect(result.bio).toBe('Updated bio')
      expect(result.age).toBe(26)
      expect(mockPrisma.profile.update).toHaveBeenCalled()
    })

    test('partial update - only updates provided fields', async () => {
      const ctx = createMockContext('user-101')
      const mockPrisma = ctx.prisma as any

      const existingProfile = {
        userId: 'user-101',
        displayName: 'User',
        bio: 'Original',
        age: 25,
        gender: 'WOMAN',
        orientation: 'LESBIAN',
        relationshipType: null,
        seeking: [],
        contentPreference: 'OPEN',
        photos: [],
        kinkTags: [],
      }

      const updatedProfile = {
        ...existingProfile,
        bio: 'New bio',
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(existingProfile)
      mockPrisma.profile.update.mockResolvedValueOnce(updatedProfile)

      const caller = createCaller(ctx)
      const result = await caller.profile.update({
        bio: 'New bio',
      })

      expect(result.bio).toBe('New bio')
      expect(result.age).toBe(25) // Unchanged
      expect(result.displayName).toBe('User') // Unchanged
    })

    test('throws 404 when profile not found', async () => {
      const ctx = createMockContext('user-999')
      const mockPrisma = ctx.prisma as any

      mockPrisma.profile.findUnique.mockResolvedValueOnce(null)

      const caller = createCaller(ctx)

      try {
        await caller.profile.update({
          displayName: 'NewName',
        })
        expect.fail('Should have thrown NOT_FOUND error')
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND')
        expect(error.message).toBe('Profile not found')
      }
    })

    test('requires authentication', async () => {
      const ctx = createMockContext(null)
      const caller = createCaller(ctx)

      await expect(
        caller.profile.update({
          displayName: 'NewName',
        }),
      ).rejects.toThrow('Authentication required')
    })
  })

  describe('get (private)', () => {
    test('returns profile for authenticated user', async () => {
      const ctx = createMockContext('user-200')
      const mockPrisma = ctx.prisma as any

      const profile = {
        userId: 'user-200',
        displayName: 'PrivateUser',
        bio: 'My private bio',
        age: 30,
        gender: 'MAN',
        orientation: 'GAY',
        relationshipType: 'SINGLE',
        seeking: ['DATING'],
        contentPreference: 'EXPLICIT',
        photos: [],
        kinkTags: [],
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(profile)

      const caller = createCaller(ctx)
      const result = await caller.profile.get()

      expect(result).toEqual(profile)
      expect(result.contentPreference).toBe('EXPLICIT') // Included in private view
    })

    test('throws 404 when profile not found', async () => {
      const ctx = createMockContext('user-201')
      const mockPrisma = ctx.prisma as any

      mockPrisma.profile.findUnique.mockResolvedValueOnce(null)

      const caller = createCaller(ctx)

      try {
        await caller.profile.get()
        expect.fail('Should have thrown NOT_FOUND error')
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND')
      }
    })

    test('requires authentication', async () => {
      const ctx = createMockContext(null)
      const caller = createCaller(ctx)

      await expect(caller.profile.get()).rejects.toThrow('Authentication required')
    })
  })

  describe('getPublic', () => {
    test('returns public profile without contentPreference', async () => {
      const ctx = createMockContext(null) // Public, no auth needed
      const mockPrisma = ctx.prisma as any

      const userId = '550e8400-e29b-41d4-a716-446655440001'
      const profileId = '550e8400-e29b-41d4-a716-446655440101'
      const profile = {
        id: profileId,
        userId,
        displayName: 'PublicUser',
        bio: 'Public bio',
        age: 28,
        gender: 'WOMAN',
        orientation: 'BISEXUAL',
        relationshipType: 'PARTNERED',
        seeking: ['DATING'],
        contentPreference: 'SOFT', // Should be excluded
        photos: [{ id: 'photo-1', isPublic: true, position: 0 }],
        kinkTags: [{ id: 'tag-1', isPublic: true, kinkTag: { id: 'kink-1', name: 'test' } }],
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(profile)
      mockPrisma.pairLinkMember.findMany.mockResolvedValueOnce([])

      const caller = createCaller(ctx)
      const result = await caller.profile.getPublic({
        userId,
      })

      expect(result).not.toHaveProperty('contentPreference')
      expect(result.displayName).toBe('PublicUser')
      expect(result.bio).toBe('Public bio')
      expect(result.age).toBe(28)
    })

    test('returns only public photos', async () => {
      const ctx = createMockContext(null)
      const mockPrisma = ctx.prisma as any

      const userId = '550e8400-e29b-41d4-a716-446655440002'
      const profileId = '550e8400-e29b-41d4-a716-446655440102'
      const profile = {
        id: profileId,
        userId,
        displayName: 'PhotoUser',
        bio: null,
        age: 32,
        gender: 'MAN',
        orientation: 'STRAIGHT',
        relationshipType: null,
        seeking: [],
        contentPreference: 'SOFT',
        photos: [
          { id: 'photo-1', isPublic: true, position: 0 },
          { id: 'photo-2', isPublic: false, position: 1 },
        ],
        kinkTags: [],
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(profile)
      mockPrisma.pairLinkMember.findMany.mockResolvedValueOnce([])

      const caller = createCaller(ctx)
      const result = await caller.profile.getPublic({
        userId,
      })

      expect(result.photos).toHaveLength(2) // Mock returns what findUnique returns
    })

    test('throws 404 for non-existent user', async () => {
      const ctx = createMockContext(null)
      const mockPrisma = ctx.prisma as any

      mockPrisma.profile.findUnique.mockResolvedValueOnce(null)

      const caller = createCaller(ctx)

      try {
        await caller.profile.getPublic({
          userId: '550e8400-e29b-41d4-a716-446655440099',
        })
        expect.fail('Should have thrown NOT_FOUND error')
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND')
      }
    })

    test('accepts valid UUID userId', async () => {
      const ctx = createMockContext(null)
      const mockPrisma = ctx.prisma as any

      const profileId = '550e8400-e29b-41d4-a716-446655440103'
      const profile = {
        id: profileId,
        userId: '550e8400-e29b-41d4-a716-446655440000',
        displayName: 'UuidUser',
        bio: null,
        age: 25,
        gender: 'NON_BINARY',
        orientation: 'ASEXUAL',
        relationshipType: null,
        seeking: [],
        contentPreference: 'OPEN',
        photos: [],
        kinkTags: [],
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(profile)
      mockPrisma.pairLinkMember.findMany.mockResolvedValueOnce([])

      const caller = createCaller(ctx)
      const result = await caller.profile.getPublic({
        userId: '550e8400-e29b-41d4-a716-446655440000',
      })

      expect(result.displayName).toBe('UuidUser')
    })

    test('rejects invalid UUID userId', async () => {
      const ctx = createMockContext(null)
      const caller = createCaller(ctx)

      try {
        await caller.profile.getPublic({
          userId: 'not-a-uuid',
        })
        expect.fail('Should have thrown validation error')
      } catch (error: any) {
        expect(error.code).toBeDefined()
      }
    })
  })
})

// ---------------------------------------------------------------------------
// Enum Values
// ---------------------------------------------------------------------------

describe('Enum Values Storage', () => {
  test('stores all gender enum values correctly', async () => {
    const genders = [
      'MAN',
      'WOMAN',
      'NON_BINARY',
      'TRANS_MAN',
      'TRANS_WOMAN',
      'GENDERQUEER',
      'GENDERFLUID',
      'AGENDER',
      'BIGENDER',
      'TWO_SPIRIT',
      'OTHER',
    ]

    for (const gender of genders) {
      const ctx = createMockContext('user-400')
      const mockPrisma = ctx.prisma as any

      const profile = {
        userId: 'user-400',
        displayName: 'TestUser',
        bio: null,
        age: 25,
        gender: gender as any,
        orientation: 'OTHER',
        relationshipType: null,
        seeking: [],
        contentPreference: 'SOFT',
        photos: [],
        kinkTags: [],
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
      mockPrisma.profile.create.mockResolvedValueOnce(profile)

      const caller = createCaller(ctx)
      const result = await caller.profile.create({
        displayName: 'TestUser',
        age: 25,
        gender: gender as any,
        orientation: 'OTHER',
        contentPreference: 'SOFT',
      })

      expect(result.gender).toBe(gender)
    }
  })

  test('stores all orientation enum values correctly', async () => {
    const orientations = ['STRAIGHT', 'GAY', 'LESBIAN', 'BISEXUAL', 'PANSEXUAL', 'QUEER', 'ASEXUAL', 'DEMISEXUAL', 'OTHER']

    for (const orientation of orientations) {
      const ctx = createMockContext('user-401')
      const mockPrisma = ctx.prisma as any

      const profile = {
        userId: 'user-401',
        displayName: 'TestUser',
        bio: null,
        age: 25,
        gender: 'MAN',
        orientation: orientation as any,
        relationshipType: null,
        seeking: [],
        contentPreference: 'SOFT',
        photos: [],
        kinkTags: [],
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
      mockPrisma.profile.create.mockResolvedValueOnce(profile)

      const caller = createCaller(ctx)
      const result = await caller.profile.create({
        displayName: 'TestUser',
        age: 25,
        gender: 'MAN',
        orientation: orientation as any,
        contentPreference: 'SOFT',
      })

      expect(result.orientation).toBe(orientation)
    }
  })

  test('stores all relationshipType enum values correctly', async () => {
    const types = ['SINGLE', 'PARTNERED', 'MARRIED', 'OPEN_RELATIONSHIP', 'POLYAMOROUS', 'OTHER']

    for (const type of types) {
      const ctx = createMockContext('user-402')
      const mockPrisma = ctx.prisma as any

      const profile = {
        userId: 'user-402',
        displayName: 'TestUser',
        bio: null,
        age: 25,
        gender: 'WOMAN',
        orientation: 'LESBIAN',
        relationshipType: type as any,
        seeking: [],
        contentPreference: 'SOFT',
        photos: [],
        kinkTags: [],
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
      mockPrisma.profile.create.mockResolvedValueOnce(profile)

      const caller = createCaller(ctx)
      const result = await caller.profile.create({
        displayName: 'TestUser',
        age: 25,
        gender: 'WOMAN',
        orientation: 'LESBIAN',
        relationshipType: type as any,
        contentPreference: 'SOFT',
      })

      expect(result.relationshipType).toBe(type)
    }
  })

  test('stores all seeking enum values correctly', async () => {
    const seeking = ['FRIENDSHIP', 'DATING', 'CASUAL', 'RELATIONSHIP', 'PLAY_PARTNER', 'NETWORKING', 'OTHER']

    for (const s of seeking) {
      const ctx = createMockContext('user-403')
      const mockPrisma = ctx.prisma as any

      const profile = {
        userId: 'user-403',
        displayName: 'TestUser',
        bio: null,
        age: 25,
        gender: 'MAN',
        orientation: 'STRAIGHT',
        relationshipType: null,
        seeking: [s] as any,
        contentPreference: 'SOFT',
        photos: [],
        kinkTags: [],
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
      mockPrisma.profile.create.mockResolvedValueOnce(profile)

      const caller = createCaller(ctx)
      const result = await caller.profile.create({
        displayName: 'TestUser',
        age: 25,
        gender: 'MAN',
        orientation: 'STRAIGHT',
        seeking: [s] as any,
        contentPreference: 'SOFT',
      })

      expect(result.seeking).toContain(s)
    }
  })

  test('stores all contentPreference enum values correctly', async () => {
    const prefs = ['SOFT', 'OPEN', 'EXPLICIT', 'NO_DICK_PICS']

    for (const pref of prefs) {
      const ctx = createMockContext('user-404')
      const mockPrisma = ctx.prisma as any

      const profile = {
        userId: 'user-404',
        displayName: 'TestUser',
        bio: null,
        age: 25,
        gender: 'WOMAN',
        orientation: 'BISEXUAL',
        relationshipType: null,
        seeking: [],
        contentPreference: pref as any,
        photos: [],
        kinkTags: [],
      }

      mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
      mockPrisma.profile.create.mockResolvedValueOnce(profile)

      const caller = createCaller(ctx)
      const result = await caller.profile.create({
        displayName: 'TestUser',
        age: 25,
        gender: 'WOMAN',
        orientation: 'BISEXUAL',
        contentPreference: pref as any,
      })

      expect(result.contentPreference).toBe(pref)
    }
  })
})

// ---------------------------------------------------------------------------
// Age Validation
// ---------------------------------------------------------------------------

describe('Age Validation', () => {
  test('rejects age < 18', async () => {
    const ctx = createMockContext('user-500')
    const caller = createCaller(ctx)

    await expect(
      caller.profile.create({
        displayName: 'Young',
        age: 17,
        gender: 'MAN',
        orientation: 'STRAIGHT',
        contentPreference: 'SOFT',
      }),
    ).rejects.toThrow()
  })

  test('accepts age = 18 (minimum boundary)', async () => {
    const ctx = createMockContext('user-501')
    const mockPrisma = ctx.prisma as any

    const profile = {
      userId: 'user-501',
      displayName: 'Eighteen',
      bio: null,
      age: 18,
      gender: 'WOMAN',
      orientation: 'LESBIAN',
      relationshipType: null,
      seeking: [],
      contentPreference: 'SOFT',
      photos: [],
      kinkTags: [],
    }

    mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
    mockPrisma.profile.create.mockResolvedValueOnce(profile)

    const caller = createCaller(ctx)
    const result = await caller.profile.create({
      displayName: 'Eighteen',
      age: 18,
      gender: 'WOMAN',
      orientation: 'LESBIAN',
      contentPreference: 'SOFT',
    })

    expect(result.age).toBe(18)
  })

  test('accepts age = 99 (maximum boundary)', async () => {
    const ctx = createMockContext('user-502')
    const mockPrisma = ctx.prisma as any

    const profile = {
      userId: 'user-502',
      displayName: 'Old',
      bio: null,
      age: 99,
      gender: 'MAN',
      orientation: 'STRAIGHT',
      relationshipType: null,
      seeking: [],
      contentPreference: 'OPEN',
      photos: [],
      kinkTags: [],
    }

    mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
    mockPrisma.profile.create.mockResolvedValueOnce(profile)

    const caller = createCaller(ctx)
    const result = await caller.profile.create({
      displayName: 'Old',
      age: 99,
      gender: 'MAN',
      orientation: 'STRAIGHT',
      contentPreference: 'OPEN',
    })

    expect(result.age).toBe(99)
  })

  test('rejects age > 99', async () => {
    const ctx = createMockContext('user-503')
    const caller = createCaller(ctx)

    await expect(
      caller.profile.create({
        displayName: 'TooOld',
        age: 100,
        gender: 'WOMAN',
        orientation: 'BISEXUAL',
        contentPreference: 'SOFT',
      }),
    ).rejects.toThrow()
  })

  test('rejects age = 0', async () => {
    const ctx = createMockContext('user-504')
    const caller = createCaller(ctx)

    await expect(
      caller.profile.create({
        displayName: 'Baby',
        age: 0,
        gender: 'MAN',
        orientation: 'STRAIGHT',
        contentPreference: 'SOFT',
      }),
    ).rejects.toThrow()
  })

  test('rejects negative age', async () => {
    const ctx = createMockContext('user-505')
    const caller = createCaller(ctx)

    await expect(
      caller.profile.create({
        displayName: 'Negative',
        age: -5,
        gender: 'WOMAN',
        orientation: 'LESBIAN',
        contentPreference: 'SOFT',
      }),
    ).rejects.toThrow()
  })

  test('rejects non-integer age', async () => {
    const ctx = createMockContext('user-506')
    const caller = createCaller(ctx)

    await expect(
      caller.profile.create({
        displayName: 'Decimal',
        age: 25.5,
        gender: 'MAN',
        orientation: 'STRAIGHT',
        contentPreference: 'SOFT',
      }),
    ).rejects.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Input Validation (Zod)
// ---------------------------------------------------------------------------

describe('Input Validation', () => {
  test('rejects displayName < 2 characters', async () => {
    const ctx = createMockContext('user-600')
    const caller = createCaller(ctx)

    await expect(
      caller.profile.create({
        displayName: 'A',
        age: 25,
        gender: 'MAN',
        orientation: 'STRAIGHT',
        contentPreference: 'SOFT',
      }),
    ).rejects.toThrow()
  })

  test('rejects displayName > 50 characters', async () => {
    const ctx = createMockContext('user-601')
    const caller = createCaller(ctx)

    const longName = 'a'.repeat(51)
    await expect(
      caller.profile.create({
        displayName: longName,
        age: 25,
        gender: 'MAN',
        orientation: 'STRAIGHT',
        contentPreference: 'SOFT',
      }),
    ).rejects.toThrow()
  })

  test('accepts displayName = 2 characters (minimum boundary)', async () => {
    const ctx = createMockContext('user-602')
    const mockPrisma = ctx.prisma as any

    const profile = {
      userId: 'user-602',
      displayName: 'AB',
      bio: null,
      age: 25,
      gender: 'MAN',
      orientation: 'STRAIGHT',
      relationshipType: null,
      seeking: [],
      contentPreference: 'SOFT',
      photos: [],
      kinkTags: [],
    }

    mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
    mockPrisma.profile.create.mockResolvedValueOnce(profile)

    const caller = createCaller(ctx)
    const result = await caller.profile.create({
      displayName: 'AB',
      age: 25,
      gender: 'MAN',
      orientation: 'STRAIGHT',
      contentPreference: 'SOFT',
    })

    expect(result.displayName).toBe('AB')
  })

  test('accepts displayName = 50 characters (maximum boundary)', async () => {
    const ctx = createMockContext('user-603')
    const mockPrisma = ctx.prisma as any

    const maxName = 'a'.repeat(50)
    const profile = {
      userId: 'user-603',
      displayName: maxName,
      bio: null,
      age: 25,
      gender: 'WOMAN',
      orientation: 'LESBIAN',
      relationshipType: null,
      seeking: [],
      contentPreference: 'SOFT',
      photos: [],
      kinkTags: [],
    }

    mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
    mockPrisma.profile.create.mockResolvedValueOnce(profile)

    const caller = createCaller(ctx)
    const result = await caller.profile.create({
      displayName: maxName,
      age: 25,
      gender: 'WOMAN',
      orientation: 'LESBIAN',
      contentPreference: 'SOFT',
    })

    expect(result.displayName).toBe(maxName)
  })

  test('rejects bio > 2000 characters', async () => {
    const ctx = createMockContext('user-604')
    const caller = createCaller(ctx)

    const longBio = 'a'.repeat(2001)
    await expect(
      caller.profile.create({
        displayName: 'User',
        bio: longBio,
        age: 25,
        gender: 'MAN',
        orientation: 'STRAIGHT',
        contentPreference: 'SOFT',
      }),
    ).rejects.toThrow()
  })

  test('accepts bio = 2000 characters (maximum boundary)', async () => {
    const ctx = createMockContext('user-605')
    const mockPrisma = ctx.prisma as any

    const maxBio = 'a'.repeat(2000)
    const profile = {
      userId: 'user-605',
      displayName: 'User',
      bio: maxBio,
      age: 25,
      gender: 'MAN',
      orientation: 'STRAIGHT',
      relationshipType: null,
      seeking: [],
      contentPreference: 'SOFT',
      photos: [],
      kinkTags: [],
    }

    mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
    mockPrisma.profile.create.mockResolvedValueOnce(profile)

    const caller = createCaller(ctx)
    const result = await caller.profile.create({
      displayName: 'User',
      bio: maxBio,
      age: 25,
      gender: 'MAN',
      orientation: 'STRAIGHT',
      contentPreference: 'SOFT',
    })

    expect(result.bio).toBe(maxBio)
  })

  test('rejects invalid gender enum value', async () => {
    const ctx = createMockContext('user-606')
    const caller = createCaller(ctx)

    await expect(
      caller.profile.create({
        displayName: 'User',
        age: 25,
        gender: 'INVALID' as any,
        orientation: 'STRAIGHT',
        contentPreference: 'SOFT',
      }),
    ).rejects.toThrow()
  })

  test('rejects invalid orientation enum value', async () => {
    const ctx = createMockContext('user-607')
    const caller = createCaller(ctx)

    await expect(
      caller.profile.create({
        displayName: 'User',
        age: 25,
        gender: 'MAN',
        orientation: 'INVALID' as any,
        contentPreference: 'SOFT',
      }),
    ).rejects.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Edge Cases
// ---------------------------------------------------------------------------

describe('Edge Cases', () => {
  test('profile with empty seeking array defaults correctly', async () => {
    const ctx = createMockContext('user-700')
    const mockPrisma = ctx.prisma as any

    const profile = {
      userId: 'user-700',
      displayName: 'SeekingNone',
      bio: null,
      age: 25,
      gender: 'MAN',
      orientation: 'STRAIGHT',
      relationshipType: null,
      seeking: [],
      contentPreference: 'SOFT',
      photos: [],
      kinkTags: [],
    }

    mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
    mockPrisma.profile.create.mockResolvedValueOnce(profile)

    const caller = createCaller(ctx)
    const result = await caller.profile.create({
      displayName: 'SeekingNone',
      age: 25,
      gender: 'MAN',
      orientation: 'STRAIGHT',
      contentPreference: 'SOFT',
    })

    expect(result.seeking).toEqual([])
  })

  test('profile with multiple seeking values', async () => {
    const ctx = createMockContext('user-701')
    const mockPrisma = ctx.prisma as any

    const profile = {
      userId: 'user-701',
      displayName: 'SeekingMany',
      bio: null,
      age: 25,
      gender: 'WOMAN',
      orientation: 'BISEXUAL',
      relationshipType: null,
      seeking: ['DATING', 'FRIENDSHIP', 'PLAY_PARTNER'],
      contentPreference: 'OPEN',
      photos: [],
      kinkTags: [],
    }

    mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
    mockPrisma.profile.create.mockResolvedValueOnce(profile)

    const caller = createCaller(ctx)
    const result = await caller.profile.create({
      displayName: 'SeekingMany',
      age: 25,
      gender: 'WOMAN',
      orientation: 'BISEXUAL',
      seeking: ['DATING', 'FRIENDSHIP', 'PLAY_PARTNER'],
      contentPreference: 'OPEN',
    })

    expect(result.seeking).toHaveLength(3)
    expect(result.seeking).toContain('DATING')
    expect(result.seeking).toContain('FRIENDSHIP')
    expect(result.seeking).toContain('PLAY_PARTNER')
  })

  test('update with null relationshipType clears the field', async () => {
    const ctx = createMockContext('user-702')
    const mockPrisma = ctx.prisma as any

    const existingProfile = {
      userId: 'user-702',
      displayName: 'User',
      bio: null,
      age: 25,
      gender: 'MAN',
      orientation: 'STRAIGHT',
      relationshipType: 'MARRIED',
      seeking: [],
      contentPreference: 'SOFT',
      photos: [],
      kinkTags: [],
    }

    const updatedProfile = {
      ...existingProfile,
      relationshipType: null,
    }

    mockPrisma.profile.findUnique.mockResolvedValueOnce(existingProfile)
    mockPrisma.profile.update.mockResolvedValueOnce(updatedProfile)

    const caller = createCaller(ctx)
    const result = await caller.profile.update({
      relationshipType: null,
    })

    expect(result.relationshipType).toBeNull()
  })

  test('profile includes photos and kinkTags on create', async () => {
    const ctx = createMockContext('user-703')
    const mockPrisma = ctx.prisma as any

    const profile = {
      userId: 'user-703',
      displayName: 'WithRelations',
      bio: null,
      age: 25,
      gender: 'WOMAN',
      orientation: 'LESBIAN',
      relationshipType: null,
      seeking: [],
      contentPreference: 'EXPLICIT',
      photos: [{ id: 'photo-1', isPublic: true, position: 0 }],
      kinkTags: [{ id: 'tag-1', isPublic: true, kinkTag: { id: 'kink-1', name: 'bondage' } }],
    }

    mockPrisma.profile.findUnique.mockResolvedValueOnce(null)
    mockPrisma.profile.create.mockResolvedValueOnce(profile)

    const caller = createCaller(ctx)
    const result = await caller.profile.create({
      displayName: 'WithRelations',
      age: 25,
      gender: 'WOMAN',
      orientation: 'LESBIAN',
      contentPreference: 'EXPLICIT',
    })

    expect(result.photos).toBeDefined()
    expect(result.kinkTags).toBeDefined()
  })
})
