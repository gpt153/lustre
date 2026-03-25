import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { createTicketPaymentRequest } from '../lib/event-tickets.js'

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

  purchaseTicket: protectedProcedure
    .input(z.object({ eventId: z.string().uuid(), phoneNumber: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      // Check user doesn't already have a VALID ticket
      const existing = await ctx.prisma.eventTicket.findFirst({
        where: { eventId: input.eventId, userId: ctx.userId, status: 'VALID' },
      })
      if (existing) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already have a ticket' })
      }

      const result = await createTicketPaymentRequest(ctx.prisma, ctx.userId, input.eventId, input.phoneNumber)
      return result
    }),

  checkTicketStatus: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.prisma.eventTicket.findFirst({
        where: { eventId: input.eventId, userId: ctx.userId },
        orderBy: { purchasedAt: 'desc' },
      })
      return ticket ? { status: ticket.status, ticketId: ticket.id } : null
    }),

  validateTicket: protectedProcedure
    .input(z.object({ eventId: z.string().uuid(), ticketId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND' })
      if (event.createdById !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN' })
      const ticket = await ctx.prisma.eventTicket.findUnique({ where: { id: input.ticketId } })
      if (!ticket || ticket.eventId !== input.eventId) throw new TRPCError({ code: 'NOT_FOUND' })
      if (ticket.status !== 'VALID') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Ticket not valid' })
      return ctx.prisma.eventTicket.update({
        where: { id: input.ticketId },
        data: { status: 'USED', usedAt: new Date() },
      })
    }),

  refundTicket: protectedProcedure
    .input(z.object({ ticketId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.prisma.eventTicket.findUnique({
        where: { id: input.ticketId },
        include: { event: true },
      })
      if (!ticket) throw new TRPCError({ code: 'NOT_FOUND' })
      if (ticket.event.createdById !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN' })
      return ctx.prisma.eventTicket.update({
        where: { id: input.ticketId },
        data: { status: 'REFUNDED', refundedAt: new Date() },
      })
    }),

  nearby: protectedProcedure
    .input(z.object({
      lat: z.number(),
      lng: z.number(),
      radiusKm: z.number().positive().default(50),
      limit: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const radiusMeters = input.radiusKm * 1000

      // Fetch user profile for targeting
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
        select: { gender: true, orientation: true, age: true },
      })

      // PostGIS raw query - returns events within radius with distance
      // Include targeting fields so we can filter in TS
      const events = await ctx.prisma.$queryRaw<Array<{
        id: string; title: string; description: string | null; type: string; status: string;
        startsAt: Date; endsAt: Date | null; locationName: string | null;
        capacity: number | null; price: string | null; currency: string;
        coverImageUrl: string | null; createdById: string; createdAt: Date;
        targetGenders: string[]; targetOrientations: string[];
        targetMinAge: number | null; targetMaxAge: number | null;
        distanceKm: number;
      }>>`
        SELECT
          e.id, e.title, e.description, e.type::text, e.status::text,
          e.starts_at as "startsAt", e.ends_at as "endsAt",
          e.location_name as "locationName", e.capacity,
          e.price::text, e.currency, e.cover_image_url as "coverImageUrl",
          e.created_by_id as "createdById", e.created_at as "createdAt",
          e.target_genders as "targetGenders",
          e.target_orientations as "targetOrientations",
          e.target_min_age as "targetMinAge", e.target_max_age as "targetMaxAge",
          ST_Distance(
            e.location::geography,
            ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)::geography
          ) / 1000.0 AS "distanceKm"
        FROM events e
        WHERE e.status = 'PUBLISHED'
          AND e.location IS NOT NULL
          AND ST_DWithin(
            e.location::geography,
            ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)::geography,
            ${radiusMeters}
          )
        ORDER BY "distanceKm" ASC
        LIMIT ${input.limit}
      `

      // Apply targeting filter
      const filtered = profile
        ? events.filter(e => e.createdById === ctx.userId || matchesEventTargeting(profile as TargetableProfile, e as TargetableEvent))
        : events

      return filtered
    }),

  calendar: protectedProcedure
    .input(z.object({
      year: z.number().int().min(2020).max(2100),
      month: z.number().int().min(1).max(12),
    }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month - 1, 1)
      const endDate = new Date(input.year, input.month, 0, 23, 59, 59)

      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
        select: { gender: true, orientation: true, age: true },
      })

      const events = await ctx.prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          startsAt: { gte: startDate, lte: endDate },
        },
        orderBy: { startsAt: 'asc' },
        include: { _count: { select: { attendees: true } } },
      })

      const filtered = profile
        ? events.filter(e => e.createdById === ctx.userId || matchesEventTargeting(profile as TargetableProfile, e as TargetableEvent))
        : events

      // Group by date string YYYY-MM-DD
      const grouped = new Map<string, typeof filtered>()
      for (const event of filtered) {
        const dateKey = event.startsAt.toISOString().split('T')[0]
        if (!grouped.has(dateKey)) grouped.set(dateKey, [])
        grouped.get(dateKey)!.push(event)
      }

      return Array.from(grouped.entries()).map(([date, events]) => ({ date, events }))
    }),

  listFiltered: protectedProcedure
    .input(z.object({
      type: z.enum(['ONLINE', 'IRL', 'HYBRID']).optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      radiusKm: z.number().positive().default(50),
      cursor: z.string().uuid().optional(),
      limit: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
        select: { gender: true, orientation: true, age: true },
      })

      // If location filter provided, use PostGIS raw query
      if (input.lat !== undefined && input.lng !== undefined) {
        const radiusMeters = input.radiusKm * 1000
        // Build type filter fragment - keep it simple, apply in TS after
        const events = await ctx.prisma.$queryRaw<Array<{
          id: string; title: string; description: string | null; type: string; status: string;
          startsAt: Date; endsAt: Date | null; locationName: string | null;
          capacity: number | null; price: string | null; currency: string;
          coverImageUrl: string | null; createdById: string; createdAt: Date;
          targetGenders: string[]; targetOrientations: string[];
          targetMinAge: number | null; targetMaxAge: number | null;
          distanceKm: number;
        }>>`
          SELECT
            e.id, e.title, e.description, e.type::text, e.status::text,
            e.starts_at as "startsAt", e.ends_at as "endsAt",
            e.location_name as "locationName", e.capacity,
            e.price::text, e.currency, e.cover_image_url as "coverImageUrl",
            e.created_by_id as "createdById", e.created_at as "createdAt",
            e.target_genders as "targetGenders",
            e.target_orientations as "targetOrientations",
            e.target_min_age as "targetMinAge", e.target_max_age as "targetMaxAge",
            ST_Distance(
              e.location::geography,
              ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)::geography
            ) / 1000.0 AS "distanceKm"
          FROM events e
          WHERE e.status = 'PUBLISHED'
            AND e.location IS NOT NULL
            AND ST_DWithin(
              e.location::geography,
              ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)::geography,
              ${radiusMeters}
            )
          ORDER BY "distanceKm" ASC
          LIMIT ${input.limit + 1}
        `

        let filtered = profile
          ? events.filter(e => e.createdById === ctx.userId || matchesEventTargeting(profile as TargetableProfile, e as TargetableEvent))
          : events

        // Apply type filter
        if (input.type) filtered = filtered.filter(e => e.type === input.type)
        // Apply date filter
        if (input.dateFrom) filtered = filtered.filter(e => e.startsAt >= new Date(input.dateFrom!))
        if (input.dateTo) filtered = filtered.filter(e => e.startsAt <= new Date(input.dateTo!))

        const hasMore = filtered.length > input.limit
        const slice = filtered.slice(0, input.limit)
        return { events: slice, nextCursor: hasMore ? slice[slice.length - 1]?.id : null }
      }

      // Standard Prisma query path
      const whereClause: Record<string, any> = { status: 'PUBLISHED' }
      if (input.type) whereClause.type = input.type
      if (input.dateFrom || input.dateTo) {
        whereClause.startsAt = {
          ...(input.dateFrom ? { gte: new Date(input.dateFrom) } : {}),
          ...(input.dateTo ? { lte: new Date(input.dateTo) } : {}),
        }
      }
      if (input.cursor) whereClause.id = { gt: input.cursor }  // simple cursor by id; use startsAt cursor for production

      const events = await ctx.prisma.event.findMany({
        where: whereClause,
        orderBy: { startsAt: 'asc' },
        take: input.limit + 1,
        include: { _count: { select: { attendees: true } } },
      })

      const filtered = profile
        ? events.filter(e => e.createdById === ctx.userId || matchesEventTargeting(profile as TargetableProfile, e as TargetableEvent))
        : events

      const hasMore = filtered.length > input.limit
      const slice = filtered.slice(0, input.limit)
      return { events: slice, nextCursor: hasMore ? slice[slice.length - 1]?.id : null }
    }),

  recommended: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
        select: { gender: true, orientation: true, age: true },
      })

      const now = new Date()
      const events = await ctx.prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          startsAt: { gte: now },
        },
        orderBy: { startsAt: 'asc' },
        take: 100, // score top 100
        include: { _count: { select: { attendees: true } } },
      })

      // Apply targeting filter first
      const visible = profile
        ? events.filter(e => e.createdById === ctx.userId || matchesEventTargeting(profile as TargetableProfile, e as TargetableEvent))
        : events

      // Score events
      const scored = visible.map(event => {
        let score = 0
        // Prefer in-person events
        if (event.type === 'IRL' || event.type === 'HYBRID') score += 3
        // Prefer events in next 7 days
        const daysUntil = (event.startsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        if (daysUntil <= 7) score += 2
        // Targeting match bonus
        if (profile) {
          if (event.targetOrientations.length > 0 && event.targetOrientations.includes(profile.orientation)) score += 1
          if (event.targetMinAge !== null && event.targetMaxAge !== null &&
              profile.age >= event.targetMinAge && profile.age <= event.targetMaxAge) score += 1
        }
        return { ...event, score }
      })

      // Sort by score desc, then startsAt asc
      scored.sort((a, b) => b.score - a.score || a.startsAt.getTime() - b.startsAt.getTime())

      return scored.slice(0, input.limit)
    }),
})
