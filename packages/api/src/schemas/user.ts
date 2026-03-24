import { z } from 'zod'

export const userSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(2).max(50),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type User = z.infer<typeof userSchema>
