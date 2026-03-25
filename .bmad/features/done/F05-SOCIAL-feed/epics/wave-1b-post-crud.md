# Epic: wave-1b-post-crud

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — after 1a)

## Description

Create tRPC router for post CRUD operations: create (text + image upload), get single, list with cursor pagination, delete own post. Add REST endpoint for post media upload to R2.

## Acceptance Criteria

1. `post.create` — protectedProcedure, input: text (string, max 2000), creates Post with authorId from ctx
2. `post.get` — protectedProcedure, input: postId (uuid), returns Post with media and author displayName
3. `post.list` — protectedProcedure, input: cursor (optional string), limit (default 20), returns posts with media, author info, cursor-based pagination (use createdAt + id as cursor)
4. `post.delete` — protectedProcedure, input: postId (uuid), only own posts, deletes media from R2 too
5. REST `POST /api/posts/upload` — authenticated, multipart, accepts up to 4 images, processes with sharp (same as profile photos), uploads to R2 at `posts/{postId}/media/{mediaId}/{size}.webp`, creates PostMedia records
6. `postRouter` registered in `appRouter` as `post`
7. R2 key helper `getPostMediaKey(postId, mediaId, size)` added to `r2.ts`

## File Paths

- `services/api/src/trpc/post-router.ts` (new)
- `services/api/src/trpc/router.ts` (add postRouter)
- `services/api/src/lib/r2.ts` (add getPostMediaKey)
- `services/api/src/server.ts` (add POST /api/posts/upload endpoint)
