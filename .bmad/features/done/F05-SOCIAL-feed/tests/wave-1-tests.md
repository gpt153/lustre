# Test Spec: Wave 1 — Post Schema & CRUD

## Tests

### T1.1: Post creation
- Call `post.create` with text "Hello world"
- Expect: Post returned with id, text, authorId, createdAt
- Expect: Post persisted in DB

### T1.2: Post with images
- Upload 2 images via POST /api/posts/upload
- Expect: PostMedia records created with urls
- Expect: R2 upload called with correct keys

### T1.3: Post list with pagination
- Create 25 posts
- Call `post.list` with limit 10
- Expect: 10 posts returned with nextCursor
- Call again with cursor
- Expect: next 10 posts returned

### T1.4: Post deletion
- Create a post, then call `post.delete`
- Expect: Post removed from DB
- Expect: Cannot delete other user's post (FORBIDDEN)

### T1.5: Content filter CRUD
- Call `contentFilter.get` (first time)
- Expect: Default filter created from profile's contentPreference
- Call `contentFilter.update` with custom nudityLevel
- Expect: Filter updated

### T1.6: Content filter presets
- Call `contentFilter.applyPreset` with SOFT
- Expect: nudityLevel = [NONE], bodyPart excludes GENITALS
