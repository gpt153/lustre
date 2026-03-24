# Test Spec: Wave 3 — Feed Screens

## Tests

### T3.1: Feed screen loads
- Render FeedScreen component
- Expect: Posts displayed in scrollable list
- Expect: Each post shows author name, text, images

### T3.2: Infinite scroll
- Scroll to bottom of feed
- Expect: More posts loaded automatically
- Expect: Loading indicator shown during fetch

### T3.3: Post creation flow
- Navigate to create post screen
- Enter text, select images, submit
- Expect: Post appears in feed after creation

### T3.4: Like interaction
- Tap like button on post card
- Expect: Like count increments
- Expect: Button shows liked state

### T3.5: Show less interaction
- Tap "show less" on post card menu
- Expect: Post removed from current view
- Expect: Similar content deprioritized on refresh

### T3.6: Web responsive layout
- Render feed on web at different widths
- Expect: Single column on mobile viewport
- Expect: Centered container on desktop
