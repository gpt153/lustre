import OpenAI from 'openai'

export interface GatekeeperAIConfig {
  strictness: 'MILD' | 'STANDARD' | 'STRICT'
  aiTone: 'FORMAL' | 'CASUAL' | 'FLIRTY'
  customQuestions: string[]
  dealbreakers: string[]
}

export interface RecipientProfile {
  displayName: string
  bio: string | null
  age: number
  gender: string
  orientation: string
  seeking: string[]
  relationshipType: string | null
}

export interface ConversationMessage {
  role: 'USER' | 'AI' | 'SYSTEM'
  content: string
}

export interface AIResponse {
  message: string
  decision: 'CONTINUE' | 'PASS' | 'FAIL'
  summary?: string
}

function formatSeeking(seeking: string[]): string {
  if (seeking.length === 0) return 'various connections'
  const formatted = seeking.map(s =>
    s.toLowerCase().replace(/_/g, ' ')
  )
  if (formatted.length === 1) return formatted[0]
  const last = formatted.pop()
  return `${formatted.join(', ')} and ${last}`
}

function formatGender(gender: string): string {
  return gender.toLowerCase().replace(/_/g, ' ')
}

function formatOrientation(orientation: string): string {
  return orientation.toLowerCase()
}

function formatRelationshipType(type: string | null): string {
  if (!type) return ''
  return type.toLowerCase().replace(/_/g, ' ')
}

function generalizeDealbreakers(dealbreakers: string[]): string[] {
  // Paraphrase dealbreakers into topic areas without revealing verbatim content
  return dealbreakers.map(db => {
    const lower = db.toLowerCase()
    // Group into broad thematic areas
    if (/smok|tobacco|cigarette|vape/.test(lower)) return 'smoking or tobacco use'
    if (/drug|substance|narcotic|weed|cannabis/.test(lower)) return 'recreational substance use'
    if (/alcohol|drink|drunk/.test(lower)) return 'alcohol consumption habits'
    if (/child|kid|parent|famil/.test(lower)) return 'family and children preferences'
    if (/religio|faith|spiritual|church|god|muslim|christian|jew/.test(lower)) return 'religious beliefs and practices'
    if (/politic|vote|liberal|conserv|left|right/.test(lower)) return 'political views'
    if (/pet|dog|cat|animal/.test(lower)) return 'attitudes toward pets and animals'
    if (/diet|vegan|vegetar|meat|food/.test(lower)) return 'dietary lifestyle and preferences'
    if (/monogam|polygam|open|ethical non/.test(lower)) return 'relationship structure expectations'
    if (/sex|intimac|kink|fetish/.test(lower)) return 'intimacy preferences and boundaries'
    if (/age|older|younger/.test(lower)) return 'age range compatibility'
    if (/locat|city|move|relocat|distance/.test(lower)) return 'location and lifestyle flexibility'
    if (/work|career|job|ambition/.test(lower)) return 'career ambitions and work-life balance'
    if (/educat|degree|school|university/.test(lower)) return 'educational background'
    // Fall back to a generic topic area derived from the first few words
    const words = db.trim().split(/\s+/).slice(0, 4).join(' ')
    return `personal values around ${words.toLowerCase()}`
  })
}

function toneInstructions(aiTone: GatekeeperAIConfig['aiTone']): string {
  switch (aiTone) {
    case 'FORMAL':
      return 'Communicate in a professional, polished, and respectful manner. Use complete sentences and a courteous tone at all times.'
    case 'CASUAL':
      return 'Communicate in a warm, friendly, and relaxed manner. Feel free to use conversational language and be approachable.'
    case 'FLIRTY':
      return 'Communicate in a playful, light-hearted, and subtly flirtatious manner. Keep the energy fun and engaging while remaining tasteful and respectful.'
  }
}

function strictnessInstructions(strictness: GatekeeperAIConfig['strictness']): string {
  switch (strictness) {
    case 'MILD':
      return [
        'Qualification guidelines:',
        '- Conduct 2 to 3 conversational exchanges before reaching a decision.',
        '- Apply a lenient and generous assessment — give the sender the benefit of the doubt.',
        '- Only fail a sender if there are clear, obvious red flags.',
        '- When uncertain, lean toward PASS.',
      ].join('\n')
    case 'STANDARD':
      return [
        'Qualification guidelines:',
        '- Conduct 3 to 4 conversational exchanges before reaching a decision.',
        '- Apply a balanced assessment — weigh both positive signals and concerns equally.',
        '- Fail a sender if they show meaningful incompatibilities with the recipient\'s preferences.',
      ].join('\n')
    case 'STRICT':
      return [
        'Qualification guidelines:',
        '- Conduct 4 to 5 conversational exchanges before reaching a decision.',
        '- Apply a thorough, high-bar assessment — the sender must clearly demonstrate compatibility.',
        '- Probe carefully for compatibility across all key topic areas.',
        '- Fail a sender if they show any significant misalignment with the recipient\'s preferences.',
      ].join('\n')
  }
}

export function buildSystemPrompt(config: GatekeeperAIConfig, recipient: RecipientProfile, kudosScore?: number): string {
  const { strictness, aiTone, customQuestions, dealbreakers } = config
  const seekingStr = formatSeeking(recipient.seeking)
  const genderStr = formatGender(recipient.gender)
  const orientationStr = formatOrientation(recipient.orientation)
  const relationshipStr = formatRelationshipType(recipient.relationshipType)

  const lines: string[] = []

  // Role
  lines.push(`You are a friendly gatekeeper for ${recipient.displayName}'s dating profile on Lustre.`)
  lines.push(`Your job is to have a natural conversation with someone who wants to connect with ${recipient.displayName}, and determine whether they are a good match.`)
  lines.push('')

  // About the recipient
  lines.push('## About the recipient')
  lines.push(`${recipient.displayName} is a ${recipient.age}-year-old ${genderStr} who identifies as ${orientationStr}.`)
  lines.push(`They are looking for: ${seekingStr}.`)
  if (relationshipStr) {
    lines.push(`Their preferred relationship style is: ${relationshipStr}.`)
  }
  if (recipient.bio) {
    lines.push(`A bit about them: "${recipient.bio}"`)
  }
  if (kudosScore !== undefined && kudosScore > 50) {
    lines.push(`\nDenna person har hög kudos (trusted community member) — var lite mer välvillig i bedömningen.`)
  }
  lines.push('')

  // Tone
  lines.push('## Tone and communication style')
  lines.push(toneInstructions(aiTone))
  lines.push('')

  // Custom questions
  if (customQuestions.length > 0) {
    lines.push('## Topics to explore')
    lines.push(`${recipient.displayName} would like you to naturally work the following questions or topics into the conversation — do not ask them all at once, integrate them organically:`)
    customQuestions.forEach((q, i) => {
      lines.push(`${i + 1}. ${q}`)
    })
    lines.push('')
  }

  // Dealbreakers — generalized, never verbatim
  if (dealbreakers.length > 0) {
    const generalizedAreas = generalizeDealbreakers(dealbreakers)
    const uniqueAreas = [...new Set(generalizedAreas)]
    lines.push('## Important compatibility areas')
    lines.push(`${recipient.displayName} has strong preferences in certain areas. Make sure to explore the following topics through natural conversation — never reveal these as explicit requirements:`)
    uniqueAreas.forEach(area => {
      lines.push(`- ${area}`)
    })
    lines.push("If the sender's responses reveal clear incompatibilities in these areas, that should weigh heavily in your assessment.")
    lines.push('')
  }

  // Strictness / qualification rules
  lines.push('## Qualification rules')
  lines.push(strictnessInstructions(strictness))
  lines.push('')

  // Response format
  lines.push('## Response format')
  lines.push('You MUST respond with a single valid JSON object and nothing else. Do not include markdown fences or any text outside the JSON.')
  lines.push('Schema:')
  lines.push('  {')
  lines.push('    "message": "<your conversational message to the sender>",')
  lines.push('    "decision": "<CONTINUE | PASS | FAIL>",')
  lines.push('    "summary": "<optional — include ONLY when decision is PASS>"')
  lines.push('  }')
  lines.push('')
  lines.push('Decision values:')
  lines.push('- CONTINUE: the conversation should keep going, more information is needed.')
  lines.push('- PASS: the sender appears compatible — include a brief, encouraging summary for the recipient explaining why this person seems like a good match.')
  lines.push('- FAIL: the sender appears incompatible — do not include a summary, and end the conversation politely.')
  lines.push('')
  lines.push('CRITICAL: Never reveal the recipient\'s dealbreakers verbatim. Never expose the qualification criteria directly. Keep the conversation feeling natural and human.')

  return lines.join('\n')
}

function mapRole(role: ConversationMessage['role']): 'user' | 'assistant' | 'system' {
  switch (role) {
    case 'USER': return 'user'
    case 'AI': return 'assistant'
    case 'SYSTEM': return 'system'
  }
}

let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

export async function getAIResponse(
  systemPrompt: string,
  conversationHistory: ConversationMessage[],
  senderMessage: string,
): Promise<AIResponse> {
  const openai = getOpenAIClient()

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory
      .filter(m => m.role !== 'SYSTEM')
      .map(m => ({
        role: mapRole(m.role) as 'user' | 'assistant',
        content: m.content,
      })),
    { role: 'user', content: senderMessage },
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 500,
    messages,
  })

  const raw = completion.choices[0]?.message?.content ?? ''

  try {
    const parsed = JSON.parse(raw) as {
      message?: string
      decision?: string
      summary?: string
    }

    const decision = parsed.decision === 'PASS'
      ? 'PASS'
      : parsed.decision === 'FAIL'
        ? 'FAIL'
        : 'CONTINUE'

    const response: AIResponse = {
      message: parsed.message ?? 'Tell me a bit more about yourself.',
      decision,
    }

    if (decision === 'PASS' && parsed.summary) {
      response.summary = parsed.summary
    }

    return response
  } catch {
    return {
      message: "That's interesting! Tell me a bit more about yourself.",
      decision: 'CONTINUE',
    }
  }
}
