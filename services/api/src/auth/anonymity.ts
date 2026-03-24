import { PrismaClient } from '@prisma/client'
import { decrypt } from './crypto.js'

const PROFANITY_LIST = [
  'admin',
  'moderator',
  'support',
  'official',
  'system',
  'root',
  'administrator',
]

function validateDisplayName(displayName: string): void {
  if (displayName.length < 3 || displayName.length > 30) {
    throw new Error('Display name must be 3-30 characters')
  }

  if (!/^[a-zA-Z0-9_åäöÅÄÖ]+$/.test(displayName)) {
    throw new Error('Display name can only contain letters, numbers, underscores, and Swedish characters')
  }

  if (PROFANITY_LIST.includes(displayName.toLowerCase())) {
    throw new Error('Display name contains reserved words')
  }
}

export async function setDisplayName(
  prisma: PrismaClient,
  userId: string,
  displayName: string,
): Promise<void> {
  validateDisplayName(displayName)

  const existing = await prisma.user.findFirst({
    where: {
      displayName,
      id: { not: userId },
    },
  })

  if (existing) {
    throw new Error('Display name already taken')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { displayName },
  })
}

export async function decryptUserIdentity(
  prisma: PrismaClient,
  userId: string,
): Promise<{ firstName: string; lastName: string; personnummer: string }> {
  const identity = await prisma.encryptedIdentity.findUnique({
    where: { userId },
  })

  if (!identity) {
    throw new Error('Identity not found')
  }

  return {
    firstName: decrypt(identity.encryptedFirstName, identity.iv),
    lastName: decrypt(identity.encryptedLastName, identity.iv),
    personnummer: decrypt(identity.encryptedPersonnummer, identity.iv),
  }
}

export async function getSafeUserProfile(
  prisma: PrismaClient,
  userId: string,
): Promise<{ id: string; displayName: string | null; status: string; createdAt: Date }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, displayName: true, status: true, createdAt: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}
