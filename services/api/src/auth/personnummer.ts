import { createHash } from 'crypto'

/**
 * Normalize a Swedish personnummer to 12-digit format (YYYYMMDDXXXX).
 * Accepts both 10-digit (YYMMDDXXXX) and 12-digit (YYYYMMDDXXXX) formats.
 * The 10-digit form uses a '-' or '+' separator which this function also handles.
 */
export function parsePersonnummer(raw: string): string {
  // Strip whitespace and separators
  const cleaned = raw.replace(/[\s\-+]/g, '')

  if (cleaned.length === 12) {
    // Already 12-digit format
    if (!/^\d{12}$/.test(cleaned)) {
      throw new Error(`Invalid personnummer format: ${raw}`)
    }
    return cleaned
  }

  if (cleaned.length === 10) {
    if (!/^\d{10}$/.test(cleaned)) {
      throw new Error(`Invalid personnummer format: ${raw}`)
    }
    // Expand YY to YYYY using a century pivot: if YY > current 2-digit year, assume 1900s
    const yy = parseInt(cleaned.slice(0, 2), 10)
    const currentYear = new Date().getFullYear()
    const currentYY = currentYear % 100
    const century = yy <= currentYY ? 2000 : 1900
    const yyyy = century + yy
    return `${yyyy}${cleaned.slice(2)}`
  }

  throw new Error(`Invalid personnummer length: ${raw}`)
}

/**
 * Hash a personnummer using SHA-256 for use as a unique DB key.
 * Input should be in 12-digit normalized form.
 */
export function hashPersonnummer(personnummer: string): string {
  return createHash('sha256').update(personnummer).digest('hex')
}

/**
 * Validate that the person represented by the personnummer is 18 or older.
 * Expects 12-digit format: YYYYMMDDXXXX
 */
export function validateAge(personnummer: string): boolean {
  const normalized = parsePersonnummer(personnummer)
  const year = parseInt(normalized.slice(0, 4), 10)
  const month = parseInt(normalized.slice(4, 6), 10) - 1 // 0-indexed
  const day = parseInt(normalized.slice(6, 8), 10)

  const birthDate = new Date(year, month, day)
  const today = new Date()

  // Calculate 18th birthday
  const eighteenthBirthday = new Date(year + 18, month, day)

  return today >= eighteenthBirthday
}
