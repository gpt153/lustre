# BodyContact.com — Competitive Recon Analysis
**Date:** 2026-03-24
**Status:** Active site, running since 1997

---

## 1. Site Overview

**URL:** http://www.bodycontact.com (NO HTTPS!)
**Tagline:** "BodyContact är en gratis seriös kontaktförmedling för sexkontakter"
**Tech stack:** PHP (legacy), Apache 2.2.15 on CentOS, ISO-8859-1 charset, jQuery 1.8.3, Dreamweaver templates
**Design era:** ~2012 (CSS file named bc2012.css/bc2013.css), IE9 compatibility hacks

### Key Numbers (from homepage + stats)
- **264,919 registered members** (total)
- **~97,300 active profiles** (from stats breakdown)
- **~5,900 currently online** (at time of crawl)
- **11,994 active kontaktannonser (personal ads)**
- **316,660 uploaded photos**
- **2,000+ new ads/day** (claimed)

### Subdomains
- `www.bodycontact.com` — public site, blog, forum, kontaktannonser
- `member.bodycontact.com` — member area (profiles, mail, search, settings)
- `register.bodycontact.com` — registration
- `status.bodycontact.com` — uptime/drift status
- `media.bodycontact.com` — static assets (flags, images)

---

## 2. Demographics & Statistics

### Gender Distribution (profiles)
| Gender | Count | % |
|--------|-------|---|
| Kille (Man) | 73,643 | 75.5% |
| Tjej (Woman) | 6,292 | 6.5% |
| Par (Couple) | 15,322 | 15.7% |
| Transperson | 1,724 | 1.8% |
| Killpar (M+M) | 337 | 0.3% |
| Tjejpar (F+F) | 23 | 0.0% |
| Grupp | 83 | 0.1% |
| Förening | 71 | 0.1% |

**KEY INSIGHT:** 75.5% men, only 6.5% women. ~12:1 ratio. This is THE core problem.

### Sexual Orientation
| Orientation | Count | % |
|------------|-------|---|
| Hetero | 48,510 | 49.9% |
| Bi | 20,113 | 20.7% |
| Binyfiken | 17,547 | 18.0% |
| Homo | 3,198 | 3.3% |
| Hemligt | 4,338 | 4.5% |
| Annan | 3,595 | 3.7% |

### Relationship Status
| Status | Count | % |
|--------|-------|---|
| Singel | 50,316 | 51.7% |
| Gift (Married) | 13,527 | 13.9% |
| Sambo | 11,607 | 11.9% |
| Annat | 12,719 | 13.1% |
| Partner | 3,691 | 3.8% |
| Särbo | 2,089 | 2.1% |
| Skild | 1,614 | 1.7% |
| Separerad | 1,513 | 1.6% |

### Age Distribution
- Very few 18-23 (single digits each!)
- Ramps up sharply at 24 (303)
- Peak ages: 25-55 range
- Core demographic: 30-50

### Ethnicity
- 88.6% Europeisk (Swedish site, makes sense)

### Kontaktannonser by Category
| Category | Count | % |
|----------|-------|---|
| Kille söker kille | 4,372 | 36.4% |
| Kille söker tjej | 2,341 | 19.5% |
| Kille söker par | 1,139 | 9.5% |
| Blandat | 718 | 6.0% |
| Par söker par | 483 | 4.0% |
| Par söker kille | 474 | 4.0% |
| Kinky/udda | 460 | 3.8% |
| Par söker tjej | 359 | 3.0% |
| Brevvänner | 198 | 1.7% |
| Tjej söker kille | 182 | 1.5% |
| Bondage/S&M | 145 | 1.2% |

---

## 3. Feature Map

### Public Features
- Homepage with stats
- Public kontaktannonser (browsable without login)
- 26 categories of personal ads
- Forum (12 sections)
- Blog (5 categories)
- Search (basic)
- Registration
- FAQ/Support

### Member Features
- **Profile:** name, age, gender (8 types), photos (5 standard, 100 PLUS), description, sexual orientation, relationship status, ethnicity, physical stats
- **Kontaktannonser:** create personal ads in categories
- **Brevlåda (Mailbox):** inbox, sent, saved, trash — internal messaging
- **Adressbok:** save favorite contacts
- **Ignorera/Blockera:** ignore or block users
- **Dagbok (Diary):** personal blog/diary
- **Bildmappar:** photo folders with permission controls
- **Avancerad sökning:** filter by gender, country, region, age, orientation, etc.
- **Online list:** see who's online
- **Visitors:** see who visited your profile (311 visits on test account)
- **Score/Rating:** thumbs up/down system

### PLUS Membership (Paid)
**Pricing:**
| Period | Cost |
|--------|------|
| 5 days | 10 SEK |
| 30 days | 50 SEK |
| 60 days | 100 SEK |
| 90 days | 150 SEK |
| 180 days | 250 SEK |
| 365 days | 500 SEK |

**PLUS Benefits:**
- 100 photos (vs 5 for free)
- Custom photo folders with permissions (by gender, age, specific users)
- 2048 char descriptions (vs 255)
- Filter messages by age (not just gender)
- See blocking stats on profiles
- Extended message info
- More features...

---

## 4. Technical Weaknesses

1. **No HTTPS** — massive security/privacy issue for a sex contact site
2. **ISO-8859-1** charset — should be UTF-8
3. **Apache 2.2.15 on CentOS** — ancient, likely unpatched
4. **XHTML 1.0 Strict** doctypes mixed with HTML5-era markup
5. **Dreamweaver templates** — `<!-- InstanceBegin -->` markers everywhere
6. **jQuery 1.8.3** — released 2012, full of known vulnerabilities
7. **No responsive design** — fixed-width layout, no mobile support
8. **No native app** — only web
9. **Classic Google Analytics** (ga.js, not gtag) — deprecated
10. **Facebook SDK** in Swedish locale only
11. **Plain HTTP cookies** — session cookies not Secure/HttpOnly (partially)
12. **Server-side rendering only** — no SPA/modern frontend
13. **XHR via xajax** — ancient PHP AJAX library
14. **Inline JavaScript** everywhere
15. **No CDN** — all static assets served from same Apache
16. **No WebSocket/real-time** — no live chat, no push notifications

---

## 5. UX Problems

1. **No mobile experience** — desktop-only in 2026
2. **Cluttered, text-heavy UI** — walls of links and text
3. **No photo previews** in kontaktannonser listings (text only)
4. **No matching algorithm** — purely manual browsing/search
5. **No verification system** — anyone can claim to be anything
6. **Basic search only** — checkboxes and text fields, no smart matching
7. **No chat** — only slow mailbox-style messages
8. **No push notifications** — must check site manually
9. **No swipe/card interface** — traditional listing format
10. **Profile descriptions limited to 255 chars** for free users
11. **The spam problem** — women get hundreds of irrelevant messages (as you identified)

---

## 6. Opportunity Analysis — The New Platform

### Core Problem to Solve
**The 12:1 male/female ratio creates a terrible experience for women**, who get overwhelmed with low-quality messages from men who haven't even read their profiles. This drives women away, which makes the ratio worse — a death spiral.

### Your AI Filter Idea — Deep Dive

**How it could work:**
1. Woman creates profile with detailed preferences (what she's looking for, dealbreakers, etc.)
2. When a man wants to contact her, he first interacts with an AI assistant
3. The AI knows her preferences and asks qualifying questions
4. Only men who genuinely match her criteria get through
5. The AI could also coach men on how to write better first messages

**Benefits:**
- Women feel safe and in control → more women join → better ratio
- Men get actionable feedback → better behavior overall
- Reduces spam/harassment dramatically
- Creates a quality signal (passed the AI filter = serious person)

### Additional Modern Features to Consider

1. **Photo verification** — AI-powered face matching to prevent catfishing
2. **Real-time chat** with read receipts (not mailbox system)
3. **Video chat** — safe in-app video calls
4. **Location-based** — "near me" with privacy controls
5. **Events/groups** — for clubs, munches, parties (swinger community loves events)
6. **Mobile-first** — React Native / Flutter app
7. **Content moderation AI** — auto-detect inappropriate unsolicited photos
8. **Kink matching algorithm** — compatibility scoring based on preferences
9. **Safety features** — share location with trusted friend, panic button, screenshot detection
10. **Consent-first design** — explicit consent flows for all interactions
11. **Premium model** — freemium with much higher value premium (not just more photos)

### Market Positioning

**BodyContact weaknesses to exploit:**
- No mobile app in 2026
- No HTTPS (privacy nightmare for this category)
- No real-time anything
- No AI or matching
- Spam problem drives women away
- Ancient UX from 2012
- Minimal moderation

**Potential differentiators:**
- "Women-first" design philosophy (Bumble proved this works)
- AI as concierge/gatekeeper
- Modern, inclusive, shame-free branding
- LGBTQ+ and kink-friendly from day one
- Safety and privacy as core features
- Swedish-first but built for Nordic expansion (NO, DK, FI)

### Revenue Model Ideas
| Tier | Price | Features |
|------|-------|----------|
| Free | 0 | Browse, basic profile, limited messages |
| Plus | 99 SEK/mo | Unlimited messages, advanced search, AI matchmaking |
| Premium | 199 SEK/mo | Video chat, priority in AI filter, read receipts, analytics |
| VIP | 499 SEK/mo | Highlighted profile, event hosting, verified badge |

BodyContact charges 500 SEK/year for basics — a modern platform could charge 2-4x with better value.

---

## 7. Crawled Data Location

All HTML files saved to: `~/bodycontact-recon/`
- `public/` — homepage, registration, terms, cookies, sitemap, status
- `member/` — profile, settings, mail, search, photos, stats (13 stat pages), PLUS info
- `kontaktannonser/` — all 26 categories + latest + search
- `forum/` — index (timeout, empty)
- `blog/` — index (timeout, empty)
- `pages/` — info pages (safe dating, etc.)
- `support/` — FAQ, support
- `css/` — bc2012.css, bc2013.css

**Total: 87 files, 2.9 MB**
