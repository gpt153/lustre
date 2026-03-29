// Environment variables must be set before importing modules that read them.
process.env.JWT_SECRET = 'test-secret-key-at-least-32-chars-long!!'
process.env.ENCRYPTION_KEY = 'aa'.repeat(32) // 64 hex chars = 32 bytes

import { describe, test, expect, beforeEach, vi } from 'vitest'

// Mock R2 before importing router
vi.mock('../lib/r2.js', () => ({
  uploadToR2: vi.fn(async (key: string) => {
    return `https://example.r2.com/${key}`
  }),
  deleteFromR2: vi.fn(async () => {}),
  getPhotoKey: (profileId: string, photoId: string, size: string) => {
    return `profiles/${profileId}/photos/${photoId}/${size}.webp`
  },
}))

vi.mock('../lib/image.js', () => ({
  processImage: vi.fn(async (input: Buffer) => {
    return {
      original: Buffer.from('original'),
      small: Buffer.from('small'),
      medium: Buffer.from('medium'),
      large: Buffer.from('large'),
    }
  }),
}))

vi.mock('../lib/meilisearch.js', () => {
  const mockIndex = {
    search: vi.fn(async (query: string, opts?: any) => {
      return {
        hits: [],
        estimatedTotalHits: 0,
      }
    }),
    addDocuments: vi.fn(async () => {}),
    deleteDocument: vi.fn(async () => {}),
  }

  return {
    meili: {
      index: vi.fn(() => mockIndex),
    },
    PROFILE_INDEX: 'profiles',
    indexProfile: vi.fn(async () => {}),
    removeProfileFromIndex: vi.fn(async () => {}),
  }
})

import { appRouter } from '../trpc/router.js'
import type { Context } from '../trpc/context.js'

// ---------------------------------------------------------------------------
// Wave 3 - Pair Linking Backend Tests
// ---------------------------------------------------------------------------

describe('Wave 3 - Pair Linking Backend', () => {
  let mockContext: Context
  let mockContextRecipient: Context

  const userId1 = '550e8400-e29b-41d4-a716-446655440001'
  const userId2 = '550e8400-e29b-41d4-a716-446655440002'
  const userId3 = '550e8400-e29b-41d4-a716-446655440003'
  const userId4 = '550e8400-e29b-41d4-a716-446655440004'
  const userId5 = '550e8400-e29b-41d4-a716-446655440005'
  const userId6 = '550e8400-e29b-41d4-a716-446655440006'

  const profileId1 = '550e8400-e29b-41d4-a716-446655440101'
  const profileId2 = '550e8400-e29b-41d4-a716-446655440102'
  const profileId3 = '550e8400-e29b-41d4-a716-446655440103'
  const profileId4 = '550e8400-e29b-41d4-a716-446655440104'
  const profileId5 = '550e8400-e29b-41d4-a716-446655440105'
  const profileId6 = '550e8400-e29b-41d4-a716-446655440106'

  const pairLinkId1 = '550e8400-e29b-41d4-a716-446655440201'

  const invitationId1 = '550e8400-e29b-41d4-a716-446655440301'

  beforeEach(() => {
    mockContext = {
      userId: userId1,
      sessionId: 'session-1',
      clientVersion: null,
      req: {} as any,
      res: {} as any,
      prisma: {
        profile: {
          findUnique: vi.fn(),
        },
        pairInvitation: {
          findFirst: vi.fn(),
          findUnique: vi.fn(),
          findMany: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
        pairLinkMember: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
          create: vi.fn(),
          createMany: vi.fn(),
          delete: vi.fn(),
        },
        pairLink: {
          create: vi.fn(),
          delete: vi.fn(),
        },
        $transaction: vi.fn(),
      } as any,
      redis: {} as any,
    }

    mockContextRecipient = {
      userId: userId2,
      sessionId: 'session-2',
      clientVersion: null,
      req: {} as any,
      res: {} as any,
      prisma: {
        profile: {
          findUnique: vi.fn(),
        },
        pairInvitation: {
          findFirst: vi.fn(),
          findUnique: vi.fn(),
          findMany: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
        pairLinkMember: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
          create: vi.fn(),
          createMany: vi.fn(),
          delete: vi.fn(),
        },
        pairLink: {
          create: vi.fn(),
          delete: vi.fn(),
        },
        $transaction: vi.fn(),
      } as any,
      redis: {} as any,
    }
  })

  // =========================================================================
  // 1. PAIR INVITATION - Create invitation, verify PENDING status
  // =========================================================================

  describe('1. Pair Invitation - Create and PENDING Status', () => {
    test('creates a pair invitation with PENDING status', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      const myProfile = {
        id: profileId1,
        userId: userId1,
        displayName: 'User One',
      }

      const targetProfile = {
        id: profileId2,
        userId: userId2,
        displayName: 'User Two',
      }

      const invitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId2,
        status: 'PENDING',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.profile.findUnique.mockResolvedValueOnce(targetProfile)
      prisma.pairInvitation.findFirst.mockResolvedValueOnce(null)
      prisma.pairLinkMember.findFirst.mockResolvedValueOnce(null)
      prisma.pairInvitation.create.mockResolvedValueOnce(invitation)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.pair.invite({ toUserId: userId2 })

      expect(result.status).toBe('PENDING')
      expect(result.fromProfileId).toBe(profileId1)
      expect(result.toProfileId).toBe(profileId2)
      expect(result.expiresAt).toBeInstanceOf(Date)
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    test('invitation expires in 48 hours', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId1, userId: userId1, displayName: 'User One' }
      const targetProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      const now = Date.now()
      const expiresAt = new Date(now + 48 * 60 * 60 * 1000)

      const invitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId2,
        status: 'PENDING',
        createdAt: new Date(now),
        expiresAt,
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.profile.findUnique.mockResolvedValueOnce(targetProfile)
      prisma.pairInvitation.findFirst.mockResolvedValueOnce(null)
      prisma.pairLinkMember.findFirst.mockResolvedValueOnce(null)
      prisma.pairInvitation.create.mockResolvedValueOnce(invitation)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.pair.invite({ toUserId: userId2 })

      const expirationDiff = result.expiresAt.getTime() - result.createdAt.getTime()
      const expectedDiff = 48 * 60 * 60 * 1000
      expect(expirationDiff).toBe(expectedDiff)
    })
  })

  // =========================================================================
  // 2. PAIR RESPOND ACCEPT - Accept invitation, verify PairLink + PairLinkMember created
  // =========================================================================

  describe('2. Pair Respond Accept - Accept Invitation', () => {
    test('accepts invitation and creates PairLink with both members', async () => {
      const ctx = mockContextRecipient
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      const invitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId2,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }

      const pairLink = { id: pairLinkId1, createdAt: new Date() }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairInvitation.findUnique.mockResolvedValueOnce(invitation)

      // Mock transaction callback
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          pairInvitation: {
            update: vi.fn(),
          },
          pairLinkMember: {
            findFirst: vi.fn().mockResolvedValueOnce(null),
            create: vi.fn(),
            createMany: vi.fn(),
          },
          pairLink: {
            create: vi.fn().mockResolvedValueOnce(pairLink),
          },
        })
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.pair.respond({ invitationId: invitationId1, accept: true })

      expect(result.success).toBe(true)
      expect(result.linked).toBe(true)
      expect(prisma.$transaction).toHaveBeenCalled()
    })

    test('adds acceptor to existing PairLink if inviter is already in one', async () => {
      const ctx = mockContextRecipient
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      const invitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId2,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }

      const existingMembership = {
        id: 'member-1',
        profileId: profileId1,
        pairLinkId: pairLinkId1,
        pairLink: {
          id: pairLinkId1,
          members: [
            { id: 'member-1', profileId: profileId1 },
            { id: 'member-3', profileId: profileId3 },
          ],
        },
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairInvitation.findUnique.mockResolvedValueOnce(invitation)

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          pairInvitation: {
            update: vi.fn(),
          },
          pairLinkMember: {
            findFirst: vi.fn().mockResolvedValueOnce(existingMembership),
            create: vi.fn(),
          },
        })
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.pair.respond({ invitationId: invitationId1, accept: true })

      expect(result.success).toBe(true)
      expect(result.linked).toBe(true)
    })
  })

  // =========================================================================
  // 3. PAIR RESPOND DECLINE - Decline invitation, verify status DECLINED
  // =========================================================================

  describe('3. Pair Respond Decline - Decline Invitation', () => {
    test('declines invitation and sets status to DECLINED', async () => {
      const ctx = mockContextRecipient
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      const invitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId2,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }

      const declinedInvitation = { ...invitation, status: 'DECLINED' }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairInvitation.findUnique.mockResolvedValueOnce(invitation)
      prisma.pairInvitation.update.mockResolvedValueOnce(declinedInvitation)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.pair.respond({ invitationId: invitationId1, accept: false })

      expect(result.success).toBe(true)
      expect(result.linked).toBe(false)
      expect(prisma.pairInvitation.update).toHaveBeenCalledWith({
        where: { id: invitationId1 },
        data: { status: 'DECLINED' },
      })
    })
  })

  // =========================================================================
  // 4. PAIR LEAVE - Leave pair link, verify removed
  // =========================================================================

  describe('4. Pair Leave - Leave Pair Link', () => {
    test('removes user from pair link (multi-member)', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId1, userId: userId1, displayName: 'User One' }

      const membership = {
        id: 'member-1',
        profileId: profileId1,
        pairLinkId: pairLinkId1,
        pairLink: {
          id: pairLinkId1,
          members: [
            { id: 'member-1', profileId: profileId1 },
            { id: 'member-2', profileId: profileId2 },
            { id: 'member-3', profileId: profileId3 },
          ],
        },
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairLinkMember.findFirst.mockResolvedValueOnce(membership)

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          pairLinkMember: {
            delete: vi.fn(),
          },
        })
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.pair.leave({ pairLinkId: pairLinkId1 })

      expect(result.success).toBe(true)
      expect(prisma.$transaction).toHaveBeenCalled()
    })

    test('deletes pair link when only 1 member remains (after deletion)', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId1, userId: userId1, displayName: 'User One' }

      const membership = {
        id: 'member-1',
        profileId: profileId1,
        pairLinkId: pairLinkId1,
        pairLink: {
          id: pairLinkId1,
          members: [
            { id: 'member-1', profileId: profileId1 },
            { id: 'member-2', profileId: profileId2 },
          ],
        },
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairLinkMember.findFirst.mockResolvedValueOnce(membership)

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          pairLinkMember: {
            delete: vi.fn(),
          },
          pairLink: {
            delete: vi.fn(),
          },
        })
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.pair.leave({ pairLinkId: pairLinkId1 })

      expect(result.success).toBe(true)
    })

    test('throws NOT_FOUND when user is not a member', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId1, userId: userId1, displayName: 'User One' }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairLinkMember.findFirst.mockResolvedValueOnce(null)

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.leave({ pairLinkId: pairLinkId1 })
        expect.fail('Should have thrown NOT_FOUND error')
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND')
        expect(error.message).toBe('Not a member of this pair link')
      }
    })
  })

  // =========================================================================
  // 5. MAX 5 PAIR MEMBERS - Attempt to add 6th, expect error
  // =========================================================================

  describe('5. Max 5 Pair Members - Enforce Limit', () => {
    test('rejects 6th member with BAD_REQUEST error', async () => {
      const ctx = mockContextRecipient
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId6, userId: userId6, displayName: 'User Six' }

      const invitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId6,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }

      const existingMembership = {
        id: 'member-1',
        profileId: profileId1,
        pairLinkId: pairLinkId1,
        pairLink: {
          id: pairLinkId1,
          members: [
            { id: 'member-1', profileId: profileId1 },
            { id: 'member-2', profileId: profileId2 },
            { id: 'member-3', profileId: profileId3 },
            { id: 'member-4', profileId: profileId4 },
            { id: 'member-5', profileId: profileId5 },
          ],
        },
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairInvitation.findUnique.mockResolvedValueOnce(invitation)

      prisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          pairInvitation: {
            update: vi.fn(),
          },
          pairLinkMember: {
            findFirst: vi.fn().mockResolvedValueOnce(existingMembership),
          },
        }
        return callback(mockTx)
      })

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.respond({ invitationId: invitationId1, accept: true })
        expect.fail('Should have thrown BAD_REQUEST error')
      } catch (error: any) {
        expect(error.code).toBe('BAD_REQUEST')
        expect(error.message).toBe('Pair link has maximum 5 members')
      }
    })

    test('allows 5th member successfully', async () => {
      const ctx = mockContextRecipient
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId5, userId: userId5, displayName: 'User Five' }

      const invitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId5,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }

      const existingMembership = {
        id: 'member-1',
        profileId: profileId1,
        pairLinkId: pairLinkId1,
        pairLink: {
          id: pairLinkId1,
          members: [
            { id: 'member-1', profileId: profileId1 },
            { id: 'member-2', profileId: profileId2 },
            { id: 'member-3', profileId: profileId3 },
            { id: 'member-4', profileId: profileId4 },
          ],
        },
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairInvitation.findUnique.mockResolvedValueOnce(invitation)

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          pairInvitation: {
            update: vi.fn(),
          },
          pairLinkMember: {
            findFirst: vi.fn().mockResolvedValueOnce(existingMembership),
            create: vi.fn(),
          },
        })
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.pair.respond({ invitationId: invitationId1, accept: true })

      expect(result.success).toBe(true)
      expect(result.linked).toBe(true)
    })
  })

  // =========================================================================
  // 6. SELF-INVITE PREVENTION - Cannot invite yourself
  // =========================================================================

  describe('6. Self-Invite Prevention', () => {
    test('rejects self-invite with BAD_REQUEST error', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId1, userId: userId1, displayName: 'User One' }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.invite({ toUserId: userId1 })
        expect.fail('Should have thrown BAD_REQUEST error')
      } catch (error: any) {
        expect(error.code).toBe('BAD_REQUEST')
        expect(error.message).toBe('Cannot invite yourself')
      }
    })
  })

  // =========================================================================
  // 7. DUPLICATE INVITE PREVENTION - Cannot send duplicate pending invite
  // =========================================================================

  describe('7. Duplicate Invite Prevention', () => {
    test('rejects duplicate pending invitation with CONFLICT error', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId1, userId: userId1, displayName: 'User One' }
      const targetProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      const existingInvitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId2,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.profile.findUnique.mockResolvedValueOnce(targetProfile)
      prisma.pairInvitation.findFirst.mockResolvedValueOnce(existingInvitation)

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.invite({ toUserId: userId2 })
        expect.fail('Should have thrown CONFLICT error')
      } catch (error: any) {
        expect(error.code).toBe('CONFLICT')
        expect(error.message).toBe('Invitation already pending')
      }
    })

    test('allows new invite after previous was declined', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId1, userId: userId1, displayName: 'User One' }
      const targetProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      const declinedInvitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId2,
        status: 'DECLINED',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }

      const newInvitation = {
        id: '550e8400-e29b-41d4-a716-446655440302',
        fromProfileId: profileId1,
        toProfileId: profileId2,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.profile.findUnique.mockResolvedValueOnce(targetProfile)
      prisma.pairInvitation.findFirst.mockResolvedValueOnce(null)
      prisma.pairLinkMember.findFirst.mockResolvedValueOnce(null)
      prisma.pairInvitation.create.mockResolvedValueOnce(newInvitation)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.pair.invite({ toUserId: userId2 })

      expect(result.status).toBe('PENDING')
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440302')
    })
  })

  // =========================================================================
  // 8. EXPIRED INVITATION - Cannot accept expired invitation
  // =========================================================================

  describe('8. Expired Invitation - Prevent Accepting Expired Invites', () => {
    test('rejects expired invitation with BAD_REQUEST error', async () => {
      const ctx = mockContextRecipient
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      const expiredInvitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId2,
        status: 'PENDING',
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      }

      const updatedExpiredInvitation = { ...expiredInvitation, status: 'EXPIRED' }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairInvitation.findUnique.mockResolvedValueOnce(expiredInvitation)
      prisma.pairInvitation.update.mockResolvedValueOnce(updatedExpiredInvitation)

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.respond({ invitationId: invitationId1, accept: true })
        expect.fail('Should have thrown BAD_REQUEST error')
      } catch (error: any) {
        expect(error.code).toBe('BAD_REQUEST')
        expect(error.message).toBe('Invitation has expired')
      }
    })

    test('marks invitation as EXPIRED when past expiresAt', async () => {
      const ctx = mockContextRecipient
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      const expiredInvitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId2,
        status: 'PENDING',
        expiresAt: new Date(Date.now() - 1000),
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairInvitation.findUnique.mockResolvedValueOnce(expiredInvitation)
      prisma.pairInvitation.update.mockResolvedValueOnce({ ...expiredInvitation, status: 'EXPIRED' })

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.respond({ invitationId: invitationId1, accept: true })
      } catch (error: any) {
        // Expected to throw
      }

      expect(prisma.pairInvitation.update).toHaveBeenCalledWith({
        where: { id: invitationId1 },
        data: { status: 'EXPIRED' },
      })
    })

    test('accepts invitation just before expiration', async () => {
      const ctx = mockContextRecipient
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      const futureExpiresAt = new Date(Date.now() + 1000) // Expires in 1 second

      const invitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId2,
        status: 'PENDING',
        expiresAt: futureExpiresAt,
      }

      const pairLink = { id: pairLinkId1, createdAt: new Date() }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairInvitation.findUnique.mockResolvedValueOnce(invitation)

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          pairInvitation: {
            update: vi.fn(),
          },
          pairLinkMember: {
            findFirst: vi.fn().mockResolvedValueOnce(null),
            create: vi.fn(),
            createMany: vi.fn(),
          },
          pairLink: {
            create: vi.fn().mockResolvedValueOnce(pairLink),
          },
        })
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.pair.respond({ invitationId: invitationId1, accept: true })

      expect(result.success).toBe(true)
      expect(result.linked).toBe(true)
    })
  })

  // =========================================================================
  // 9. ALREADY LINKED PREVENTION - Cannot re-link with same user
  // =========================================================================

  describe('9. Already Linked Prevention', () => {
    test('rejects invitation from already-linked user with CONFLICT error', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId1, userId: userId1, displayName: 'User One' }
      const targetProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      const alreadyLinked = {
        id: 'member-1',
        profileId: profileId1,
        pairLinkId: pairLinkId1,
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.profile.findUnique.mockResolvedValueOnce(targetProfile)
      prisma.pairInvitation.findFirst.mockResolvedValueOnce(null)
      prisma.pairLinkMember.findFirst.mockResolvedValueOnce(alreadyLinked)

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.invite({ toUserId: userId2 })
        expect.fail('Should have thrown CONFLICT error')
      } catch (error: any) {
        expect(error.code).toBe('CONFLICT')
        expect(error.message).toBe('Already linked with this user')
      }
    })
  })

  // =========================================================================
  // ADDITIONAL TESTS - getMyLinks, getPendingInvitations
  // =========================================================================

  describe('Additional - Query Pair Data', () => {
    test('getMyLinks returns all pair links for user', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId1, userId: userId1, displayName: 'User One' }

      const memberships = [
        {
          id: 'member-1',
          profileId: profileId1,
          pairLinkId: pairLinkId1,
          joinedAt: new Date(),
          pairLink: {
            id: pairLinkId1,
            members: [
              {
                id: 'member-1',
                profileId: profileId1,
                profile: {
                  id: profileId1,
                  userId: userId1,
                  displayName: 'User One',
                  photos: [],
                },
              },
              {
                id: 'member-2',
                profileId: profileId2,
                profile: {
                  id: profileId2,
                  userId: userId2,
                  displayName: 'User Two',
                  photos: [{ thumbnailSmall: 'https://example.com/thumb.webp' }],
                },
              },
            ],
          },
        },
      ]

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairLinkMember.findMany.mockResolvedValueOnce(memberships)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.pair.getMyLinks()

      expect(result).toHaveLength(1)
      expect(result[0].pairLinkId).toBe(pairLinkId1)
      expect(result[0].members).toHaveLength(2)
      expect(result[0].members[0].displayName).toBe('User One')
      expect(result[0].members[1].displayName).toBe('User Two')
    })

    test('getPendingInvitations returns only pending invites', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId1, userId: userId1, displayName: 'User One' }

      const pendingInvites = [
        {
          id: invitationId1,
          fromProfileId: profileId2,
          toProfileId: profileId1,
          status: 'PENDING',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
          fromProfile: {
            displayName: 'User Two',
            userId: userId2,
            photos: [{ thumbnailSmall: 'https://example.com/thumb2.webp' }],
          },
        },
      ]

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairInvitation.findMany.mockResolvedValueOnce(pendingInvites)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.pair.getPendingInvitations()

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('PENDING')
      expect(result[0].fromProfile.displayName).toBe('User Two')
    })
  })

  // =========================================================================
  // AUTHENTICATION CHECKS
  // =========================================================================

  describe('Authentication Checks', () => {
    test('invite requires authentication', async () => {
      const ctx = { ...mockContext, userId: null }
      const caller = appRouter.createCaller(ctx)

      await expect(caller.pair.invite({ toUserId: userId2 })).rejects.toThrow('Authentication required')
    })

    test('respond requires authentication', async () => {
      const ctx = { ...mockContext, userId: null }
      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.pair.respond({ invitationId: invitationId1, accept: true })
      ).rejects.toThrow('Authentication required')
    })

    test('leave requires authentication', async () => {
      const ctx = { ...mockContext, userId: null }
      const caller = appRouter.createCaller(ctx)

      await expect(caller.pair.leave({ pairLinkId: pairLinkId1 })).rejects.toThrow('Authentication required')
    })

    test('getMyLinks requires authentication', async () => {
      const ctx = { ...mockContext, userId: null }
      const caller = appRouter.createCaller(ctx)

      await expect(caller.pair.getMyLinks()).rejects.toThrow('Authentication required')
    })

    test('getPendingInvitations requires authentication', async () => {
      const ctx = { ...mockContext, userId: null }
      const caller = appRouter.createCaller(ctx)

      await expect(caller.pair.getPendingInvitations()).rejects.toThrow('Authentication required')
    })
  })

  // =========================================================================
  // PROFILE NOT FOUND CHECKS
  // =========================================================================

  describe('Profile Not Found Checks', () => {
    test('invite throws NOT_FOUND when sender profile not found', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      prisma.profile.findUnique.mockResolvedValueOnce(null)

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.invite({ toUserId: userId2 })
        expect.fail('Should have thrown NOT_FOUND error')
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND')
        expect(error.message).toBe('Your profile not found')
      }
    })

    test('invite throws NOT_FOUND when target profile not found', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId1, userId: userId1, displayName: 'User One' }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.profile.findUnique.mockResolvedValueOnce(null)

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.invite({ toUserId: userId2 })
        expect.fail('Should have thrown NOT_FOUND error')
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND')
        expect(error.message).toBe('Target profile not found')
      }
    })

    test('respond throws NOT_FOUND when profile not found', async () => {
      const ctx = mockContextRecipient
      const prisma = ctx.prisma as any

      prisma.profile.findUnique.mockResolvedValueOnce(null)

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.respond({ invitationId: invitationId1, accept: true })
        expect.fail('Should have thrown NOT_FOUND error')
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND')
      }
    })

    test('respond throws NOT_FOUND when invitation not found', async () => {
      const ctx = mockContextRecipient
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairInvitation.findUnique.mockResolvedValueOnce(null)

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.respond({ invitationId: invitationId1, accept: true })
        expect.fail('Should have thrown NOT_FOUND error')
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND')
      }
    })

    test('respond throws NOT_FOUND when invitation belongs to different user', async () => {
      const ctx = mockContextRecipient
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      const invitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId3, // Different recipient!
        status: 'PENDING',
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairInvitation.findUnique.mockResolvedValueOnce(invitation)

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.respond({ invitationId: invitationId1, accept: true })
        expect.fail('Should have thrown NOT_FOUND error')
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND')
      }
    })

    test('leave throws NOT_FOUND when profile not found', async () => {
      const ctx = mockContext
      const prisma = ctx.prisma as any

      prisma.profile.findUnique.mockResolvedValueOnce(null)

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.leave({ pairLinkId: pairLinkId1 })
        expect.fail('Should have thrown NOT_FOUND error')
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND')
      }
    })
  })

  // =========================================================================
  // INVITATION STATUS CHECKS
  // =========================================================================

  describe('Invitation Status Checks', () => {
    test('respond throws BAD_REQUEST when invitation already accepted', async () => {
      const ctx = mockContextRecipient
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      const acceptedInvitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId2,
        status: 'ACCEPTED',
        expiresAt: new Date(),
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairInvitation.findUnique.mockResolvedValueOnce(acceptedInvitation)

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.respond({ invitationId: invitationId1, accept: true })
        expect.fail('Should have thrown BAD_REQUEST error')
      } catch (error: any) {
        expect(error.code).toBe('BAD_REQUEST')
        expect(error.message).toBe('Invitation already responded to')
      }
    })

    test('respond throws BAD_REQUEST when invitation already declined', async () => {
      const ctx = mockContextRecipient
      const prisma = ctx.prisma as any

      const myProfile = { id: profileId2, userId: userId2, displayName: 'User Two' }

      const declinedInvitation = {
        id: invitationId1,
        fromProfileId: profileId1,
        toProfileId: profileId2,
        status: 'DECLINED',
        expiresAt: new Date(),
      }

      prisma.profile.findUnique.mockResolvedValueOnce(myProfile)
      prisma.pairInvitation.findUnique.mockResolvedValueOnce(declinedInvitation)

      const caller = appRouter.createCaller(ctx)

      try {
        await caller.pair.respond({ invitationId: invitationId1, accept: true })
        expect.fail('Should have thrown BAD_REQUEST error')
      } catch (error: any) {
        expect(error.code).toBe('BAD_REQUEST')
        expect(error.message).toBe('Invitation already responded to')
      }
    })
  })
})
