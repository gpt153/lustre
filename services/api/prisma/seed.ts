import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const kinkTags: { name: string; category: string }[] = [
  // Bondage (15)
  { name: 'Rope bondage', category: 'Bondage' },
  { name: 'Shibari', category: 'Bondage' },
  { name: 'Handcuffs', category: 'Bondage' },
  { name: 'Chains', category: 'Bondage' },
  { name: 'Spreader bars', category: 'Bondage' },
  { name: 'Tape bondage', category: 'Bondage' },
  { name: 'Suspension', category: 'Bondage' },
  { name: 'Mummification', category: 'Bondage' },
  { name: 'Predicament bondage', category: 'Bondage' },
  { name: 'Self-bondage', category: 'Bondage' },
  { name: 'Collar and leash', category: 'Bondage' },
  { name: 'Blindfolds', category: 'Bondage' },
  { name: 'Gags', category: 'Bondage' },
  { name: 'Chastity', category: 'Bondage' },
  { name: 'Cages', category: 'Bondage' },

  // Dominance/Submission (15)
  { name: 'Domination', category: 'Dominance/Submission' },
  { name: 'Submission', category: 'Dominance/Submission' },
  { name: 'Power exchange', category: 'Dominance/Submission' },
  { name: 'Service submission', category: 'Dominance/Submission' },
  { name: 'Protocol', category: 'Dominance/Submission' },
  { name: 'Orgasm control', category: 'Dominance/Submission' },
  { name: 'Tease and denial', category: 'Dominance/Submission' },
  { name: 'Forced orgasm', category: 'Dominance/Submission' },
  { name: 'Pet play', category: 'Dominance/Submission' },
  { name: 'Puppy play', category: 'Dominance/Submission' },
  { name: 'Kitten play', category: 'Dominance/Submission' },
  { name: 'Pony play', category: 'Dominance/Submission' },
  { name: 'Slave/Master', category: 'Dominance/Submission' },
  { name: 'Domestic discipline', category: 'Dominance/Submission' },
  { name: 'Total power exchange', category: 'Dominance/Submission' },

  // Impact Play (12)
  { name: 'Spanking', category: 'Impact Play' },
  { name: 'Paddling', category: 'Impact Play' },
  { name: 'Flogging', category: 'Impact Play' },
  { name: 'Caning', category: 'Impact Play' },
  { name: 'Whipping', category: 'Impact Play' },
  { name: 'Cropping', category: 'Impact Play' },
  { name: 'Slapping', category: 'Impact Play' },
  { name: 'Hair pulling', category: 'Impact Play' },
  { name: 'Biting', category: 'Impact Play' },
  { name: 'Scratching', category: 'Impact Play' },
  { name: 'Punching', category: 'Impact Play' },
  { name: 'Belt play', category: 'Impact Play' },

  // Sensory (12)
  { name: 'Wax play', category: 'Sensory' },
  { name: 'Ice play', category: 'Sensory' },
  { name: 'Sensation play', category: 'Sensory' },
  { name: 'Electrostimulation', category: 'Sensory' },
  { name: 'Needle play', category: 'Sensory' },
  { name: 'Fire play', category: 'Sensory' },
  { name: 'Tickling', category: 'Sensory' },
  { name: 'Sensory deprivation', category: 'Sensory' },
  { name: 'Temperature play', category: 'Sensory' },
  { name: 'Massage', category: 'Sensory' },
  { name: 'Feathers', category: 'Sensory' },
  { name: 'Pinwheels', category: 'Sensory' },

  // Role Play (12)
  { name: 'Age play', category: 'Role Play' },
  { name: 'Teacher/Student', category: 'Role Play' },
  { name: 'Doctor/Patient', category: 'Role Play' },
  { name: 'Boss/Secretary', category: 'Role Play' },
  { name: 'Stranger scenario', category: 'Role Play' },
  { name: 'Uniform play', category: 'Role Play' },
  { name: 'CNC', category: 'Role Play' },
  { name: 'Interrogation', category: 'Role Play' },
  { name: 'Abduction fantasy', category: 'Role Play' },
  { name: 'Damsel in distress', category: 'Role Play' },
  { name: 'Wrestling', category: 'Role Play' },
  { name: 'Primal play', category: 'Role Play' },

  // Fetish (15)
  { name: 'Latex', category: 'Fetish' },
  { name: 'Leather', category: 'Fetish' },
  { name: 'Lingerie', category: 'Fetish' },
  { name: 'Stockings', category: 'Fetish' },
  { name: 'High heels', category: 'Fetish' },
  { name: 'Boots', category: 'Fetish' },
  { name: 'Corsets', category: 'Fetish' },
  { name: 'Cross-dressing', category: 'Fetish' },
  { name: 'Foot fetish', category: 'Fetish' },
  { name: 'Body worship', category: 'Fetish' },
  { name: 'Masks', category: 'Fetish' },
  { name: 'Rubber', category: 'Fetish' },
  { name: 'PVC', category: 'Fetish' },
  { name: 'Uniforms', category: 'Fetish' },
  { name: 'Cosplay', category: 'Fetish' },

  // Group (10)
  { name: 'Threesome', category: 'Group' },
  { name: 'Group sex', category: 'Group' },
  { name: 'Gangbang', category: 'Group' },
  { name: 'Orgy', category: 'Group' },
  { name: 'Swinging', category: 'Group' },
  { name: 'Cuckolding', category: 'Group' },
  { name: 'Hotwife', category: 'Group' },
  { name: 'Double penetration', category: 'Group' },
  { name: 'Bukkake', category: 'Group' },
  { name: 'Gang play', category: 'Group' },

  // Exhibition/Voyeurism (10)
  { name: 'Exhibitionism', category: 'Exhibition/Voyeurism' },
  { name: 'Voyeurism', category: 'Exhibition/Voyeurism' },
  { name: 'Public play', category: 'Exhibition/Voyeurism' },
  { name: 'Outdoor sex', category: 'Exhibition/Voyeurism' },
  { name: 'Photographing', category: 'Exhibition/Voyeurism' },
  { name: 'Video recording', category: 'Exhibition/Voyeurism' },
  { name: 'Sex clubs', category: 'Exhibition/Voyeurism' },
  { name: 'Glory hole', category: 'Exhibition/Voyeurism' },
  { name: 'Window play', category: 'Exhibition/Voyeurism' },
  { name: 'Nude beaches', category: 'Exhibition/Voyeurism' },

  // Other (10)
  { name: 'Tantric sex', category: 'Other' },
  { name: 'Dirty talk', category: 'Other' },
  { name: 'Sexting', category: 'Other' },
  { name: 'Phone sex', category: 'Other' },
  { name: 'Edging', category: 'Other' },
  { name: 'Aftercare', category: 'Other' },
  { name: 'Negotiation', category: 'Other' },
  { name: 'Safewords', category: 'Other' },
  { name: 'Toy play', category: 'Other' },
  { name: 'Anal play', category: 'Other' },
]

async function main() {
  console.log('Seeding kink tags...')

  for (const tag of kinkTags) {
    await prisma.kinkTag.upsert({
      where: { name: tag.name },
      update: { category: tag.category },
      create: tag,
    })
  }

  console.log(`Seeded ${kinkTags.length} kink tags`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
