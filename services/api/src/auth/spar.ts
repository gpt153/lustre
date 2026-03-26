const ROARING_API_URL = 'https://api.roaring.io/se/person/lookup'

export class SparLookupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SparLookupError'
  }
}

export class SparNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SparNotFoundError'
  }
}

export interface SparResult {
  birthDate: string
  firstName: string
  lastName: string
  isAdult: boolean
  age: number
}

function getApiKey(): string {
  const key = process.env.ROARING_API_KEY
  if (!key) throw new Error('ROARING_API_KEY environment variable is not set')
  return key
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function calculateAge(birthDateStr: string): number {
  const today = new Date()
  const birth = new Date(birthDateStr)
  let age = today.getUTCFullYear() - birth.getUTCFullYear()
  const monthDiff = today.getUTCMonth() - birth.getUTCMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birth.getUTCDate())) {
    age--
  }
  return age
}

export async function lookupSpar(name: string, phone: string): Promise<SparResult> {
  const apiKey = getApiKey()
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let response: Response
    try {
      response = await fetch(ROARING_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone }),
      })
    } catch (err) {
      if (attempt < maxAttempts) {
        await sleep(1000 * Math.pow(2, attempt - 1))
        continue
      }
      throw new SparLookupError(`SPAR API network error after ${maxAttempts} attempts: ${err instanceof Error ? err.message : String(err)}`)
    }

    if (response.status === 404) {
      throw new SparNotFoundError(`Person not found in SPAR for phone: ${phone}`)
    }

    if (response.status === 400) {
      const body = await response.text()
      throw new SparLookupError(`SPAR API bad request: ${body}`)
    }

    if (!response.ok) {
      if (attempt < maxAttempts) {
        await sleep(1000 * Math.pow(2, attempt - 1))
        continue
      }
      throw new SparLookupError(`SPAR API error (${response.status}) after ${maxAttempts} attempts`)
    }

    const data = await response.json() as {
      birthDate?: string
      firstName?: string
      lastName?: string
    }

    if (!data.birthDate || !data.firstName || !data.lastName) {
      throw new SparLookupError('SPAR API returned incomplete data')
    }

    const age = calculateAge(data.birthDate)

    return {
      birthDate: data.birthDate,
      firstName: data.firstName,
      lastName: data.lastName,
      isAdult: age >= 18,
      age,
    }
  }

  throw new SparLookupError(`SPAR lookup failed after ${maxAttempts} attempts`)
}
