import type { PrismaClient } from '@prisma/client'
import { creditTokens } from './tokens.js'

interface CardData {
  number: string
  cvv: string
  expiryMonth: number
  expiryYear: number
  holderName: string
}

interface TokenizeResult {
  cardToken: string
  last4: string
  brand: string
  expiryMonth: number
  expiryYear: number
}

interface ChargeResult {
  txId: string
  success: boolean
}

interface SegpayCallbackPayload {
  txId?: string
  transactionId?: string
  status: string
  [key: string]: unknown
}

function getBasicAuthHeader(): string {
  const apiKey = process.env.SEGPAY_API_KEY ?? ''
  const apiSecret = process.env.SEGPAY_API_SECRET ?? ''
  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  return `Basic ${credentials}`
}

function getApiUrl(): string {
  return process.env.SEGPAY_API_URL ?? 'https://api.segpay.com'
}

export async function tokenizeCard(cardData: CardData): Promise<TokenizeResult> {
  const response = await fetch(`${getApiUrl()}/api/v1/tokenize`, {
    method: 'POST',
    headers: {
      Authorization: getBasicAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cardNumber: cardData.number,
      cvv: cardData.cvv,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      holderName: cardData.holderName,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Segpay tokenize failed: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as {
    token: string
    last4: string
    brand: string
    expiryMonth: number
    expiryYear: number
  }

  return {
    cardToken: data.token,
    last4: data.last4,
    brand: data.brand,
    expiryMonth: data.expiryMonth,
    expiryYear: data.expiryYear,
  }
}

export async function chargeCard(cardToken: string, amountSek: number): Promise<ChargeResult> {
  const response = await fetch(`${getApiUrl()}/api/v1/charge`, {
    method: 'POST',
    headers: {
      Authorization: getBasicAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: cardToken,
      amount: amountSek,
      currency: 'SEK',
      callbackUrl: process.env.SEGPAY_CALLBACK_URL,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Segpay charge failed: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as {
    txId: string
    status: string
  }

  return {
    txId: data.txId,
    success: data.status === 'APPROVED' || data.status === 'SUCCESS',
  }
}

export async function handleSegpayCallback(
  prisma: PrismaClient,
  payload: SegpayCallbackPayload,
): Promise<void> {
  if (payload.status !== 'APPROVED') {
    return
  }

  const segpayTxId = payload.txId ?? payload.transactionId
  if (!segpayTxId) {
    return
  }

  const transaction = await prisma.segpayTransaction.findFirst({
    where: { segpayTxId },
  })

  if (!transaction || transaction.status !== 'PENDING') {
    return
  }

  const amountSek = transaction.amountSek.toNumber()

  await prisma.segpayTransaction.update({
    where: { id: transaction.id },
    data: { status: 'COMPLETED' },
  })

  // 1 SEK = 1 token
  await creditTokens(prisma, transaction.userId, amountSek, 'TOPUP', transaction.id)
}
