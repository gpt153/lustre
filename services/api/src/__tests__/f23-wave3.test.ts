// Environment variables must be set before importing modules that read them.
process.env.JWT_SECRET = 'test-secret-key-at-least-32-chars-long!!'
process.env.ENCRYPTION_KEY = 'aa'.repeat(32) // 64 hex chars = 32 bytes

import { describe, test, expect, beforeEach, vi } from 'vitest'

// Mock external dependencies required by various routers
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

vi.mock('../lib/segpay.js', () => ({
  tokenizeCard: vi.fn(async () => ({
    cardToken: 'card-token-123',
    last4: '4242',
    brand: 'VISA',
    expiryMonth: 12,
    expiryYear: 2025,
  })),
  chargeCard: vi.fn(async () => ({
    success: true,
    txId: 'segpay-tx-123',
  })),
}))

vi.mock('../lib/swish-recurring.js', () => ({
  setupRecurringAgreement: vi.fn(async () => ({
    id: 'agreement-123',
    status: 'ACTIVE',
    autoTopupAmount: 100,
    lowBalanceThreshold: 20,
  })),
  cancelRecurringAgreement: vi.fn(async () => {}),
}))

import { appRouter } from '../trpc/router.js'
import type { Context } from '../trpc/context.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockDecimal = (val: number) => ({
  toNumber: () => val,
  toString: () => val.toString(),
})

const userId = '550e8400-e29b-41d4-a716-446655440001'

function buildContext(prismaOverrides: Record<string, any> = {}): Context {
  return {
    userId,
    sessionId: 'session-uuid',
      clientVersion: null,
    req: {} as any,
    res: {} as any,
    prisma: {
      userBalance: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
      },
      tokenTransaction: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      spreadConfig: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      segpayCard: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
      },
      segpayTransaction: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      swishRecurringAgreement: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn(async (fn: any) => fn({
        userBalance: {
          upsert: vi.fn(),
          update: vi.fn(),
        },
        tokenTransaction: {
          create: vi.fn(),
        },
      })),
      ...prismaOverrides,
    } as any,
    redis: {} as any,
  }
}

// ---------------------------------------------------------------------------
// F23 Wave 3 – Payment System Tests
// ---------------------------------------------------------------------------

describe('F23 Wave 3 – Payment System', () => {

  // -------------------------------------------------------------------------
  // token.getBalance (Wave 1 endpoint, ensure router still works)
  // -------------------------------------------------------------------------

  describe('token.getBalance', () => {
    test('returns correct structure for existing user', async () => {
      const ctx = buildContext()
      const mockBalance = {
        userId,
        balance: mockDecimal(500.12345),
      }
      ;(ctx.prisma as any).userBalance.findUnique.mockResolvedValue(mockBalance)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.token.getBalance()

      expect(result).toHaveProperty('balance')
      expect(result).toHaveProperty('balanceDecimal')
      expect(result.balance).toBe(500.12345)
      expect(result.balanceDecimal).toBe('500.12345')
    })

    test('returns zero balance for new user', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).userBalance.findUnique.mockResolvedValue(null)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.token.getBalance()

      expect(result.balance).toBe(0)
      expect(result.balanceDecimal).toBe('0')
    })
  })

  // -------------------------------------------------------------------------
  // swishPayment.getSwishRecurringStatus
  // -------------------------------------------------------------------------

  describe('swishPayment.getSwishRecurringStatus', () => {
    test('returns null when no agreement exists', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).swishRecurringAgreement.findUnique.mockResolvedValue(null)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.swishPayment.getSwishRecurringStatus()

      expect(result).toBeNull()
    })

    test('returns agreement structure with decimal amounts converted to numbers', async () => {
      const ctx = buildContext()
      const mockAgreement = {
        id: 'agreement-uuid-123',
        userId,
        status: 'ACTIVE',
        autoTopupAmount: mockDecimal(100),
        lowBalanceThreshold: mockDecimal(20),
        createdAt: new Date('2026-03-26T10:00:00Z'),
        updatedAt: new Date('2026-03-26T10:00:00Z'),
      }
      ;(ctx.prisma as any).swishRecurringAgreement.findUnique.mockResolvedValue(mockAgreement)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.swishPayment.getSwishRecurringStatus()

      expect(result).not.toBeNull()
      expect(result?.id).toBe('agreement-uuid-123')
      expect(result?.status).toBe('ACTIVE')
      expect(result?.autoTopupAmount).toBe(100)
      expect(result?.lowBalanceThreshold).toBe(20)
      expect(result?.createdAt).toEqual(mockAgreement.createdAt)
    })
  })

  // -------------------------------------------------------------------------
  // segpay.listCards
  // -------------------------------------------------------------------------

  describe('segpay.listCards', () => {
    test('returns empty array for new user with no cards', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).segpayCard.findMany.mockResolvedValue([])

      const caller = appRouter.createCaller(ctx)
      const result = await caller.segpay.listCards()

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })

    test('returns card array with correct structure', async () => {
      const ctx = buildContext()
      const mockCards = [
        {
          id: 'card-uuid-1',
          userId,
          last4: '4242',
          brand: 'VISA',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
          createdAt: new Date('2026-03-20T10:00:00Z'),
        },
        {
          id: 'card-uuid-2',
          userId,
          last4: '5555',
          brand: 'MASTERCARD',
          expiryMonth: 6,
          expiryYear: 2026,
          isDefault: false,
          createdAt: new Date('2026-03-25T15:30:00Z'),
        },
      ]
      ;(ctx.prisma as any).segpayCard.findMany.mockResolvedValue(mockCards)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.segpay.listCards()

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'card-uuid-1',
        last4: '4242',
        brand: 'VISA',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        createdAt: mockCards[0].createdAt,
      })
      expect(result[1]).toEqual({
        id: 'card-uuid-2',
        last4: '5555',
        brand: 'MASTERCARD',
        expiryMonth: 6,
        expiryYear: 2026,
        isDefault: false,
        createdAt: mockCards[1].createdAt,
      })
    })
  })

  // -------------------------------------------------------------------------
  // segpay.topup
  // -------------------------------------------------------------------------

  describe('segpay.topup', () => {
    test('throws NOT_FOUND when user has no cards', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).segpayCard.findFirst.mockResolvedValue(null)

      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.segpay.topup({ amountSek: 100 })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'No payment card found',
      })
    })

    test('throws NOT_FOUND when specified cardId does not exist', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).segpayCard.findUnique.mockResolvedValue(null)

      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.segpay.topup({ amountSek: 100, cardId: '550e8400-e29b-41d4-a716-446655440099' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'No payment card found',
      })
    })

    test('throws NOT_FOUND when specified cardId belongs to different user', async () => {
      const ctx = buildContext()
      const mockCard = {
        id: '550e8400-e29b-41d4-a716-446655440099',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        last4: '4242',
        brand: 'VISA',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        createdAt: new Date(),
      }
      ;(ctx.prisma as any).segpayCard.findUnique.mockResolvedValue(mockCard)

      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.segpay.topup({ amountSek: 100, cardId: '550e8400-e29b-41d4-a716-446655440099' })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'No payment card found',
      })
    })
  })

  // -------------------------------------------------------------------------
  // token.getHistory
  // -------------------------------------------------------------------------

  describe('token.getHistory', () => {
    test('returns correct paginated structure with empty transactions', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).tokenTransaction.findMany.mockResolvedValue([])

      const caller = appRouter.createCaller(ctx)
      const result = await caller.token.getHistory({ limit: 20 })

      expect(result).toHaveProperty('transactions')
      expect(result).toHaveProperty('nextCursor')
      expect(Array.isArray(result.transactions)).toBe(true)
      expect(result.transactions).toHaveLength(0)
      expect(result.nextCursor).toBeNull()
    })

    test('returns correct pagination with cursor on exact limit match', async () => {
      const ctx = buildContext()
      const limit = 20
      const mockTxs = Array.from({ length: limit }, (_, i) => ({
        id: `tx-uuid-${i}`,
        userId,
        amount: mockDecimal(-10 * (i + 1)),
        type: 'GATEKEEPER',
        description: `Transaction ${i}`,
        serviceRef: null,
        createdAt: new Date('2026-03-26T12:00:00Z'),
      }))
      ;(ctx.prisma as any).tokenTransaction.findMany.mockResolvedValue(mockTxs)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.token.getHistory({ limit })

      expect(result.transactions).toHaveLength(limit)
      expect(result.nextCursor).toBeNull() // Exactly at limit, no more
    })

    test('returns correct pagination with cursor when exceeding limit', async () => {
      const ctx = buildContext()
      const limit = 20
      const mockTxs = Array.from({ length: limit + 1 }, (_, i) => ({
        id: `tx-uuid-${i}`,
        userId,
        amount: mockDecimal(-10 * (i + 1)),
        type: 'TOPUP',
        description: `Transaction ${i}`,
        serviceRef: null,
        createdAt: new Date('2026-03-26T12:00:00Z'),
      }))
      ;(ctx.prisma as any).tokenTransaction.findMany.mockResolvedValue(mockTxs)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.token.getHistory({ limit })

      expect(result.transactions).toHaveLength(limit)
      expect(result.nextCursor).toBe(`tx-uuid-${limit - 1}`) // Last item of first page
      expect(result.transactions[0].amount).toBe(-10) // First transaction amount
    })

    test('converts decimal amounts to numbers correctly', async () => {
      const ctx = buildContext()
      const txDate = new Date('2026-03-26T12:00:00Z')
      const mockTxs = [
        {
          id: 'tx-uuid-1',
          userId,
          amount: mockDecimal(-20.5),
          type: 'GATEKEEPER',
          description: 'Gatekeeper conversation',
          serviceRef: null,
          createdAt: txDate,
        },
        {
          id: 'tx-uuid-2',
          userId,
          amount: mockDecimal(100.12345),
          type: 'TOPUP',
          description: 'Card top up',
          serviceRef: 'segpay-tx-123',
          createdAt: txDate,
        },
      ]
      ;(ctx.prisma as any).tokenTransaction.findMany.mockResolvedValue(mockTxs)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.token.getHistory({})

      expect(result.transactions).toHaveLength(2)
      expect(result.transactions[0]).toMatchObject({
        id: 'tx-uuid-1',
        amount: -20.5,
        type: 'GATEKEEPER',
        description: 'Gatekeeper conversation',
        serviceRef: null,
      })
      expect(result.transactions[1]).toMatchObject({
        id: 'tx-uuid-2',
        amount: 100.12345,
        type: 'TOPUP',
        description: 'Card top up',
        serviceRef: 'segpay-tx-123',
      })
    })
  })
})
