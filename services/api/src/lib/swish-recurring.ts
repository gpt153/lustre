import type { PrismaClient } from '@prisma/client'
import { creditTokens } from './tokens.js'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

interface SwishRecurringConfig {
  merchantNumber: string
  apiUrl: string
  callbackUrl: string
  certPath: string
  certPassphrase: string
}

function getConfig(): SwishRecurringConfig {
  const merchantNumber = process.env.SWISH_MERCHANT_NUMBER
  const apiUrl = process.env.SWISH_API_URL
  const callbackUrl = process.env.SWISH_RECURRING_CALLBACK_URL
  const certPath = process.env.SWISH_CERT_PATH
  const certPassphrase = process.env.SWISH_CERT_PASSPHRASE

  if (!merchantNumber || !apiUrl || !callbackUrl || !certPath || !certPassphrase) {
    throw new Error(
      'Missing required Swish recurring environment variables: SWISH_MERCHANT_NUMBER, SWISH_API_URL, SWISH_RECURRING_CALLBACK_URL, SWISH_CERT_PATH, SWISH_CERT_PASSPHRASE',
    )
  }

  return { merchantNumber, apiUrl, callbackUrl, certPath, certPassphrase }
}

// ---------------------------------------------------------------------------
// HTTPS agent builder (mTLS — same pattern as auth/swish.ts)
// ---------------------------------------------------------------------------

async function buildAgent(config: SwishRecurringConfig) {
  const { readFileSync } = await import('fs')
  const https = await import('https')

  const cert = readFileSync(config.certPath)

  return new https.Agent({
    pfx: cert,
    passphrase: config.certPassphrase,
    ...(process.env.SWISH_CA_PATH
      ? { ca: readFileSync(process.env.SWISH_CA_PATH) }
      : {}),
  })
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecurringCallbackPayload {
  status: 'CREATED' | 'PAID' | 'DECLINED' | 'ERROR'
  amount: number
  payeePaymentReference: string
  callbackIdentifier: string
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates a Swish recurring agreement for the given user.
 * Stores the agreement with PENDING status and returns the agreementToken
 * and the paymentUrl where the user completes the agreement in the Swish app.
 */
export async function setupRecurringAgreement(
  prisma: PrismaClient,
  userId: string,
  autoTopupAmount: number,
  lowBalanceThreshold: number,
): Promise<{ agreementToken: string; paymentUrl: string }> {
  const config = getConfig()
  const agent = await buildAgent(config)

  const instructionUUID = crypto.randomUUID().replace(/-/g, '').toUpperCase()
  const url = `${config.apiUrl}/api/v1/agreements`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchantAlias: config.merchantNumber,
      payerAlias: null,
      agreementParam: instructionUUID,
      callbackUrl: config.callbackUrl,
      message: 'Lustre — automatisk påfyllning av tokens',
    }),
    // @ts-expect-error — undici agent
    agent,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Swish agreement API error (${response.status}): ${errorText}`)
  }

  // Swish returns 201 with Location header containing the agreement token
  const location = response.headers.get('Location') ?? ''
  const agreementToken = location.split('/').at(-1) ?? ''

  if (!agreementToken) {
    throw new Error('Swish API did not return an agreement token in the Location header')
  }

  // Upsert: if the user already has an agreement (e.g. cancelled), replace it
  await prisma.swishRecurringAgreement.upsert({
    where: { userId },
    create: {
      userId,
      agreementToken,
      status: 'PENDING',
      autoTopupAmount,
      lowBalanceThreshold,
    },
    update: {
      agreementToken,
      status: 'PENDING',
      autoTopupAmount,
      lowBalanceThreshold,
    },
  })

  // The paymentUrl is the standard Swish deep-link for the merchant app
  const paymentUrl = `swish://paymentrequest?token=${agreementToken}&callbackurl=${encodeURIComponent(config.callbackUrl)}`

  return { agreementToken, paymentUrl }
}

/**
 * Checks whether the user's token balance is below the threshold and,
 * if so, triggers a Swish recurring payment for the configured auto-topup amount.
 */
export async function triggerAutoTopup(
  prisma: PrismaClient,
  userId: string,
): Promise<{ triggered: boolean }> {
  const agreement = await prisma.swishRecurringAgreement.findUnique({
    where: { userId },
  })

  if (!agreement || agreement.status !== 'ACTIVE') {
    return { triggered: false }
  }

  const balance = await prisma.userBalance.findUnique({ where: { userId } })
  const currentBalance = balance?.balance.toNumber() ?? 0

  if (currentBalance >= agreement.lowBalanceThreshold.toNumber()) {
    return { triggered: false }
  }

  const config = getConfig()
  const agent = await buildAgent(config)

  const instructionUUID = crypto.randomUUID().replace(/-/g, '').toUpperCase()
  const url = `${config.apiUrl}/api/v1/paymentrequests`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payeePaymentReference: userId,
      callbackUrl: config.callbackUrl,
      payeeAlias: config.merchantNumber,
      amount: agreement.autoTopupAmount.toFixed(2),
      currency: 'SEK',
      message: 'Lustre — automatisk påfyllning av tokens',
      recurringToken: agreement.agreementToken,
    }),
    // @ts-expect-error — undici agent
    agent,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Swish recurring payment API error (${response.status}): ${errorText}`)
  }

  return { triggered: true }
}

/**
 * Handles a Swish recurring payment callback.
 * When status is PAID, credits tokens (1 SEK = 1 token) and records the topup.
 */
export async function handleRecurringCallback(
  prisma: PrismaClient,
  payload: RecurringCallbackPayload,
): Promise<void> {
  // payeePaymentReference is set to userId when triggering auto-topup
  const userId = payload.payeePaymentReference

  if (payload.status === 'PAID') {
    // 1 SEK = 1 token
    const tokenAmount = payload.amount

    await creditTokens(
      prisma,
      userId,
      tokenAmount,
      'TOPUP',
      undefined,
      payload.callbackIdentifier,
    )

    // Mark agreement as ACTIVE if it was PENDING (first successful payment confirms the agreement)
    await prisma.swishRecurringAgreement.updateMany({
      where: { userId, status: 'PENDING' },
      data: { status: 'ACTIVE' },
    })
  }
}

/**
 * Cancels the user's recurring agreement by setting its status to CANCELLED.
 */
export async function cancelRecurringAgreement(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  await prisma.swishRecurringAgreement.updateMany({
    where: { userId },
    data: { status: 'CANCELLED' },
  })
}
