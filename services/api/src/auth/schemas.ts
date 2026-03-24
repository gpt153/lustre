import { z } from 'zod'

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    displayName: z.string().nullable(),
  }),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>

export const sessionSchema = z.object({
  id: z.string(),
  deviceInfo: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.date(),
  expiresAt: z.date(),
})

export type SessionInfo = z.infer<typeof sessionSchema>
