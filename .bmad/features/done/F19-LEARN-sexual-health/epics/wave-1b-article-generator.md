# Epic: wave-1b-article-generator

**Wave:** 1 — Group A (parallel)
**Model:** sonnet
**Status:** NOT_STARTED

## Goal

Build an AI article generation pipeline using Anthropic Claude SDK. Create a script that generates 800–1200 word Swedish sexual health articles for all seeded topics and stores them in the database.

## Codebase Context

- **AI pattern:** `services/api/src/lib/gatekeeper-ai.ts` uses OpenAI client. For this feature use `@anthropic-ai/sdk` (Anthropic). Model: `claude-sonnet-4-6`
- **Prisma client usage:** Import `prisma` from `'../lib/prisma.js'` or instantiate `new PrismaClient()`
- **Script pattern:** Scripts in `services/api/scripts/` use `npx tsx services/api/scripts/<name>.ts`
- **Env vars:** Add `ANTHROPIC_API_KEY` to env (not yet present in codebase)
- **Wave 1a dependency:** This epic is developed in parallel with 1a. The Prisma schema changes from 1a will be merged before running this script. Write code that matches the schema defined in epic 1a.

## File Paths

1. `services/api/src/lib/education-ai.ts` — Anthropic integration for article generation
2. `services/api/scripts/generate-articles.ts` — CLI script to generate and store all articles
3. `services/api/package.json` — add `@anthropic-ai/sdk` dependency if not present

## Implementation Details

### education-ai.ts

```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface GeneratedArticle {
  title: string
  content: string  // markdown
  readingTimeMinutes: number
}

export async function generateArticle(
  topicTitle: string,
  topicDescription: string,
  category: string,
  audience: string,  // ALL | WOMEN | MEN | NON_BINARY | COUPLES
  language: string   // sv | en
): Promise<GeneratedArticle>
```

The function builds a system prompt instructing Claude to:
- Write a 800-1200 word informative, sex-positive, non-judgmental article in Swedish (or English)
- Include introduction, 3-4 sections with headers, and conclusion
- Use plain language, avoid jargon
- Tailor content to the specified audience if not ALL
- Return ONLY the article in markdown format (no preamble)

Estimate readingTimeMinutes as Math.ceil(wordCount / 200).

### generate-articles.ts

Script flow:
1. Connect to DB via PrismaClient
2. Fetch all topics from education_topics
3. For each topic, generate articles for audiences: ['ALL'] (one per topic, language: 'sv')
4. Upsert into education_articles (unique by topicId + audience + language)
5. Log progress: "Generated: <topic title> [audience]"
6. Disconnect DB

Use `Promise.allSettled` with batches of 3 topics to avoid rate limits.

## Acceptance Criteria

1. `education-ai.ts` exports `generateArticle(topicTitle, topicDesc, category, audience, language)` function
2. Function calls Claude claude-sonnet-4-6 with a Swedish-language prompt for sexual health education
3. Generated articles are 800–1200 words in markdown format
4. Articles include appropriate medical disclaimer appended at end: `> ⚕️ Denna information ersätter inte professionell medicinsk rådgivning. Vid frågor om din hälsa, kontakta en läkare.`
5. `readingTimeMinutes` is estimated as Math.ceil(wordCount / 200)
6. `generate-articles.ts` script fetches all topics and generates 1 article per topic (audience: ALL, language: sv)
7. Script upserts articles — safe to re-run without creating duplicates
8. Script processes topics in batches of 3 (concurrent) to avoid API rate limits
9. `@anthropic-ai/sdk` added as dependency in `services/api/package.json`
10. Script can be executed with: `npx tsx services/api/scripts/generate-articles.ts`
