import { z } from 'zod'

// Swish callback (used by /swish/callback, /api/events/ticket-callback)
export const SwishCallbackSchema = z.object({
  id: z.string(),
  status: z.string(),
  payeePaymentReference: z.string().optional(),
  paymentReference: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  callbackUrl: z.string().optional(),
  payerAlias: z.string().optional(),
}).passthrough()

// Swish recurring callback
export const SwishRecurringCallbackSchema = z.object({
  status: z.enum(['CREATED', 'PAID', 'DECLINED', 'ERROR']),
  amount: z.number(),
  payeePaymentReference: z.string(),
  callbackIdentifier: z.string(),
}).passthrough()

// Segpay callback
export const SegpayCallbackSchema = z.object({
  status: z.string(),
  txId: z.string().optional(),
  transactionId: z.string().optional(),
}).passthrough()

// Upload query params
export const PostUploadQuerySchema = z.object({ postId: z.string().uuid() })
export const ChatUploadQuerySchema = z.object({ conversationId: z.string().uuid() })
