import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'

const GenderEnum = z.enum([
  'MAN', 'WOMAN', 'NON_BINARY', 'TRANS_MAN', 'TRANS_WOMAN',
  'GENDERQUEER', 'GENDERFLUID', 'AGENDER', 'BIGENDER', 'TWO_SPIRIT', 'OTHER'
])

const OrientationEnum = z.enum([
  'STRAIGHT', 'GAY', 'LESBIAN', 'BISEXUAL', 'PANSEXUAL',
  'QUEER', 'ASEXUAL', 'DEMISEXUAL', 'OTHER'
])

interface TargetableProfile {
  gender: string
  orientation: string
  age: number
}

interface TargetableEvent {
  targetGenders: string[]
  targetOrientations: string[]
  targetMinAge: number | null
  targetMaxAge: number | null
}

function matchesEventTargeting(profile: TargetableProfile, event: TargetableEvent): boolean {
  if (event.targetGenders.length > 0 && !event.targetGenders.includes(profile.gender)) {
    return false
  }
  if (event.targetOrientations.length > 0 && !event.targetOrientations.includes(profile.orientation)) {
    return false
  }
  if (event.targetMinAge !== null && profile.age < event.targetMinAge) {
    return false
  }
  if (event.targetMaxAge !== null && profile.age > event.targetMaxAge) {
    return false
  }
  return true
}

export const eventRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z.string().max(200),
      description: z.string().max(4000).optional(),
      type: z.enum(['ONLINE', 'IRL', 'HYBRID']),
      status: z.enum(['DRAFT', 'PUBLISHED']).optional().default('DRAFT'),
      startsAt: z.string().datetime(),
      endsAt: z.string().datetime().optional(),
      locationName: z.string().max(500).optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      capacity: z.number().int().positive().optional(),
      price: z.number().positive().optional(),
      currency: z.string().default('SEK'),
      coverImageUrl: z.string().url().optional(),
      targetGenders: z.array(GenderEnum).optional().default([]),
      targetOrientations: z.array(OrientationEnum).optional().default([]),
      targetMinAge: z.number().int().optional(),
      targetMaxAge: z.number().int().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.create({
        data: {
          createdById: ctx.userId,
          title: input.title,
          description: input.description,
          type: input.type,
          status: input.status,
          startsAt: new Date(input.startsAt),
          endsAt: input.endsAt ? new Date(input.endsAt) : null,
          locationName: input.locationName,
          capacity: input.capacity,
          price: input.price,
          currency: input.currency,
          coverImageUrl: input.coverImageUrl,
          targetGenders: input.targetGenders,
          targetOrientations: input.targetOrientations,
          targetMinAge: input.targetMinAge,
          targetMaxAge: input.targetMaxAge,
        },
      })

      if (input.latitude !== undefined && input.longitude !== undefined) {
        await ctx.prisma.$executeRaw`
          UPDATE events
          SET location = ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography
          WHERE id = ${event.id}::uuid
        `
      }

      return event
    }),

  update: protectedProcedure
    .input(z.object({
      eventId: z.string().uuid(),
      title: z.string().max(200).optional(),
      description: z.string().max(4000).optional(),
      type: z.enum(['ONLINE', 'IRL', 'HYBRID']).optional(),
      status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
      startsAt: z.string().datetime().optional(),
      endsAt: z.string().datetime().optional(),
      locationName: z.string().max(500).optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      capacity: z.number().int().positive().optional(),
      price: z.number().positive().optional(),
      currency: z.string().optional(),
      coverImageUrl: z.string().url().optional(),
      targetGenders: z.array(GenderEnum).optional(),
      targetOrientations: z.array(OrientationEnum).optional(),
      targetMinAge: z.number().int().optional(),
      targetMaxAge: z.number().int().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.eventId },
      })

      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      }

      if (event.createdById !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not the event creator' })
      }

      const updateData: Record<string, unknown> = {}
      if (input.title !== undefined) updateData.title = input.title
      if (input.description !== undefined) updateData.description = input.description
      if (input.type !== undefined) updateData.type = input.type
      if (input.status !== undefined) updateData.status = input.status
      if (input.startsAt !== undefined) updateData.startsAt = new Date(input.startsAt)
      if (input.endsAt !== undefined) updateData.endsAt = input.endsAt ? new Date(input.endsAt) : null
      if (input.locationName !== undefined) updateData.locationName = input.locationName
      if (input.capacity !== undefined) updateData.capacity = input.capacity
      if (input.price !== undefined) updateData.price = input.price
      if (input.currency !== undefined) updateData.currency = input.currency
      if (input.coverImageUrl !== undefined) updateData.coverImageUrl = input.coverImageUrl
      if (input.targetGenders !== undefined) updateData.targetGenders = input.targetGenders
      if (input.targetOrientations !== undefined) updateData.targetOrientations = input.targetOrientations
      if (input.targetMinAge !== undefined) updateData.targetMinAge = input.targetMinAge
      if (input.targetMaxAge !== undefined) updateData.targetMaxAge = input.targetMaxAge

      const updated = await ctx.prisma.event.update({
        where: { id: input.eventId },
        data: updateData,
      })

      if (input.latitude !== undefined && input.longitude !== undefined) {
        await ctx.prisma.$executeRaw`
          UPDATE events
          SET location = ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography
          WHERE id = ${updated.id}::uuid
        `
      }

      return updated
    }),

  get: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.eventId },
        include: {
          _count: {
            select: {
              attendees: true,
              tickets: true,
            },
          },
          creator: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      })

      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      }

      if (event.status === 'DRAFT' && event.createdById !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Event not yet published' })
      }

      return event
    }),

  list: protectedProcedure
    .input(z.object({
      cursor: z.string().uuid().optional(),
      limit: z.number().int().min(1).max(50).default(20),
      type: z.enum(['ONLINE', 'IRL', 'HYBRID']).optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
      organizerId: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit, type, status, organizerId } = input

      const whereClause: Record<string, unknown> = {}
      if (type) whereClause.type = type
      if (status) {
        whereClause.status = status
      } else if (!organizerId) {
        whereClause.status = { in: ['PUBLISHED', 'COMPLETED'] }
      }
      if (organizerId) whereClause.createdById = organizerId

      const events = await ctx.prisma.event.findMany({
        where: whereClause,
        take: limit + 1,
        ...(cursor
          ? {
              cursor: { id: cursor },
              skip: 1,
            }
          : {}),
        orderBy: { startsAt: 'asc' },
      })

      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
        select: { gender: true, orientation: true, age: true },
      })

      const filtered = profile
        ? events.filter(e => e.createdById === ctx.userId || matchesEventTargeting(profile as TargetableProfile, e as TargetableEvent))
        : events

      let nextCursor: string | undefined
      if (events.length > limit) {
        nextCursor = events[limit]?.id
      }

      return { events: filtered, nextCursor }
    }),

  search: protectedProcedure
    .input(z.object({
      lat: z.number(),
      lng: z.number(),
      radiusKm: z.number().default(50),
      limit: z.number().int().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const radiusMeters = input.radiusKm * 1000

      const events = await ctx.prisma.$queryRaw<
        Array<{
          id: string
          title: string
          description: string | null
          type: string
          status: string
          startsAt: Date
          endsAt: Date | null
          locationName: string | null
          capacity: number | null
          price: string | null
          currency: string
          coverImageUrl: string | null
          createdById: string
          createdAt: Date
          distance_km: number
          targetGenders: string[]
          targetOrientations: string[]
          targetMinAge: number | null
          targetMaxAge: number | null
        }>
      >`
        SELECT
          e.id,
          e.title,
          e.description,
          e.type,
          e.status,
          e.starts_at as "startsAt",
          e.ends_at as "endsAt",
          e.location_name as "locationName",
          e.capacity,
          e.price,
          e.currency,
          e.cover_image_url as "coverImageUrl",
          e.created_by_id as "createdById",
          e.created_at as "createdAt",
          e.target_genders as "targetGenders",
          e.target_orientations as "targetOrientations",
          e.target_min_age as "targetMinAge",
          e.target_max_age as "targetMaxAge",
          ST_Distance(e.location::geography, ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)::geography) / 1000 AS distance_km
        FROM events e
        WHERE e.status = 'PUBLISHED'
          AND e.location IS NOT NULL
          AND ST_DWithin(e.location::geography, ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)::geography, ${radiusMeters})
        ORDER BY distance_km ASC
        LIMIT ${input.limit}
      `

      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
        select: { gender: true, orientation: true, age: true },
      })

      const filtered = profile
        ? events.filter(e => e.createdById === ctx.userId || matchesEventTargeting(profile as TargetableProfile, e as TargetableEvent))
        : events

      return filtered
    }),

  rsvp: protectedProcedure
    .input(z.object({
      eventId: z.string().uuid(),
      status: z.enum(['GOING', 'WAITLIST', 'DECLINED']).default('GOING'),
    }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.eventId },
      })

      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      }

      if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot RSVP to a cancelled or completed event' })
      }

      const attendee = await ctx.prisma.eventAttendee.upsert({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: ctx.userId,
          },
        },
        create: {
          eventId: input.eventId,
          userId: ctx.userId,
          status: input.status,
        },
        update: {
          status: input.status,
        },
      })

      return attendee
    }),

  getAttendees: protectedProcedure
    .input(z.object({
      eventId: z.string().uuid(),
      limit: z.number().int().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const attendees = await ctx.prisma.eventAttendee.findMany({
        where: { eventId: input.eventId },
        take: input.limit,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      })

      return attendees
    }),

  cancel: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.eventId },
      })

      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      }

      if (event.createdById !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not the event creator' })
      }

      const updated = await ctx.prisma.event.update({
        where: { id: input.eventId },
        data: { status: 'CANCELLED' },
      })

      return updated
    }),
})
