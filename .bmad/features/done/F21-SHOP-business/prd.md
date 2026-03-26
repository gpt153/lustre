# PRD: Business Webshops — Medusa.js In-App Stores

## Overview

Verified businesses get Medusa.js-powered webshops inside the app. Product catalog, pricing, order management, chat with customers, analytics. 10-15% commission on sales.

## Target Audience

Sex shops, underwear brands, health services

## Functional Requirements (FR)

### FR-1: Business Webshop Setup
- Priority: Must
- Acceptance criteria: Given a verified org, then they can create a product catalog with images, prices, descriptions

### FR-2: In-App Shopping
- Priority: Must
- Acceptance criteria: Given a buyer, then they can browse business products, add to cart, and pay via Swish

### FR-3: Order Management
- Priority: Must
- Acceptance criteria: Given a business, then they see incoming orders and can manage fulfillment

## MVP Scope

FR-1, FR-2 are MVP. Analytics and advanced features are Phase 2.

## Risks and Dependencies

- Depends on F12 (organizations), F20 (marketplace payment infrastructure)
- Medusa.js v2 deployment required
