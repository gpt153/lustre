// Environment variables must be set before importing modules that read them.
process.env.JWT_SECRET = 'test-secret-key-at-least-32-chars-long!!'
process.env.ENCRYPTION_KEY = 'aa'.repeat(32) // 64 hex chars = 32 bytes
process.env.SWISH_MERCHANT_NUMBER = '1234567890'
process.env.SWISH_API_URL = 'https://swish.example.com'
process.env.SWISH_RECURRING_CALLBACK_URL = 'https://api.example.com/swish/recurring/callback'
process.env.SWISH_CERT_PATH = '/tmp/test-cert.p12'
process.env.SWISH_CERT_PASSPHRASE = 'test-passphrase'
process.env.SEGPAY_API_KEY = 'test-api-key'
process.env.SEGPAY_API_SECRET = 'test-api-secret'
process.env.SEGPAY_API_URL = 'https://api.segpay.com'
process.env.SEGPAY_CALLBACK_URL = 'https://api.example.com/segpay/callback'

import { describe, test, expect, beforeEach, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Mock external dependencies before importing router
// ---------------------------------------------------------------------------

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

// Mock creditTokens from tokens.ts
vi.mock('../lib/tokens.js', () => ({
  GATEKEEPER_COST: 20,
  checkBalance: vi.fn(async () => 100),
  debitTokens: vi.fn(async () => {}),
  creditTokens: vi.fn(async () => {}),
}))

// Mock the https module (used via dynamic import('https') in swish-recurring.ts)
vi.mock('https', () => {
  function AgentConstructor(_opts: unknown) {}
  return {
    default: { Agent: AgentConstructor },
    Agent: AgentConstructor,
  }
})

vi.mock('fs', () => {
  const readFileSync = vi.fn(() => Buffer.from('fake-cert'))
  return {
    default: { readFileSync },
    readFileSync,
  }
})

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { appRouter } from '../trpc/router.js'
import type { Context } from '../trpc/context.js'
import { handleRecurringCallback, triggerAutoTopup } from '../lib/swish-recurring.js'
import { handleSegpayCallback } from '../lib/segpay.js'
import { creditTokens } from '../lib/tokens.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockDecimal = (val: number) => ({
  toNumber: () => val,
  toString: () => val.toString(),
  toFixed: (dp: number) => val.toFixed(dp),
})

const userId = '550e8400-e29b-41d4-a716-446655440001'
const cardId = '550e8400-e29b-41d4-a716-446655440010'
const txId = '550e8400-e29b-41d4-a716-446655440020'
const agreementId = '550e8400-e29b-41d4-a716-446655440030'

function buildContext(prismaOverrides: Record<string, any> = {}): Context {
  return {
    userId,
    sessionId: 'session-uuid',
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
      swishRecurringAgreement: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        updateMany: vi.fn(),
      },
      segpayCard: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
      },
      segpayTransaction: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(async (fn: any) =>
        fn({
          userBalance: {
            upsert: vi.fn().mockResolvedValue({ userId, balance: mockDecimal(100) }),
            update: vi.fn().mockResolvedValue({ userId, balance: mockDecimal(90) }),
          },
          tokenTransaction: { create: vi.fn().mockResolvedValue({ id: 'tx-1' }) },
        })
      ),
      ...prismaOverrides,
    } as any,
    redis: {} as any,
  }
}

// ---------------------------------------------------------------------------
// F23 Wave 2 – Token System (Swish Recurring + Segpay)
// ---------------------------------------------------------------------------

describe('F23 Wave 2 – Token System', () => {

  beforeEach(() => {
    vi.clearAllMocks()

    // Default global.fetch mock — success responses
    global.fetch = vi.fn(async (url: string) => {
      const urlStr = String(url)
      if (urlStr.includes('/api/v1/agreements')) {
        return {
          ok: true,
          status: 201,
          headers: {
            get: (name: string) =>
              name === 'Location'
                ? 'https://swish.example.com/api/v1/agreements/AGREEMENT-TOKEN-123'
                : null,
          },
        } as any
      }
      if (urlStr.includes('/api/v1/paymentrequests')) {
        return {
          ok: true,
          status: 201,
          headers: { get: () => null },
        } as any
      }
      if (urlStr.includes('/api/v1/tokenize')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            token: 'card-token-abc',
            last4: '4242',
            brand: 'VISA',
            expiryMonth: 12,
            expiryYear: 2028,
          }),
        } as any
      }
      if (urlStr.includes('/api/v1/charge')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ txId: 'segpay-tx-999', status: 'APPROVED' }),
        } as any
      }
      return { ok: false, status: 500, text: async () => 'Server error' } as any
    })
  })

  // -------------------------------------------------------------------------
  // swishPayment.setupSwishRecurring
  // -------------------------------------------------------------------------

  describe('swishPayment.setupSwishRecurring', () => {
    test('creates agreement with PENDING status and returns agreementToken + paymentUrl', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).swishRecurringAgreement.upsert.mockResolvedValue({
        id: agreementId,
        userId,
        agreementToken: 'AGREEMENT-TOKEN-123',
        status: 'PENDING',
        autoTopupAmount: mockDecimal(100),
        lowBalanceThreshold: mockDecimal(50),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.swishPayment.setupSwishRecurring({
        autoTopupAmount: 100,
        lowBalanceThreshold: 50,
      })

      expect(result.agreementToken).toBe('AGREEMENT-TOKEN-123')
      expect(result.paymentUrl).toContain('AGREEMENT-TOKEN-123')
      expect((ctx.prisma as any).swishRecurringAgreement.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          create: expect.objectContaining({ status: 'PENDING' }),
        })
      )
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

    test('returns agreement details when agreement exists', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).swishRecurringAgreement.findUnique.mockResolvedValue({
        id: agreementId,
        userId,
        status: 'ACTIVE',
        autoTopupAmount: mockDecimal(100),
        lowBalanceThreshold: mockDecimal(50),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.swishPayment.getSwishRecurringStatus()

      expect(result).not.toBeNull()
      expect(result!.status).toBe('ACTIVE')
      expect(result!.autoTopupAmount).toBe(100)
      expect(result!.lowBalanceThreshold).toBe(50)
    })
  })

  // -------------------------------------------------------------------------
  // swishPayment.cancelSwishRecurring
  // -------------------------------------------------------------------------

  describe('swishPayment.cancelSwishRecurring', () => {
    test('sets agreement status to CANCELLED', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).swishRecurringAgreement.updateMany.mockResolvedValue({ count: 1 })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.swishPayment.cancelSwishRecurring()

      expect(result.success).toBe(true)
      expect((ctx.prisma as any).swishRecurringAgreement.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          data: { status: 'CANCELLED' },
        })
      )
    })
  })

  // -------------------------------------------------------------------------
  // handleRecurringCallback (lib function)
  // -------------------------------------------------------------------------

  describe('handleRecurringCallback', () => {
    test('credits tokens (1 SEK = 1 token) when status=PAID', async () => {
      const mockPrisma = {
        swishRecurringAgreement: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        $transaction: vi.fn(async (fn: any) =>
          fn({
            userBalance: {
              upsert: vi.fn().mockResolvedValue({ userId, balance: mockDecimal(150) }),
              update: vi.fn().mockResolvedValue({ userId, balance: mockDecimal(150) }),
            },
            tokenTransaction: { create: vi.fn().mockResolvedValue({ id: 'tx-credit' }) },
          })
        ),
      } as any

      await handleRecurringCallback(mockPrisma, {
        status: 'PAID',
        amount: 50,
        payeePaymentReference: userId,
        callbackIdentifier: 'cb-identifier-abc',
      })

      expect(creditTokens).toHaveBeenCalledWith(
        mockPrisma,
        userId,
        50,
        'TOPUP',
        'cb-identifier-abc',
      )
    })

    test('does not credit tokens when status is not PAID', async () => {
      const mockPrisma = {} as any

      await handleRecurringCallback(mockPrisma, {
        status: 'DECLINED',
        amount: 50,
        payeePaymentReference: userId,
        callbackIdentifier: 'cb-declined',
      })

      expect(creditTokens).not.toHaveBeenCalled()
    })
  })

  // -------------------------------------------------------------------------
  // triggerAutoTopup (lib function)
  // -------------------------------------------------------------------------

  describe('triggerAutoTopup', () => {
    test('returns { triggered: false } when balance >= threshold', async () => {
      const mockPrisma = {
        swishRecurringAgreement: {
          findUnique: vi.fn().mockResolvedValue({
            id: agreementId,
            userId,
            status: 'ACTIVE',
            agreementToken: 'TOKEN-ABC',
            autoTopupAmount: mockDecimal(100),
            lowBalanceThreshold: mockDecimal(50),
          }),
        },
        userBalance: {
          findUnique: vi.fn().mockResolvedValue({
            userId,
            balance: mockDecimal(200), // well above 50 threshold
          }),
        },
      } as any

      const result = await triggerAutoTopup(mockPrisma, userId)

      expect(result).toEqual({ triggered: false })
      // fetch should NOT have been called for payment request
      const fetchCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
      expect(fetchCalls.length).toBe(0)
    })

    test('returns { triggered: false } when no active agreement', async () => {
      const mockPrisma = {
        swishRecurringAgreement: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      } as any

      const result = await triggerAutoTopup(mockPrisma, userId)

      expect(result).toEqual({ triggered: false })
    })

    test('returns { triggered: true } when balance < threshold', async () => {
      const mockPrisma = {
        swishRecurringAgreement: {
          findUnique: vi.fn().mockResolvedValue({
            id: agreementId,
            userId,
            status: 'ACTIVE',
            agreementToken: 'TOKEN-ABC',
            autoTopupAmount: mockDecimal(100),
            lowBalanceThreshold: mockDecimal(50),
          }),
        },
        userBalance: {
          findUnique: vi.fn().mockResolvedValue({
            userId,
            balance: mockDecimal(10), // below 50 threshold
          }),
        },
      } as any

      const result = await triggerAutoTopup(mockPrisma, userId)

      expect(result).toEqual({ triggered: true })
    })
  })

  // -------------------------------------------------------------------------
  // segpay.addCard
  // -------------------------------------------------------------------------

  describe('segpay.addCard', () => {
    test('stores card with only last4 returned (no full number stored)', async () => {
      const ctx = buildContext()
      const createdAt = new Date()

      ;(ctx.prisma as any).segpayCard.findMany.mockResolvedValue([])
      ;(ctx.prisma as any).segpayCard.create.mockResolvedValue({
        id: cardId,
        userId,
        cardToken: 'card-token-abc',
        last4: '4242',
        brand: 'VISA',
        expiryMonth: 12,
        expiryYear: 2028,
        isDefault: true,
        createdAt,
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.segpay.addCard({
        number: '4111111111114242',
        cvv: '123',
        expiryMonth: 12,
        expiryYear: 2028,
        holderName: 'Test User',
      })

      // Only last4 is returned — full number must not be present
      expect(result.last4).toBe('4242')
      expect(result.brand).toBe('VISA')
      expect(result.isDefault).toBe(true)
      expect((result as any).number).toBeUndefined()
      expect((result as any).cardToken).toBeUndefined()

      // The card was created
      expect((ctx.prisma as any).segpayCard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            last4: '4242',
            cardToken: 'card-token-abc',
          }),
        })
      )
    })

    test('second card is not default when a card already exists', async () => {
      const ctx = buildContext()
      const createdAt = new Date()

      // Simulate one existing card
      ;(ctx.prisma as any).segpayCard.findMany.mockResolvedValue([
        {
          id: 'existing-card-id',
          userId,
          cardToken: 'old-token',
          last4: '1111',
          brand: 'MC',
          expiryMonth: 6,
          expiryYear: 2027,
          isDefault: true,
          createdAt,
        },
      ])
      ;(ctx.prisma as any).segpayCard.create.mockResolvedValue({
        id: cardId,
        userId,
        cardToken: 'card-token-abc',
        last4: '4242',
        brand: 'VISA',
        expiryMonth: 12,
        expiryYear: 2028,
        isDefault: false, // second card is not default
        createdAt,
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.segpay.addCard({
        number: '4111111111114242',
        cvv: '123',
        expiryMonth: 12,
        expiryYear: 2028,
        holderName: 'Test User',
      })

      expect(result.isDefault).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // segpay.listCards
  // -------------------------------------------------------------------------

  describe('segpay.listCards', () => {
    test('returns cards for the user', async () => {
      const ctx = buildContext()
      const createdAt = new Date()

      ;(ctx.prisma as any).segpayCard.findMany.mockResolvedValue([
        {
          id: cardId,
          userId,
          last4: '4242',
          brand: 'VISA',
          expiryMonth: 12,
          expiryYear: 2028,
          isDefault: true,
          createdAt,
        },
      ])

      const caller = appRouter.createCaller(ctx)
      const result = await caller.segpay.listCards()

      expect(result).toHaveLength(1)
      expect(result[0]!.last4).toBe('4242')
      expect(result[0]!.id).toBe(cardId)
      expect((result[0] as any).cardToken).toBeUndefined()
    })

    test('returns empty array when user has no cards', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).segpayCard.findMany.mockResolvedValue([])

      const caller = appRouter.createCaller(ctx)
      const result = await caller.segpay.listCards()

      expect(result).toEqual([])
    })
  })

  // -------------------------------------------------------------------------
  // segpay.topup
  // -------------------------------------------------------------------------

  describe('segpay.topup', () => {
    test('creates COMPLETED transaction and credits tokens with sufficient balance', async () => {
      const ctx = buildContext()
      const createdAt = new Date()

      ;(ctx.prisma as any).segpayCard.findFirst.mockResolvedValue({
        id: cardId,
        userId,
        cardToken: 'card-token-abc',
        last4: '4242',
        brand: 'VISA',
        expiryMonth: 12,
        expiryYear: 2028,
        isDefault: true,
        createdAt,
      })

      ;(ctx.prisma as any).segpayTransaction.create.mockResolvedValue({
        id: txId,
        userId,
        amountSek: 100,
        tokensCredit: 100,
        status: 'PENDING',
        segpayTxId: null,
        createdAt,
      })

      ;(ctx.prisma as any).segpayTransaction.update.mockResolvedValue({
        id: txId,
        status: 'COMPLETED',
        segpayTxId: 'segpay-tx-999',
      })

      const caller = appRouter.createCaller(ctx)
      const result = await caller.segpay.topup({ amountSek: 100 })

      expect(result.success).toBe(true)
      expect(result.tokensCredit).toBe(100)
      expect(result.amountSek).toBe(100)

      // Transaction should be marked COMPLETED
      expect((ctx.prisma as any).segpayTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'COMPLETED' }),
        })
      )

      // Tokens should be credited
      expect(creditTokens).toHaveBeenCalledWith(
        ctx.prisma,
        userId,
        100,
        'TOPUP',
        txId,
      )
    })

    test('throws NOT_FOUND when no default card exists', async () => {
      const ctx = buildContext()
      ;(ctx.prisma as any).segpayCard.findFirst.mockResolvedValue(null)

      const caller = appRouter.createCaller(ctx)

      await expect(
        caller.segpay.topup({ amountSek: 100 })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })
  })

  // -------------------------------------------------------------------------
  // handleSegpayCallback (lib function)
  // -------------------------------------------------------------------------

  describe('handleSegpayCallback', () => {
    test('credits tokens when status=APPROVED', async () => {
      const mockPrisma = {
        segpayTransaction: {
          findFirst: vi.fn().mockResolvedValue({
            id: txId,
            userId,
            amountSek: mockDecimal(75),
            status: 'PENDING',
            segpayTxId: 'segpay-tx-callback',
          }),
          update: vi.fn().mockResolvedValue({ id: txId, status: 'COMPLETED' }),
        },
        $transaction: vi.fn(async (fn: any) =>
          fn({
            userBalance: {
              upsert: vi.fn().mockResolvedValue({ userId, balance: mockDecimal(175) }),
              update: vi.fn(),
            },
            tokenTransaction: { create: vi.fn().mockResolvedValue({ id: 'credit-tx' }) },
          })
        ),
      } as any

      await handleSegpayCallback(mockPrisma, {
        txId: 'segpay-tx-callback',
        status: 'APPROVED',
      })

      // Transaction updated to COMPLETED
      expect(mockPrisma.segpayTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: txId },
          data: { status: 'COMPLETED' },
        })
      )

      // Tokens credited: 75 SEK = 75 tokens
      expect(creditTokens).toHaveBeenCalledWith(
        mockPrisma,
        userId,
        75,
        'TOPUP',
        txId,
      )
    })

    test('does nothing when status is not APPROVED', async () => {
      const mockPrisma = {
        segpayTransaction: {
          findFirst: vi.fn(),
          update: vi.fn(),
        },
      } as any

      await handleSegpayCallback(mockPrisma, {
        txId: 'segpay-tx-declined',
        status: 'DECLINED',
      })

      expect(mockPrisma.segpayTransaction.findFirst).not.toHaveBeenCalled()
      expect(creditTokens).not.toHaveBeenCalled()
    })

    test('does nothing when transaction is not found', async () => {
      const mockPrisma = {
        segpayTransaction: {
          findFirst: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
      } as any

      await handleSegpayCallback(mockPrisma, {
        txId: 'nonexistent-tx',
        status: 'APPROVED',
      })

      expect(mockPrisma.segpayTransaction.update).not.toHaveBeenCalled()
      expect(creditTokens).not.toHaveBeenCalled()
    })
  })
})
