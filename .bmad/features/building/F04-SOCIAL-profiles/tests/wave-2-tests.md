# Test Spec: Wave 2 — Photo Upload & Search

## Tests
1. **Photo upload to R2** — Upload an image, verify it's stored in R2 and ProfilePhoto record created
2. **Three thumbnail sizes** — Upload image, verify small/medium/large thumbnails exist with correct dimensions
3. **Meilisearch returns profiles** — Create profiles, search with gender filter, verify correct results
4. **Kink tags assignable** — Set kink tags with interest levels, read back, verify correct
5. **Kink tag visibility** — Set tag as private, verify getPublic doesn't include it
6. **Max photos enforced** — Upload 10 photos, try 11th, expect error
7. **Search pagination** — Create 20 profiles, search with limit=10, verify pagination
