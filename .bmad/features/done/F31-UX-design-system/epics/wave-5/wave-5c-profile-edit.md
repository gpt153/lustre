# Epic: wave-5c-profile-edit

**Model:** haiku
**Wave:** 5
**Group:** B (sequential — after 5a and 5b)

## Description

Rebuild the profile edit screen with prompt selection and reordering. Users choose 3 prompts from the curated list, write responses, and reorder photos and prompts via drag. Photo upload uses the existing R2 pipeline. The free-text bio field is hidden from the edit UI but the API field is preserved.

## Acceptance Criteria

1. Profile edit screen shows a "Prompts" section with up to 3 prompt slots.
2. Empty prompt slots show an "Add prompt" button that opens a picker with all available prompt options (from PROMPT_OPTIONS).
3. Each filled prompt slot shows the prompt question, the user's response (editable text area, max 500 chars), and a delete button.
4. Prompts and photos can be reordered via drag handles (long-press to initiate drag on mobile, drag handle icon on web).
5. Saving calls `profile.setPrompts` with the current prompts array.
6. Photo upload section uses the existing photo upload flow (R2 presigned URL) — no changes to upload pipeline.
7. The free-text "bio" field is not shown in the edit UI. Existing bio data is preserved in the database.
8. Preview button shows the profile as others would see it (using the new ProfileViewScreen layout).

## File Paths

- `packages/app/src/screens/ProfileEditScreen.tsx`
- `packages/app/src/components/PromptPicker.tsx` (new)
- `packages/app/src/components/PromptEditor.tsx` (new)
