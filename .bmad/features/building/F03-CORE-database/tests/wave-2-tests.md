# Test Spec: Wave 2 — Search & Events

## T1: Meilisearch indexes and searches
- Deploy Meilisearch helm chart
- POST a document to a test index
- GET search query → expect the document returned

## T2: NATS publishes and receives events
- Deploy NATS helm chart
- Subscribe to a test subject
- Publish an event to the subject
- Expect: subscriber receives the event

## T3: API can publish events to NATS
- Start the API service with NATS_URL configured
- Call the event publisher utility
- Expect: no errors, event acknowledged by JetStream
