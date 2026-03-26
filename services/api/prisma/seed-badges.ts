import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  {
    name: 'Kommunikation',
    slug: 'kommunikation',
    sortOrder: 1,
    badges: [
      { name: 'Tydlig profil', slug: 'tydlig-profil', sortOrder: 1 },
      { name: 'Ärlig om intentioner', slug: 'arlig-om-intentioner', sortOrder: 2 },
      { name: 'Svarar snabbt', slug: 'svarar-snabbt', sortOrder: 3 },
      { name: 'Aktiv lyssnare', slug: 'aktiv-lyssnare', sortOrder: 4 },
      { name: 'Bra konversatör', slug: 'bra-konversator', sortOrder: 5 },
      { name: 'Ghostade inte', slug: 'ghostade-inte', sortOrder: 6 },
    ],
  },
  {
    name: 'Respekt & trygghet',
    slug: 'respekt-trygghet',
    sortOrder: 2,
    badges: [
      { name: 'Respekterar gränser', slug: 'respekterar-granser', sortOrder: 1 },
      { name: 'Tar nej som nej', slug: 'tar-nej-som-nej', sortOrder: 2 },
      { name: 'Diskret', slug: 'diskret', sortOrder: 3 },
      { name: 'Pressade inte', slug: 'pressade-inte', sortOrder: 4 },
      { name: 'Trygg att träffa', slug: 'trygg-att-traffa', sortOrder: 5 },
      { name: 'Konsekvent beteende', slug: 'konsekvent-beteende', sortOrder: 6 },
    ],
  },
  {
    name: 'IRL-möten',
    slug: 'irl-moten',
    sortOrder: 3,
    badges: [
      { name: 'Dök upp som planerat', slug: 'dok-upp-som-planerat', sortOrder: 1 },
      { name: 'Såg ut som sina bilder', slug: 'sag-ut-som-sina-bilder', sortOrder: 2 },
      { name: 'Ärlig om vad hen sökte', slug: 'arlig-om-vad-hen-sokte', sortOrder: 3 },
      { name: 'Bra energi i person', slug: 'bra-energi-i-person', sortOrder: 4 },
    ],
  },
  {
    name: 'Generellt',
    slug: 'generellt',
    sortOrder: 4,
    badges: [
      { name: 'Trevlig person', slug: 'trevlig-person', sortOrder: 1 },
      { name: 'Skulle träffa igen', slug: 'skulle-traffa-igen', sortOrder: 2 },
      { name: 'Rekommenderas', slug: 'rekommenderas', sortOrder: 3 },
    ],
  },
  {
    name: 'Spicy',
    slug: 'spicy',
    sortOrder: 5,
    badges: [
      { name: 'Kommunicerar kinks tydligt', slug: 'kommunicerar-kinks-tydligt', sortOrder: 1, spicyOnly: true },
      { name: 'Trygg att utforska med', slug: 'trygg-att-utforska-med', sortOrder: 2, spicyOnly: true },
      { name: 'Respekterar safeword', slug: 'respekterar-safeword', sortOrder: 3, spicyOnly: true },
      { name: 'Bra på aftercare', slug: 'bra-pa-aftercare', sortOrder: 4, spicyOnly: true },
      { name: 'Ärlig om erfarenhet', slug: 'arlig-om-erfarenhet', sortOrder: 5, spicyOnly: true },
    ],
  },
]

async function seedBadges() {
  console.log('Seeding kudos badge catalog...')

  for (const cat of categories) {
    const category = await prisma.kudosBadgeCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder },
      create: {
        name: cat.name,
        slug: cat.slug,
        sortOrder: cat.sortOrder,
      },
    })

    for (const badge of cat.badges) {
      await prisma.kudosBadge.upsert({
        where: { slug: badge.slug },
        update: {
          name: badge.name,
          categoryId: category.id,
          sortOrder: badge.sortOrder,
          spicyOnly: badge.spicyOnly ?? false,
        },
        create: {
          name: badge.name,
          slug: badge.slug,
          categoryId: category.id,
          sortOrder: badge.sortOrder,
          spicyOnly: badge.spicyOnly ?? false,
        },
      })
    }
  }

  const count = await prisma.kudosBadge.count()
  console.log(`Seeded ${count} kudos badges in ${categories.length} categories`)
}

seedBadges()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
