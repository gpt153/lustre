import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface BadgeInfo {
  id: string
  name: string
  category: string
}

export async function suggestBadges(
  freeText: string,
  availableBadges: BadgeInfo[]
): Promise<string[]> {
  const badgeList = availableBadges
    .map((b) => `- ${b.id}: ${b.name} (${b.category})`)
    .join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    timeout: 5000,
    messages: [
      {
        role: 'system',
        content: `Du är en hjälpare som matchar fritext-beskrivningar av sociala interaktioner till lämpliga kudos-badges.

Givet en fritext-beskrivning på svenska och en lista med tillgängliga badges, returnera de 2-4 mest relevanta badge-ID:n som JSON-array.

Tillgängliga badges:
${badgeList}

REGLER:
- Returnera EXAKT 2-4 badge-ID:n som en JSON-array av strängar
- Välj bara ID:n från listan ovan
- Matcha baserat på semantisk likhet mellan beskrivningen och badge-namnen
- Svara BARA med JSON-arrayen, inget annat`,
      },
      {
        role: 'user',
        content: freeText,
      },
    ],
  })

  const content = response.choices[0]?.message?.content?.trim()
  if (!content) return []

  try {
    const parsed = JSON.parse(content)
    if (!Array.isArray(parsed)) return []

    const validIds = new Set(availableBadges.map((b) => b.id))
    const filtered = parsed.filter((id: unknown) => typeof id === 'string' && validIds.has(id))

    if (filtered.length < 2) return []
    return filtered.slice(0, 4)
  } catch {
    return []
  }
}
