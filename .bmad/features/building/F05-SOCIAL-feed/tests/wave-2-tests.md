# Test Spec: Wave 2 — Classification & Feed Algorithm

## Tests

### T2.1: Image classification
- Upload an image, trigger classification
- Expect: ContentTag records created with dimension, value, confidence
- Expect: Tags across multiple dimensions

### T2.2: Classification graceful degradation
- Simulate Sightengine API failure
- Expect: Post upload still succeeds
- Expect: Warning logged, no tags created

### T2.3: Feed algorithm ranking
- Create posts with different ages and tags
- Call `post.feed`
- Expect: Posts ordered by relevance score (newer posts higher)
- Expect: Posts matching user interests score higher

### T2.4: Like and show less
- Like a post via `post.like`
- Expect: FeedInteraction with type LIKE created
- Show less a post via `post.showLess`
- Expect: FeedInteraction with type SHOW_LESS created
- Expect: Post appears lower in feed on next fetch

### T2.5: Content filter exclusion
- Set user filter to nudityLevel: [NONE]
- Create post with media tagged FULL nudity
- Call `post.feed`
- Expect: Tagged post NOT in results

### T2.6: Unclassified posts shown
- Create post with no media tags
- Call `post.feed`
- Expect: Unclassified post appears in feed
