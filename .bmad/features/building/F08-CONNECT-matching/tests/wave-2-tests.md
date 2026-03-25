# Test Spec: Wave 2 — Matching Screens

## T1: Swipe cards work smoothly on mobile
- Open discover tab on mobile
- Profile cards render with photo, name, age
- Swipe right triggers LIKE mutation
- Swipe left triggers PASS mutation
- Next card appears after swipe

## T2: Mutual match triggers animation and notification
- Simulate mutual like scenario
- Verify match animation overlay appears
- Overlay shows matched profile info
- Dismiss button closes the overlay

## T3: Search filters return expected results
- Open search screen
- Apply gender filter → results update
- Apply age range → results narrow
- Clear filters → all results shown
