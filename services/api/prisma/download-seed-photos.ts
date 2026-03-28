/**
 * Download all seed celebrity photos to web public dir
 * and update ProfilePhoto URLs in database to point to local files.
 */
import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()
const PUBLIC_DIR = join(__dirname, '../../../apps/web/public/seed-photos')

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function main() {
  mkdirSync(PUBLIC_DIR, { recursive: true })

  const devNames = [
    'Scarlett J', 'Angelina J', 'Brad P', 'George C', 'Margot R',
    'Ryan G', 'Jennifer L', 'Chris H', 'Zoe S', 'Leonardo D',
    'Charlize T', 'Idris E', 'Eva M', 'Jason M', 'Priyanka C',
    'Ryan R', 'Halle B', 'Tom H', 'Lupita N', 'Henry C',
  ]
  const profiles = await prisma.profile.findMany({
    where: { displayName: { in: devNames } },
    include: { photos: { orderBy: { position: 'asc' } } },
  })

  console.log(`Found ${profiles.length} dev profiles`)

  for (const profile of profiles) {
    const slug = profile.displayName.toLowerCase().replace(/\s+/g, '-')
    console.log(`\n${profile.displayName} (${profile.photos.length} photos)`)

    for (let i = 0; i < profile.photos.length; i++) {
      const photo = profile.photos[i]
      const filename = `${slug}-${i + 1}.jpg`
      const localPath = join(PUBLIC_DIR, filename)
      const publicUrl = `/seed-photos/${filename}`

      // Skip if already a local URL
      if (photo.url.startsWith('/seed-photos/')) {
        console.log(`  ⏭ Photo ${i + 1}: already local`)
        continue
      }

      // Download from Wikipedia with rate limit delay
      await sleep(1500)
      try {
        const resp = await fetch(photo.url, {
          headers: { 'User-Agent': 'LustreDev/1.0 (https://lovelustre.com; seed photo download; contact@lovelustre.com)' },
        })
        if (!resp.ok) {
          console.log(`  ✗ Photo ${i + 1}: HTTP ${resp.status}`)
          continue
        }
        const buffer = Buffer.from(await resp.arrayBuffer())
        writeFileSync(localPath, buffer)
        console.log(`  ✓ Photo ${i + 1}: ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`)

        // Update database URL
        await prisma.profilePhoto.update({
          where: { id: photo.id },
          data: {
            url: publicUrl,
            thumbnailSmall: publicUrl,
            thumbnailMedium: publicUrl,
            thumbnailLarge: publicUrl,
          },
        })
      } catch (err) {
        console.log(`  ✗ Photo ${i + 1}: ${(err as Error).message}`)
      }
    }
  }

  console.log('\n✅ Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
