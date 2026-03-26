import { PrismaClient } from '@prisma/client'
import { generateAndStorePodcast } from '../src/lib/podcast-generator.js'

const prisma = new PrismaClient()

async function main() {
  const topic = await prisma.educationTopic.findFirst({ orderBy: { order: 'asc' } })

  if (!topic) {
    console.log('No topics found. Run seed first.')
    return
  }

  console.log(`Generating podcast for: ${topic.title}`)
  const audioUrl = await generateAndStorePodcast(
    prisma,
    topic.id,
    topic.title,
    topic.description,
    topic.slug,
    'sv'
  )

  console.log(`Generated podcast: ${topic.title} → ${audioUrl}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
