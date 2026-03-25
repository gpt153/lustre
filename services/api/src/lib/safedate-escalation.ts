import twilio from 'twilio'
import { prisma } from '../trpc/context.js'
import { decrypt } from '../auth/crypto.js'
import type { SafeDate, SafetyContact } from '@prisma/client'

type SafeDateWithContacts = SafeDate & {
  safetyContacts: SafetyContact[]
  user: {
    displayName: string | null
    profile: {
      displayName: string
    } | null
  }
}

async function sendEscalationSMS(
  sd: SafeDateWithContacts,
  contact: SafetyContact,
): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    console.warn(
      '[SafeDate escalation] Twilio env vars not set — skipping SMS to',
      contact.phone,
    )
    return
  }

  // Get last known GPS position
  let locationStr = 'okänd'
  try {
    const lastGps = await prisma.gPSLog.findFirst({
      where: { safeDateId: sd.id },
      orderBy: { recordedAt: 'desc' },
    })

    if (lastGps) {
      const lat = decrypt(lastGps.latEncrypted, lastGps.iv)
      const lng = decrypt(lastGps.lngEncrypted, lastGps.iv)
      locationStr = `${lat},${lng}`
    }
  } catch (err) {
    console.error('[SafeDate escalation] Failed to decrypt GPS for safeDate', sd.id, err)
  }

  const displayName =
    sd.user.profile?.displayName ?? sd.user.displayName ?? 'okänd'

  const body =
    `NÖDSIGNAL — Lustre SafeDate: ${displayName} har inte checkat in. ` +
    `Senaste position: ${locationStr}. ` +
    `Live: https://lovelustre.com/safe/${sd.shareToken}`

  try {
    const client = twilio(accountSid, authToken)
    await client.messages.create({
      body,
      from: fromNumber,
      to: contact.phone,
    })
  } catch (err) {
    console.error(
      '[SafeDate escalation] Failed to send SMS to',
      contact.phone,
      'for safeDate',
      sd.id,
      err,
    )
  }
}

export function startEscalationService(): void {
  setInterval(async () => {
    try {
      const overdue = await prisma.safeDate.findMany({
        where: {
          status: { in: ['ACTIVE', 'CHECKED_IN'] },
          expiresAt: { lt: new Date() },
        },
        include: {
          safetyContacts: true,
          user: { include: { profile: true } },
        },
      })

      for (const sd of overdue) {
        // Mark escalated first to prevent duplicate processing
        await prisma.safeDate.update({
          where: { id: sd.id },
          data: { status: 'ESCALATED', escalatedAt: new Date() },
        })

        // Send SMS to each safety contact that hasn't been notified yet
        for (const contact of sd.safetyContacts) {
          if (contact.smsSentAt) continue

          await sendEscalationSMS(sd as SafeDateWithContacts, contact)

          await prisma.safetyContact.update({
            where: { id: contact.id },
            data: { smsSentAt: new Date() },
          })
        }
      }
    } catch (err) {
      console.error('[SafeDate escalation] Interval error:', err)
    }
  }, 60_000)
}
