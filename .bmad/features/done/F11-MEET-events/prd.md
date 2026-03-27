# PRD: Events — Create, Discover, Attend, Ticketing

## Overview

Event system for online (video), IRL, and hybrid events. Creators set target demographics, pricing, and capacity. Discovery via map, calendar, and AI recommendations. Ticketing with Swish payment. Post-event connections ("you were at the same event").

## Target Audience

Event organizers (clubs, individuals), attendees

## Functional Requirements (FR)

### FR-1: Event Creation
- Priority: Must
- Acceptance criteria:
  - Given an organizer, when creating an event, then they set title, description, date/time, location, type (online/IRL/hybrid), capacity, price, and target demographics (gender, age range, interests)
  - Given targeting, then only matching profiles can see the event

### FR-2: Event Discovery
- Priority: Must
- Acceptance criteria:
  - Given the Events tab, when viewing, then events are shown in list, map, and calendar views
  - Given filters (date, type, distance, category), then results are filtered accordingly

### FR-3: RSVP & Ticketing
- Priority: Must
- Acceptance criteria:
  - Given a free event, when RSVPing, then the user is added to the guest list
  - Given a paid event, when purchasing a ticket, then payment is processed via Swish/Segpay

### FR-4: Event Chat
- Priority: Should
- Acceptance criteria:
  - Given an event, then attendees can chat in a group channel

### FR-5: Post-Event Connections
- Priority: Could
- Acceptance criteria:
  - Given two attendees, when the event ends, then they are suggested to each other (opt-in)

## MVP Scope

FR-1, FR-2, FR-3 are MVP.

## Risks and Dependencies

- Depends on F04 (profiles for targeting), F23 (tokens for paid events), F09 (chat for event chat)
