import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import sharp from 'sharp'
import * as cheerio from 'cheerio'
import { router, protectedProcedure } from './middleware.js'
import { uploadToR2 } from '../lib/r2.js'

const usernameSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,50}$/, {
  message: 'Ogiltigt användarnamn. Endast bokstäver, siffror, bindestreck och understreck är tillåtna.',
})

export const migrationRouter = router({
  previewBodyContact: protectedProcedure
    .input(z.object({ username: usernameSchema }))
    .query(async ({ input }) => {
      const { username } = input

      const url = `https://www.bodycontact.com/profiles/${username}`

      let html: string
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        })

        if (response.status === 404) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Profilen "${username}" hittades inte på BodyContact.`,
          })
        }

        if (!response.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Kunde inte hämta profilen. Status: ${response.status}`,
          })
        }

        html = await response.text()
      } catch (err) {
        if (err instanceof TRPCError) throw err
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Nätverksfel vid hämtning av BodyContact-profil.',
        })
      }

      const $ = cheerio.load(html)

      // Extract bio text from description/about sections
      let bio = ''
      const bioSelectors = [
        '.profile-description',
        '.profile-about',
        '[class*="description"]',
        '[class*="about"]',
        '[class*="bio"]',
        '.profile-text',
        '[itemprop="description"]',
      ]
      for (const selector of bioSelectors) {
        const el = $(selector).first()
        if (el.length) {
          const text = el.text().trim()
          if (text.length > 10) {
            bio = text
            break
          }
        }
      }
      // Fallback: look for paragraphs inside main profile content
      if (!bio) {
        $('main p, .profile-content p, .profile-body p').each((_, el) => {
          const text = $(el).text().trim()
          if (text.length > 20 && bio.length < 200) {
            bio += (bio ? ' ' : '') + text
          }
        })
      }
      bio = bio.slice(0, 2000)

      // Extract photo URLs from profile photo sections
      const photoUrls: string[] = []
      const photoSelectors = [
        '.profile-photos img',
        '.profile-gallery img',
        '[class*="photo"] img',
        '[class*="gallery"] img',
        '.profile-image img',
        '.photos img',
      ]
      for (const selector of photoSelectors) {
        if (photoUrls.length >= 6) break
        $(selector).each((_, el) => {
          if (photoUrls.length >= 6) return false
          const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src')
          if (src && !src.includes('placeholder') && !src.includes('avatar') && src.startsWith('http')) {
            if (!photoUrls.includes(src)) {
              photoUrls.push(src)
            }
          }
        })
      }
      // Fallback: grab any profile-related images
      if (photoUrls.length === 0) {
        $('img').each((_, el) => {
          if (photoUrls.length >= 6) return false
          const src = $(el).attr('src') || $(el).attr('data-src')
          if (
            src &&
            src.startsWith('http') &&
            !src.includes('logo') &&
            !src.includes('icon') &&
            !src.includes('placeholder')
          ) {
            if (!photoUrls.includes(src)) {
              photoUrls.push(src)
            }
          }
        })
      }

      return {
        username,
        bio,
        photoUrls: photoUrls.slice(0, 6),
      }
    }),

  importBodyContact: protectedProcedure
    .input(
      z.object({
        username: usernameSchema,
        bio: z.string().max(2000).optional(),
        photoUrls: z.array(z.string().url()).max(6),
        consent: z.literal(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
      })

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ingen profil hittades för ditt konto.',
        })
      }

      // Update bio if provided
      if (input.bio !== undefined) {
        await ctx.prisma.profile.update({
          where: { id: profile.id },
          data: { bio: input.bio || null },
        })
      }

      // Determine starting position for new photos
      const existingCount = await ctx.prisma.profilePhoto.count({
        where: { profileId: profile.id },
      })

      let imported = 0
      const urlsToImport = input.photoUrls.slice(0, 6)

      for (let index = 0; index < urlsToImport.length; index++) {
        const photoUrl = urlsToImport[index]

        try {
          const imageResponse = await fetch(photoUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            },
          })

          if (!imageResponse.ok) continue

          const arrayBuffer = await imageResponse.arrayBuffer()
          const inputBuffer = Buffer.from(arrayBuffer)

          const webpBuffer = await sharp(inputBuffer)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer()

          const key = `profiles/${ctx.userId}/imported-${index}.webp`
          const publicUrl = await uploadToR2(key, webpBuffer, 'image/webp')

          // Generate thumbnails
          const smallBuffer = await sharp(inputBuffer)
            .resize(100, 100, { fit: 'cover' })
            .webp({ quality: 80 })
            .toBuffer()
          const mediumBuffer = await sharp(inputBuffer)
            .resize(300, 300, { fit: 'cover' })
            .webp({ quality: 80 })
            .toBuffer()
          const largeBuffer = await sharp(inputBuffer)
            .resize(600, 600, { fit: 'cover' })
            .webp({ quality: 80 })
            .toBuffer()

          const smallUrl = await uploadToR2(
            `profiles/${ctx.userId}/imported-${index}-small.webp`,
            smallBuffer,
            'image/webp'
          )
          const mediumUrl = await uploadToR2(
            `profiles/${ctx.userId}/imported-${index}-medium.webp`,
            mediumBuffer,
            'image/webp'
          )
          const largeUrl = await uploadToR2(
            `profiles/${ctx.userId}/imported-${index}-large.webp`,
            largeBuffer,
            'image/webp'
          )

          await ctx.prisma.profilePhoto.create({
            data: {
              profileId: profile.id,
              url: publicUrl,
              thumbnailSmall: smallUrl,
              thumbnailMedium: mediumUrl,
              thumbnailLarge: largeUrl,
              position: existingCount + index,
              isPublic: true,
            },
          })

          imported++
        } catch {
          // Skip failed photos — don't abort the entire import
          continue
        }
      }

      return { imported }
    }),
})
