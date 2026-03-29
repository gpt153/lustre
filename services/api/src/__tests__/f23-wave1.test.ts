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

import { appRouter } from '../trpc/router.js'
import type { Context } from '../trpc/context.js'
import { calculateTokenCost } from '../lib/spread-engine.js'

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
// F23 Wave 1 – Token System Tests
// ---------------------------------------------------------------------------

describe('F23 Wave 1 – Token System', () => {

  // -------------------------------------------------------------------------
  // token.getBalance
  // -------------------------------------------------------------------------

  describe('token.getBalance', () => {
    test('returns 0 for new user when no balance record exists', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).userBalance.findUnique.mockResolvedValue(null)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.token.getBalance()

      expect(result.balance).toBe(0)
      expect(result.balanceDecimal).toBe('0')
    })

    test('returns correct decimal balance with 5-decimal precision', async () => {
      const ctx = buildContext()
      const mockBalance = {
        userId,
        balance: mockDecimal(123.45678),
      }
      ;(ctx.prisma as any).userBalance.findUnique.mockResolvedValue(mockBalance)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.token.getBalance()

      expect(result.balance).toBe(123.45678)
      expect(result.balanceDecimal).toBe('123.45678')
    })
  })

  // -------------------------------------------------------------------------
  // token.deduct
  // -------------------------------------------------------------------------

  describe('token.deduct', () => {
    test('succeeds when balance is sufficient', async () => {
      const ctx = buildContext()

      // $transaction mock that runs the callback with a tx object
      const txUserBalance = {
        upsert: vi.fn().mockResolvedValue({ userId, balance: mockDecimal(100) }),
        update: vi.fn().mockResolvedValue({ userId, balance: mockDecimal(90) }),
      }
      const txTokenTransaction = {
        create: vi.fn().mockResolvedValue({ id: 'tx-1' }),
      }
      ;(ctx.prisma as any).$transaction = vi.fn(async (fn: any) =>
        fn({ userBalance: txUserBalance, tokenTransaction: txTokenTransaction })
      )

      // After debit, checkBalance is called – it calls findUnique on the outer prisma
      ;(ctx.prisma as any).userBalance.findUnique.mockResolvedValue({
        userId,
        balance: mockDecimal(90),
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.token.deduct({
        amount: 10,
        type: 'GATEKEEPER',
        description: 'Test deduction',
      })

      expect(result.success).toBe(true)
      expect(result.newBalance).toBe(90)
      expect(txUserBalance.upsert).toHaveBeenCalled()
      expect(txUserBalance.update).toHaveBeenCalled()
      expect(txTokenTransaction.create).toHaveBeenCalled()
    })

    test('throws PRECONDITION_FAILED when balance is insufficient', async () => {
      const ctx = buildContext()

      const txUserBalance = {
        upsert: vi.fn().mockResolvedValue({ userId, balance: mockDecimal(5) }),
        update: vi.fn(),
      }
      const txTokenTransaction = {
        create: vi.fn(),
      }
      ;(ctx.prisma as any).$transaction = vi.fn(async (fn: any) =>
        fn({ userBalance: txUserBalance, tokenTransaction: txTokenTransaction })
      )

      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.token.deduct({ amount: 10, type: 'GATEKEEPER' })
      ).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
      })

      // update and create should NOT have been called
      expect(txUserBalance.update).not.toHaveBeenCalled()
      expect(txTokenTransaction.create).not.toHaveBeenCalled()
    })
  })

  // -------------------------------------------------------------------------
  // token.getHistory
  // -------------------------------------------------------------------------

  describe('token.getHistory', () => {
    test('returns empty array for new user', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).tokenTransaction.findMany.mockResolvedValue([])

      const caller = appRouter.createCaller(ctx)
      const result = await caller.token.getHistory({})

      expect(result.transactions).toEqual([])
      expect(result.nextCursor).toBeNull()
    })

    test('returns transactions with decimal amounts converted to numbers', async () => {
      const ctx = buildContext()
      const txDate = new Date('2026-03-26T12:00:00Z')
      const mockTx = [
        {
          id: 'tx-uuid-1',
          userId,
          amount: mockDecimal(-20),
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
          description: 'Top up',
          serviceRef: 'swish-ref-1',
          createdAt: txDate,
        },
      ]
      ;(ctx.prisma as any).tokenTransaction.findMany.mockResolvedValue(mockTx)

      const caller = appRouter.createCaller(ctx)
      const result = await caller.token.getHistory({ limit: 20 })

      expect(result.transactions).toHaveLength(2)
      expect(result.transactions[0].amount).toBe(-20)
      expect(result.transactions[1].amount).toBe(100.12345)
      expect(result.nextCursor).toBeNull()
    })
  })

  // -------------------------------------------------------------------------
  // calculateTokenCost (spread-engine)
  // -------------------------------------------------------------------------

  describe('calculateTokenCost', () => {
    test('applies default 3x multiplier when no config found', async () => {
      const mockPrisma = {
        spreadConfig: {
          findUnique: vi.fn().mockResolvedValue(null),
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any

      const baseCost = 10
      const result = await calculateTokenCost(mockPrisma, baseCost)

      expect(result).toBe(30) // 10 * 3
    })

    test('applies specific config multiplier (2.0) from spreadConfig', async () => {
      const mockPrisma = {
        spreadConfig: {
          findUnique: vi.fn().mockResolvedValue(null),
          findFirst: vi.fn().mockResolvedValue({
            id: 'config-1',
            segment: null,
            market: null,
            multiplier: mockDecimal(2.0),
            isDefault: true,
          }),
        },
      } as any

      const baseCost = 10
      const result = await calculateTokenCost(mockPrisma, baseCost)

      expect(result).toBe(20) // 10 * 2
    })

    test('rounds result to 5 decimal places', async () => {
      const mockPrisma = {
        spreadConfig: {
          findUnique: vi.fn().mockResolvedValue(null),
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any

      // baseCost 0.00312 * 3 = 0.00936
      const baseCost = 0.00312
      const result = await calculateTokenCost(mockPrisma, baseCost)

      expect(result).toBe(0.00936)
      // Verify precision: should have at most 5 decimal places
      const decimalPlaces = (result.toString().split('.')[1] ?? '').length
      expect(decimalPlaces).toBeLessThanOrEqual(5)
    })
  })
})
