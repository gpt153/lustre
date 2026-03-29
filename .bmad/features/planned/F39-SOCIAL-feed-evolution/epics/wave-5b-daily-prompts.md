# Epic: wave-5b-daily-prompts

**Model:** haiku
**Wave:** 5
**Group:** A (parallel with 5a)

## Description

Daily prompt system with 100+ seeded prompts ranging from vanilla to spicy. Users answer with text, photo, or voice note. Prompts rotate daily.

## Acceptance Criteria

1. Seed 100+ prompts in `DailyPrompt` table via `services/api/prisma/seed.ts`:
   - ~40 VANILLA prompts: "Beskriv din perfekta söndagsmorgon", "Bästa dejten du varit på?", "Vad får dig att skratta?", etc.
   - ~30 SULTRY prompts: "Din bästa flirt-story?", "Vad gör en person attraktiv?", "Beskriv en perfekt kyss", etc.
   - ~20 STEAMY prompts: "Vad gör dig kåt som inte borde göra dig kåt?", "Beskriv din senaste fantasi", etc.
   - ~10 EXPLICIT prompts: "Vilken är din favorit-position och varför?", etc.
   - All prompts in Swedish
2. Daily rotation: `prompt.getToday` returns one prompt per spicy level per day. Selection: hash of `date + spicyLevel` determines which prompt is shown. Deterministic — same day returns same prompt for all users at that level
3. tRPC procedures:
   - `prompt.getToday` (query): returns today's prompt(s) matching viewer's active spicy levels
   - `prompt.getRecent` (query): returns last 7 days of prompts (for answering older prompts)
   - `prompt.respond` (mutation): creates Post with postType=PROMPT_RESPONSE, promptId set, accepts text + optional mediaId + optional voiceNoteUrl
4. Voice note support:
   - Recording via `expo-av` Audio (30-60 seconds max)
   - Upload to R2 at `posts/<postId>/voice.m4a`
   - New field on Post: `voiceNoteUrl String?`
   - Playback: inline audio player in feed (play/pause button with waveform visualization)
5. Feed display: prompt responses show the prompt question above the answer (italicized, smaller text)
6. Profile gallery: prompt responses show with prompt text badge on thumbnail

## File Paths

- `services/api/prisma/seed.ts` (update — add 100+ prompts)
- `services/api/src/trpc/prompt-router.ts` (new)
- `services/api/src/trpc/router.ts` (register prompt router)
- `services/api/src/trpc/post-router.ts` (update — handle voice note URL)
- `services/api/prisma/schema.prisma` (add voiceNoteUrl to Post)
- `packages/app/src/components/VoiceNotePlayer.tsx` (new)
- `packages/app/src/components/VoiceNoteRecorder.tsx` (new)
- `packages/app/src/hooks/useVoiceNote.ts` (new)
